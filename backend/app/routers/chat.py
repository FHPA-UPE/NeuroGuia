import json
import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.chat import ChatRequest
from app.services.llm_service import LlmService
from app.services.rag_service import RagService

router = APIRouter()
llm_service = LlmService()
rag_service = RagService(
    persist_dir=os.getenv("CHROMA_PERSIST_DIR", "./data/chroma"),
    docs_dir=os.getenv("DOCS_DIR", "./data/docs"),
)


async def stream_resposta(request: ChatRequest):
    context, chunks = rag_service.buscar_com_chunks(request.message)
    response = llm_service.responder(
        message=request.message,
        context=context,
        history=request.history,
    )
    response.contexts = chunks
    data = json.dumps(response.model_dump())
    yield f"data: {data}\n\n"


@router.post("/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_resposta(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
