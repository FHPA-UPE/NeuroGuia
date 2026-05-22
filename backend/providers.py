import os
from typing import Any

import litellm
from langchain_openai import OpenAIEmbeddings
from services import secret_service
from services.config_service import read_config


def _get_key(name: str) -> str:
    """Look up a secret key in secrets.json first, then fall back to env vars."""
    return secret_service.get_key(name) or os.getenv(name, '')


def get_embeddings() -> Any:
    cfg = read_config()
    provider = cfg.get("embed_provider", "openai")
    model = cfg.get("embed_model", "text-embedding-3-small")
    if provider == "openai":
        return OpenAIEmbeddings(model=model, openai_api_key=_get_key('OPENAI_API_KEY'))
    raise ValueError(f"Embed provider não suportado: {provider}")


def mask_key(key: str) -> str:
    if len(key) <= 4:
        return "***"
    return f"***{key[-4:]}"


async def call_llm_stream(messages: list[dict]):
    cfg = read_config()
    provider = cfg.get("llm_provider", "anthropic")
    model = cfg.get("llm_model", "claude-haiku-4-5-20251001")
    litellm_model = f"{provider}/{model}"

    # inject secret keys into env for litellm
    for name in ('ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GOOGLE_API_KEY'):
        val = secret_service.get_key(name)
        if val:
            os.environ[name] = val

    response = await litellm.acompletion(
        model=litellm_model,
        messages=messages,
        temperature=0.3,
        timeout=30,
        stream=True,
    )
    async for chunk in response:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
