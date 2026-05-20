import os
from typing import Any

import litellm
from langchain_openai import OpenAIEmbeddings
from services.config_service import read_config


def get_embeddings() -> Any:
    cfg = read_config()
    provider = cfg.get("embed_provider", "openai")
    model = cfg.get("embed_model", "text-embedding-3-small")
    if provider == "openai":
        return OpenAIEmbeddings(model=model, openai_api_key=os.getenv("OPENAI_API_KEY", ""))
    raise ValueError(f"Embed provider não suportado: {provider}")


def mask_key(key: str) -> str:
    if len(key) <= 4:
        return "***"
    return f"***{key[-4:]}"


async def call_llm_stream(messages: list[dict]):
    cfg = read_config()
    provider = cfg["llm_provider"]
    model = cfg["llm_model"]
    litellm_model = f"{provider}/{model}"

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
