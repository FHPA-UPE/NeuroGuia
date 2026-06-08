import asyncio
import json
import logging
import re
from typing import AsyncGenerator, Optional

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

import auth as auth_module
from persona import build_messages
from providers import call_llm_stream, get_embeddings
from services import config_service
from services import rag_service

router = APIRouter(tags=["chat"])
# auto_error=False so we control the response code (403 instead of 401)
security = HTTPBearer(auto_error=False)

COLD_START_MSG = {
    "message": "Ainda não tenho documentos para consultar. Um administrador precisa adicionar a base de conhecimento primeiro.",
    "avatar_state": "empathetic",
    "movement": "talking",
    "quick_replies": [],
    "sources": [],
}


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido")
    try:
        return auth_module.verify_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido")


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


def _filter_sources(sources: list) -> list:
    """Keep only entries that look like real document names (have a file extension)."""
    return [s for s in sources if isinstance(s, str) and '.' in s]


async def _stream(request: ChatRequest) -> AsyncGenerator:
    cfg = config_service.read_config()
    system_prompt = cfg["system_prompt"]

    if rag_service._get_collection_count() == 0:
        yield {"data": json.dumps(COLD_START_MSG)}
        yield {"event": "done", "data": "{}"}
        return

    embeddings = get_embeddings()
    docs = rag_service.retrieve(request.message, embeddings)
    context = "\n\n".join(
        f"[Fonte: {doc.metadata.get('source', 'Documento')}]\n{doc.page_content}"
        for doc in docs
    )

    messages = build_messages(system_prompt, request.history, request.message, context)

    heartbeat_task = asyncio.create_task(_heartbeat())
    buffer = ""
    try:
        async for token in call_llm_stream(messages):
            buffer += token

        parsed = _parse_json_response(buffer)
        parsed["sources"] = _filter_sources(parsed.get("sources", []))
        yield {"data": json.dumps(parsed, ensure_ascii=False)}
    except Exception as e:
        logger.exception("Erro na chamada ao LLM: %s", e)
        err_str = str(e).lower()
        if "ratelimit" in err_str or "429" in err_str or "quota" in err_str or "resource_exhausted" in err_str:
            message = "Cota da API do provedor de IA esgotada. Verifique seu plano e limites de uso nas configurações."
        elif "timeout" in err_str or "timed out" in err_str:
            message = "Ops, demorei demais para responder. Tente novamente."
        else:
            message = "Ocorreu um erro ao processar sua mensagem. Tente novamente."
        yield {"data": json.dumps({
            "message": message,
            "avatar_state": "empathetic", "movement": "talking",
            "quick_replies": [], "sources": [],
        })}
    finally:
        heartbeat_task.cancel()
        yield {"event": "done", "data": "{}"}


async def _heartbeat():
    while True:
        await asyncio.sleep(15)


def _parse_json_response(text: str) -> dict:
    text = text.strip()
    decoder = json.JSONDecoder()

    # Try direct parse first (model returned bare JSON)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Search for a code block anywhere (handles thinking-token preamble before ```json)
    code_block = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', text, re.DOTALL)
    if code_block:
        inner = code_block.group(1).strip()
        try:
            return json.loads(inner)
        except json.JSONDecodeError:
            pass

    # Scan for JSON objects right-to-left: thinking content always comes before the JSON,
    # so the rightmost { is most likely the start of the actual response object.
    for m in sorted(re.finditer(r'\{', text), key=lambda x: x.start(), reverse=True):
        try:
            result, _ = decoder.raw_decode(text, m.start())
            if isinstance(result, dict) and "message" in result:
                return result
        except json.JSONDecodeError:
            pass

    # Recover message field from truncated JSON (no closing brace/quote)
    msg_match = re.search(r'"message"\s*:\s*"((?:[^"\\]|\\.)*?)(?:"|\Z)', text, re.DOTALL)
    if msg_match:
        raw = msg_match.group(1)
        try:
            message = json.loads(f'"{raw}"')  # unescape \n, \t, \" etc.
        except json.JSONDecodeError:
            message = raw
        return {
            "message": message,
            "avatar_state": "neutral",
            "movement": "talking",
            "quick_replies": [],
            "sources": [],
        }

    logger.warning("Falha ao parsear resposta do LLM. Primeiros 200 chars: %r", text[:200])
    return {
        "message": text[:500] if text else "Não consegui processar a resposta.",
        "avatar_state": "neutral",
        "movement": "talking",
        "quick_replies": [],
        "sources": [],
    }


@router.post("/chat")
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    return EventSourceResponse(_stream(request))
