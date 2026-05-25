# Config ML Params Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expor 5 parâmetros de ML na página de Configurações: `temperature`, `max_tokens` (LLM) e `retrieval_k`, `score_threshold`, `chunk_size` (RAG).

**Architecture:** Schema-first — config.json recebe os 5 novos campos com defaults; backend lê via `read_config()` substituindo valores hardcoded; frontend adiciona dois novos cards com `<input type="number">`. O score_threshold usa filtragem pós-reranking com scores sigmoid-normalizados (0–1).

**Tech Stack:** FastAPI + Pydantic v2, LiteLLM, LangChain (langchain-classic 1.0.7), HuggingFaceCrossEncoder, Next.js 15 / TypeScript / Tailwind CSS 4, pytest + pytest-asyncio.

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `backend/config.json` | Modificar | Adicionar 5 campos com defaults |
| `backend/tests/test_scaffold.py` | Modificar | Verificar novos campos obrigatórios |
| `backend/routers/config.py` | Modificar | `ConfigUpdate` + `put_config` + GET response |
| `backend/tests/test_config_router.py` | Modificar | Testes para novos campos |
| `backend/providers.py` | Modificar | Ler `temperature` e `max_tokens` do config |
| `backend/tests/test_providers.py` | Criar | Testar kwargs passados ao LiteLLM |
| `backend/services/rag_service.py` | Modificar | Refatorar `retrieve()` com `retrieval_k` + `score_threshold` |
| `backend/tests/test_rag_service.py` | Modificar | Testar filtragem por k e threshold |
| `backend/services/ingest_service.py` | Modificar | `load_and_chunk` dinâmico com `chunk_size` |
| `backend/tests/test_ingest_service.py` | Modificar | Verificar que `chunk_size` do config é usado |
| `src/app/config/page.tsx` | Modificar | Dois novos cards + 5 novos campos na UI |

---

## Task 1: Atualizar config.json com defaults dos novos campos

**Files:**
- Modify: `backend/config.json`
- Modify: `backend/tests/test_scaffold.py`

- [ ] **Step 1: Atualizar config.json**

Substituir o conteúdo de `backend/config.json` por:

```json
{
  "system_prompt": "Você é OWL (Orientação, Wellbeing e Letramento), um assistente acadêmico\n  da pós-graduação em Computação Aplicada à Educação (PPGEC/UPE). Você apoia\n   estudantes neurodivergentes — pessoas com dislexia, TDAH, autismo e\n  outras formas de neurodivergência — em sua jornada no mestrado e\n  doutorado.\n\n  ## Identidade e tom\n  - Nome: OWL. Nunca se apresente como IA genérica ou chatbot.\n  - Tom: acolhedor, direto, paciente, sem jargão acadêmico desnecessário.\n  - Você nunca julga dificuldades, prazos perdidos ou perguntas \"básicas\".\n  - Você comemora pequenas conquistas com entusiasmo genuíno.\n  - Quando não souber algo, diz claramente: \"Não tenho essa informação no\n  momento.\"\n\n  ## Comunicação acessível (neurodivergência)\n  - Use frases curtas. Máximo 3 linhas por parágrafo.\n  - Prefira listas com marcadores a blocos de texto denso.\n  - Destaque a informação mais importante no início da resposta.\n  - Evite sarcasmo, ironia, metáforas vagas e linguagem figurada.\n  - Se a pergunta for ambígua, peça esclarecimento em vez de adivinhar.\n  - Ofereça uma coisa de cada vez. Não sobrecarregue com múltiplas ações.\n\n  ## Base de conhecimento (RAG)\n  Use o contexto abaixo para responder. Se o contexto não contiver a\n  informação, diga isso claramente.\n\n  [CONTEXTO RECUPERADO DO CHROMADB]\n\n  ## Seleção de avatar_state\n  - \"neutral\": respostas informativas, consultas factuais.\n  - \"happy\": conquistas do estudante, boas notícias, progresso.\n  - \"encouraging\": insegurança, medo de errar, procrastinação.\n  - \"empathetic\": estresse, sobrecarga, frustração, tristeza.\n  - \"thoughtful\": perguntas complexas, reflexão acadêmica profunda.\n\n  ## Seleção de movement\n  - \"talking\": resposta ativa (use em quase todos os casos).\n  - \"idle\": resposta muito curta de confirmação.\n\n  ## quick_replies\n  - Máximo 4 opções, no máximo 5 palavras cada.\n  - Omita (array vazio) após acolhimento emocional.\n\n  ## Limites\n  OWL FAZ: responder sobre disciplinas, prazos, normas ABNT, metodologia\n  PPGEC, estruturar tarefas, apoio emocional leve.\n  OWL NÃO FAZ: escrever trabalhos completos, fornecer gabaritos, dar\n  diagnósticos médicos.\n\n  ## Formato de saída — OBRIGATÓRIO\n  Responda SEMPRE com um único objeto JSON válido:\n  {\n    \"message\": \"Texto em português. Pode usar markdown básico.\",\n    \"avatar_state\": \"neutral|happy|encouraging|empathetic|thoughtful\",\n    \"movement\": \"idle|talking\",\n    \"quick_replies\": [\"Opção 1\", \"Opção 2\"],\n    \"sources\": [\"Conhecimento / treinamento do modelo\"]\n  }",
  "llm_provider": "google",
  "llm_model": "gemini-2.5-flash",
  "llm_temperature": 0.3,
  "llm_max_tokens": 1024,
  "embed_provider": "google",
  "embed_model": "models/gemini-embedding-001",
  "rag_retrieval_k": 6,
  "rag_chunk_size": 900,
  "rag_score_threshold": 0.0
}
```

- [ ] **Step 2: Atualizar test_scaffold.py para incluir os novos campos**

Em `backend/tests/test_scaffold.py`, substituir:

```python
def test_config_json_has_required_keys():
    cfg = json.loads((BACKEND / "config.json").read_text(encoding="utf-8"))
    for key in ("system_prompt", "llm_provider", "llm_model", "embed_provider", "embed_model"):
        assert key in cfg, f"config.json missing key: {key}"
```

por:

```python
def test_config_json_has_required_keys():
    cfg = json.loads((BACKEND / "config.json").read_text(encoding="utf-8"))
    required = (
        "system_prompt", "llm_provider", "llm_model",
        "llm_temperature", "llm_max_tokens",
        "embed_provider", "embed_model",
        "rag_retrieval_k", "rag_chunk_size", "rag_score_threshold",
    )
    for key in required:
        assert key in cfg, f"config.json missing key: {key}"
```

- [ ] **Step 3: Rodar testes de scaffold**

```bash
cd backend && pytest tests/test_scaffold.py -v
```

Esperado: todos passam.

- [ ] **Step 4: Commit**

```bash
git add backend/config.json backend/tests/test_scaffold.py
git commit -m "feat(config): adicionar campos ML ao schema de config.json"
```

---

## Task 2: Atualizar router de config (GET + PUT)

**Files:**
- Modify: `backend/routers/config.py`
- Modify: `backend/tests/test_config_router.py`

- [ ] **Step 1: Escrever os testes novos (falharão até a implementação)**

Adicionar ao final de `backend/tests/test_config_router.py`:

```python
def test_get_config_returns_ml_params(monkeypatch):
    from main import app
    client = TestClient(app)
    resp = client.get("/config", headers={"Authorization": f"Bearer {_admin_token()}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "llm_temperature" in data
    assert "llm_max_tokens" in data
    assert "rag_retrieval_k" in data
    assert "rag_chunk_size" in data
    assert "rag_score_threshold" in data
    assert data["llm_temperature"] == pytest.approx(0.3)


def test_put_config_saves_ml_params():
    from main import app
    client = TestClient(app)
    payload = {
        "system_prompt": "teste",
        "llm_provider": "openai",
        "llm_model": "gpt-4o-mini",
        "embed_provider": "openai",
        "embed_model": "text-embedding-3-small",
        "llm_temperature": 0.1,
        "llm_max_tokens": 512,
        "rag_retrieval_k": 4,
        "rag_chunk_size": 600,
        "rag_score_threshold": 0.5,
    }
    with patch("services.config_service.write_config") as mock_write:
        resp = client.put("/config", json=payload,
                          headers={"Authorization": f"Bearer {_admin_token()}"})
    assert resp.status_code == 200
    saved = mock_write.call_args[0][0]
    assert saved["llm_temperature"] == pytest.approx(0.1)
    assert saved["rag_retrieval_k"] == 4
    assert saved["rag_score_threshold"] == pytest.approx(0.5)


def test_put_config_rejects_invalid_temperature():
    from main import app
    client = TestClient(app)
    payload = {
        "system_prompt": "teste",
        "llm_provider": "openai",
        "llm_model": "gpt-4o-mini",
        "embed_provider": "openai",
        "embed_model": "text-embedding-3-small",
        "llm_temperature": 2.0,  # inválido: max é 1.0
    }
    resp = client.put("/config", json=payload,
                      headers={"Authorization": f"Bearer {_admin_token()}"})
    assert resp.status_code == 422


def test_put_config_omits_none_fields():
    """Campos opcionais não enviados não devem sobrescrever valores existentes."""
    from main import app
    client = TestClient(app)
    payload = {
        "system_prompt": "só prompt",
        "llm_provider": "google",
        "llm_model": "gemini-2.5-flash",
        "embed_provider": "google",
        "embed_model": "models/gemini-embedding-001",
        # llm_temperature não enviado — não deve virar None no config
    }
    captured = {}
    def fake_write(data):
        captured.update(data)

    with patch("services.config_service.write_config", side_effect=fake_write):
        resp = client.put("/config", json=payload,
                          headers={"Authorization": f"Bearer {_admin_token()}"})
    assert resp.status_code == 200
    assert "llm_temperature" not in captured or captured.get("llm_temperature") is not None
```

- [ ] **Step 2: Rodar os novos testes para confirmar que falham**

```bash
cd backend && pytest tests/test_config_router.py::test_get_config_returns_ml_params tests/test_config_router.py::test_put_config_saves_ml_params -v
```

Esperado: FAIL.

- [ ] **Step 3: Atualizar `routers/config.py`**

Substituir o conteúdo de `backend/routers/config.py` por:

```python
import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

import auth as auth_module
from providers import mask_key
from services import config_service, secret_service

router = APIRouter(prefix="/config", tags=["config"])
security = HTTPBearer(auto_error=False)


def _require_admin(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token ausente")
    try:
        user = auth_module.verify_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido")
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requer perfil admin")
    return user


class ConfigUpdate(BaseModel):
    system_prompt: str
    llm_provider: str
    llm_model: str
    llm_temperature: float | None = Field(None, ge=0.0, le=1.0)
    llm_max_tokens: int | None = Field(None, ge=256, le=4096)
    embed_provider: str
    embed_model: str
    rag_retrieval_k: int | None = Field(None, ge=1, le=20)
    rag_chunk_size: int | None = Field(None, ge=200, le=2000)
    rag_score_threshold: float | None = Field(None, ge=0.0, le=1.0)
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    google_api_key: str | None = None


@router.get("")
async def get_config(user: dict = Depends(_require_admin)):
    cfg = config_service.read_config()
    return {
        **cfg,
        "anthropic_api_key": mask_key(secret_service.get_key("ANTHROPIC_API_KEY") or os.getenv("ANTHROPIC_API_KEY", "")),
        "openai_api_key": mask_key(secret_service.get_key("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY", "")),
        "google_api_key": mask_key(secret_service.get_key("GOOGLE_API_KEY") or os.getenv("GOOGLE_API_KEY", "")),
    }


@router.put("")
async def put_config(body: ConfigUpdate, user: dict = Depends(_require_admin)):
    cfg = config_service.read_config()
    cfg.update(body.model_dump(
        exclude={"anthropic_api_key", "openai_api_key", "google_api_key"},
        exclude_none=True,
    ))
    config_service.write_config(cfg)
    secret_service.set_keys({
        "ANTHROPIC_API_KEY": body.anthropic_api_key or "",
        "OPENAI_API_KEY": body.openai_api_key or "",
        "GOOGLE_API_KEY": body.google_api_key or "",
    })
    return {"status": "saved"}
```

- [ ] **Step 4: Rodar todos os testes do router**

```bash
cd backend && pytest tests/test_config_router.py -v
```

Esperado: todos passam.

- [ ] **Step 5: Commit**

```bash
git add backend/routers/config.py backend/tests/test_config_router.py
git commit -m "feat(config): expor parâmetros ML no endpoint GET/PUT /config"
```

---

## Task 3: Atualizar providers.py (temperature + max_tokens)

**Files:**
- Modify: `backend/providers.py`
- Create: `backend/tests/test_providers.py`

- [ ] **Step 1: Criar test_providers.py com testes falhando**

Criar `backend/tests/test_providers.py`:

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


def _make_chunk(content: str | None):
    chunk = MagicMock()
    chunk.choices = [MagicMock()]
    chunk.choices[0].delta = MagicMock()
    chunk.choices[0].delta.content = content
    return chunk


@pytest.mark.asyncio
async def test_call_llm_stream_passes_temperature_from_config():
    cfg = {
        "llm_provider": "openai",
        "llm_model": "gpt-4o-mini",
        "llm_temperature": 0.1,
    }

    async def _fake_stream():
        yield _make_chunk("ok")

    mock_acomp = AsyncMock(return_value=_fake_stream())

    with patch("providers.read_config", return_value=cfg), \
         patch("providers._get_key", return_value=""), \
         patch("litellm.acompletion", mock_acomp):
        from providers import call_llm_stream
        tokens = [t async for t in call_llm_stream([{"role": "user", "content": "x"}])]

    assert tokens == ["ok"]
    called_kwargs = mock_acomp.call_args.kwargs
    assert called_kwargs["temperature"] == pytest.approx(0.1)


@pytest.mark.asyncio
async def test_call_llm_stream_passes_max_tokens_from_config():
    cfg = {
        "llm_provider": "openai",
        "llm_model": "gpt-4o-mini",
        "llm_temperature": 0.3,
        "llm_max_tokens": 512,
    }

    async def _fake_stream():
        yield _make_chunk("hello")

    mock_acomp = AsyncMock(return_value=_fake_stream())

    with patch("providers.read_config", return_value=cfg), \
         patch("providers._get_key", return_value=""), \
         patch("litellm.acompletion", mock_acomp):
        from providers import call_llm_stream
        [t async for t in call_llm_stream([{"role": "user", "content": "x"}])]

    called_kwargs = mock_acomp.call_args.kwargs
    assert called_kwargs["max_tokens"] == 512


@pytest.mark.asyncio
async def test_call_llm_stream_omits_max_tokens_when_not_in_config():
    cfg = {
        "llm_provider": "openai",
        "llm_model": "gpt-4o-mini",
        "llm_temperature": 0.3,
        # sem llm_max_tokens
    }

    async def _fake_stream():
        yield _make_chunk(None)

    mock_acomp = AsyncMock(return_value=_fake_stream())

    with patch("providers.read_config", return_value=cfg), \
         patch("providers._get_key", return_value=""), \
         patch("litellm.acompletion", mock_acomp):
        from providers import call_llm_stream
        [t async for t in call_llm_stream([{"role": "user", "content": "x"}])]

    called_kwargs = mock_acomp.call_args.kwargs
    assert "max_tokens" not in called_kwargs


@pytest.mark.asyncio
async def test_call_llm_stream_uses_default_temperature_when_not_in_config():
    cfg = {
        "llm_provider": "openai",
        "llm_model": "gpt-4o-mini",
        # sem llm_temperature
    }

    async def _fake_stream():
        yield _make_chunk(None)

    mock_acomp = AsyncMock(return_value=_fake_stream())

    with patch("providers.read_config", return_value=cfg), \
         patch("providers._get_key", return_value=""), \
         patch("litellm.acompletion", mock_acomp):
        from providers import call_llm_stream
        [t async for t in call_llm_stream([{"role": "user", "content": "x"}])]

    called_kwargs = mock_acomp.call_args.kwargs
    assert called_kwargs["temperature"] == pytest.approx(0.3)
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

```bash
cd backend && pytest tests/test_providers.py -v
```

Esperado: FAIL (temperatura ainda hardcoded, max_tokens não implementado).

- [ ] **Step 3: Atualizar providers.py**

Substituir a função `call_llm_stream` em `backend/providers.py` por:

```python
async def call_llm_stream(messages: list[dict]):
    cfg = read_config()
    provider = cfg.get("llm_provider", "anthropic")
    model = cfg.get("llm_model", "claude-haiku-4-5-20251001")
    temperature = cfg.get("llm_temperature", 0.3)
    max_tokens = cfg.get("llm_max_tokens", None)
    litellm_prefix = "gemini" if provider == "google" else provider
    litellm_model = f"{litellm_prefix}/{model}"
    api_key = _get_key(f'{provider.upper()}_API_KEY')

    kwargs: dict = {
        "model": litellm_model,
        "messages": messages,
        "temperature": temperature,
        "timeout": 30,
        "stream": True,
    }
    if max_tokens:
        kwargs["max_tokens"] = max_tokens
    if api_key:
        kwargs["api_key"] = api_key

    response = await litellm.acompletion(**kwargs)
    async for chunk in response:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
```

- [ ] **Step 4: Rodar os testes**

```bash
cd backend && pytest tests/test_providers.py -v
```

Esperado: todos passam.

- [ ] **Step 5: Commit**

```bash
git add backend/providers.py backend/tests/test_providers.py
git commit -m "feat(providers): ler temperature e max_tokens do config em vez de hardcode"
```

---

## Task 4: Refatorar rag_service.py (retrieval_k + score_threshold)

**Files:**
- Modify: `backend/services/rag_service.py`
- Modify: `backend/tests/test_rag_service.py`

- [ ] **Step 1: Adicionar testes novos em test_rag_service.py**

Adicionar ao final de `backend/tests/test_rag_service.py`:

```python
def test_retrieve_uses_retrieval_k_from_config():
    from services.rag_service import retrieve

    doc1 = _make_doc("content 1")
    doc2 = _make_doc("content 2")

    with patch("services.rag_service._get_collection_count", return_value=2), \
         patch("services.rag_service.read_config",
               return_value={"rag_retrieval_k": 1, "rag_score_threshold": 0.0}), \
         patch("services.rag_service._build_ensemble") as mock_ensemble, \
         patch("services.rag_service.HuggingFaceCrossEncoder") as mock_ce_class:

        mock_ens = MagicMock()
        mock_ens.invoke.return_value = [doc1, doc2]
        mock_ensemble.return_value = mock_ens

        mock_ce = MagicMock()
        mock_ce.score.return_value = [0.5, 0.3]
        mock_ce_class.return_value = mock_ce

        result = retrieve("query", embeddings=MagicMock())

    assert len(result) == 1
    assert result[0].page_content == "content 1"


def test_retrieve_filters_below_score_threshold():
    from services.rag_service import retrieve

    doc1 = _make_doc("relevant")
    doc2 = _make_doc("irrelevant")

    with patch("services.rag_service._get_collection_count", return_value=2), \
         patch("services.rag_service.read_config",
               return_value={"rag_retrieval_k": 5, "rag_score_threshold": 0.6}), \
         patch("services.rag_service._build_ensemble") as mock_ensemble, \
         patch("services.rag_service.HuggingFaceCrossEncoder") as mock_ce_class:

        mock_ens = MagicMock()
        mock_ens.invoke.return_value = [doc1, doc2]
        mock_ensemble.return_value = mock_ens

        mock_ce = MagicMock()
        # sigmoid(1.0) ≈ 0.731 > 0.6 → passa; sigmoid(-1.0) ≈ 0.269 < 0.6 → filtrado
        mock_ce.score.return_value = [1.0, -1.0]
        mock_ce_class.return_value = mock_ce

        result = retrieve("query", embeddings=MagicMock())

    assert len(result) == 1
    assert result[0].page_content == "relevant"


def test_retrieve_no_filter_when_threshold_zero():
    from services.rag_service import retrieve

    doc1 = _make_doc("doc1")
    doc2 = _make_doc("doc2")

    with patch("services.rag_service._get_collection_count", return_value=2), \
         patch("services.rag_service.read_config",
               return_value={"rag_retrieval_k": 5, "rag_score_threshold": 0.0}), \
         patch("services.rag_service._build_ensemble") as mock_ensemble, \
         patch("services.rag_service.HuggingFaceCrossEncoder") as mock_ce_class:

        mock_ens = MagicMock()
        mock_ens.invoke.return_value = [doc1, doc2]
        mock_ensemble.return_value = mock_ens

        mock_ce = MagicMock()
        mock_ce.score.return_value = [-5.0, -3.0]
        mock_ce_class.return_value = mock_ce

        result = retrieve("query", embeddings=MagicMock())

    assert len(result) == 2


def test_retrieve_returns_empty_when_all_filtered():
    from services.rag_service import retrieve

    doc1 = _make_doc("doc1")

    with patch("services.rag_service._get_collection_count", return_value=1), \
         patch("services.rag_service.read_config",
               return_value={"rag_retrieval_k": 5, "rag_score_threshold": 0.9}), \
         patch("services.rag_service._build_ensemble") as mock_ensemble, \
         patch("services.rag_service.HuggingFaceCrossEncoder") as mock_ce_class:

        mock_ens = MagicMock()
        mock_ens.invoke.return_value = [doc1]
        mock_ensemble.return_value = mock_ens

        mock_ce = MagicMock()
        mock_ce.score.return_value = [-10.0]  # sigmoid(-10) ≈ 0.0000 < 0.9
        mock_ce_class.return_value = mock_ce

        result = retrieve("query", embeddings=MagicMock())

    assert result == []
```

- [ ] **Step 2: Adicionar import no topo de test_rag_service.py**

No início de `backend/tests/test_rag_service.py`, garantir que `MagicMock` e `patch` estão importados:

```python
import pytest
from unittest.mock import MagicMock, patch
from langchain_core.documents import Document
```

- [ ] **Step 3: Rodar testes novos para confirmar que falham**

```bash
cd backend && pytest tests/test_rag_service.py::test_retrieve_uses_retrieval_k_from_config tests/test_rag_service.py::test_retrieve_filters_below_score_threshold -v
```

Esperado: FAIL (funções `_build_ensemble` e `read_config` não existem em rag_service).

- [ ] **Step 4: Reescrever services/rag_service.py**

Substituir o conteúdo de `backend/services/rag_service.py` por:

```python
import math
from pathlib import Path
from typing import Any

import chromadb
from langchain_classic.retrievers import EnsembleRetriever
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_community.retrievers import BM25Retriever
from langchain_chroma import Chroma
from langchain_core.documents import Document

from services.config_service import read_config

CHROMA_PATH = Path(__file__).parent.parent / "chroma_db"
COLLECTION_NAME = "neuroguia"
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


def _get_collection_count() -> int:
    client = chromadb.PersistentClient(str(CHROMA_PATH))
    try:
        col = client.get_collection(COLLECTION_NAME)
        return col.count()
    except Exception:
        return 0


def _build_ensemble(embeddings: Any, n_candidates: int) -> EnsembleRetriever:
    chroma_client = chromadb.PersistentClient(str(CHROMA_PATH))
    vectorstore = Chroma(
        client=chroma_client,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
    )
    chroma_retriever = vectorstore.as_retriever(search_kwargs={"k": n_candidates})

    all_docs_result = chroma_client.get_collection(COLLECTION_NAME).get(
        include=["documents", "metadatas"]
    )
    bm25_docs = [
        Document(page_content=text, metadata=meta)
        for text, meta in zip(all_docs_result["documents"], all_docs_result["metadatas"])
    ]
    bm25_retriever = BM25Retriever.from_documents(bm25_docs, k=n_candidates)

    return EnsembleRetriever(
        retrievers=[bm25_retriever, chroma_retriever],
        weights=[0.4, 0.6],
    )


def retrieve(query: str, embeddings: Any) -> list[Document]:
    cfg = read_config()
    k = cfg.get("rag_retrieval_k", 6)
    score_threshold = cfg.get("rag_score_threshold", 0.0)

    if _get_collection_count() == 0:
        return []

    ensemble = _build_ensemble(embeddings, k * 2)
    candidates = ensemble.invoke(query)

    cross_encoder = HuggingFaceCrossEncoder(model_name=RERANKER_MODEL)
    raw_scores = cross_encoder.score([(query, doc.page_content) for doc in candidates])
    norm_scores = [1.0 / (1.0 + math.exp(-float(s))) for s in raw_scores]

    ranked = sorted(zip(candidates, norm_scores), key=lambda x: x[1], reverse=True)

    if score_threshold > 0.0:
        ranked = [(d, s) for d, s in ranked if s >= score_threshold]

    return [doc for doc, _ in ranked[:k]]


def extract_sources(docs: list[Document]) -> list[str]:
    if not docs:
        return ["Sem identificação da fonte"]
    seen: list[str] = []
    for doc in docs:
        src = doc.metadata.get("source", "")
        if src and src not in seen:
            seen.append(src)
    return seen or ["Sem identificação da fonte"]
```

- [ ] **Step 5: Rodar todos os testes de rag_service**

```bash
cd backend && pytest tests/test_rag_service.py -v
```

Esperado: todos passam (incluindo os três testes antigos que continuam funcionando).

- [ ] **Step 6: Commit**

```bash
git add backend/services/rag_service.py backend/tests/test_rag_service.py
git commit -m "feat(rag): suporte a retrieval_k e score_threshold configuráveis"
```

---

## Task 5: Atualizar ingest_service.py (chunk_size dinâmico)

**Files:**
- Modify: `backend/services/ingest_service.py`
- Modify: `backend/tests/test_ingest_service.py`

- [ ] **Step 1: Adicionar teste novo em test_ingest_service.py**

Adicionar ao final de `backend/tests/test_ingest_service.py`:

```python
def test_load_and_chunk_uses_chunk_size_from_config(txt_file):
    from unittest.mock import patch, MagicMock
    from services import ingest_service

    with patch("services.ingest_service.read_config", return_value={"rag_chunk_size": 600}), \
         patch("services.ingest_service.RecursiveCharacterTextSplitter") as mock_splitter_cls:

        mock_splitter = MagicMock()
        mock_splitter.split_documents.return_value = []
        mock_splitter_cls.return_value = mock_splitter

        ingest_service.load_and_chunk(txt_file, "abc")

    mock_splitter_cls.assert_called_once_with(
        chunk_size=600,
        chunk_overlap=round(600 * 0.17),
        separators=["\n\n", "\n", "Art.", "§", ". ", " "],
    )
```

- [ ] **Step 2: Rodar o novo teste para confirmar que falha**

```bash
cd backend && pytest tests/test_ingest_service.py::test_load_and_chunk_uses_chunk_size_from_config -v
```

Esperado: FAIL (`SPLITTER` ainda é constante de módulo, `read_config` não é chamado).

- [ ] **Step 3: Atualizar ingest_service.py**

Substituir o conteúdo de `backend/services/ingest_service.py` por:

```python
import asyncio
import hashlib
import mimetypes
from pathlib import Path
from typing import AsyncGenerator

import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader, TextLoader
from langchain_core.documents import Document

from services.config_service import read_config

CHROMA_PATH = Path(__file__).parent.parent / "chroma_db"
COLLECTION_NAME = "neuroguia"
ALLOWED_MIME = {
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_BYTES = 20 * 1024 * 1024  # 20 MB

_CHUNK_SEPARATORS = ["\n\n", "\n", "Art.", "§", ". ", " "]


def get_chroma_collection() -> chromadb.Collection:
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    return client.get_or_create_collection(COLLECTION_NAME)


def compute_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def is_duplicate(source_id: str, collection: chromadb.Collection) -> bool:
    results = collection.get(where={"source_id": source_id}, limit=1)
    return len(results["ids"]) > 0


def load_and_chunk(path: Path, source_id: str) -> list[Document]:
    cfg = read_config()
    chunk_size = cfg.get("rag_chunk_size", 900)
    chunk_overlap = round(chunk_size * 0.17)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=_CHUNK_SEPARATORS,
    )

    suffix = path.suffix.lower()
    if suffix == ".pdf":
        loader = PyMuPDFLoader(str(path))
    elif suffix in (".txt",):
        loader = TextLoader(str(path), encoding="utf-8")
    elif suffix == ".docx":
        from langchain_community.document_loaders import Docx2txtLoader
        loader = Docx2txtLoader(str(path))
    else:
        raise ValueError(f"Tipo não suportado: {suffix}")

    docs = loader.load()
    chunks = splitter.split_documents(docs)
    for chunk in chunks:
        chunk.metadata["source"] = path.name
        chunk.metadata["source_id"] = source_id
    return chunks


async def ingest_file(path: Path, embeddings, progress_queue: asyncio.Queue) -> dict:
    source_id = compute_sha256(path)
    collection = get_chroma_collection()

    if is_duplicate(source_id, collection):
        await progress_queue.put({"status": "skipped", "file": path.name, "reason": "duplicate"})
        return {"file": path.name, "status": "skipped"}

    await progress_queue.put({"status": "loading", "file": path.name})
    chunks = load_and_chunk(path, source_id)

    await progress_queue.put({"status": "embedding", "file": path.name, "chunks": len(chunks)})

    from langchain_chroma import Chroma

    vectorstore = Chroma(
        client=chromadb.PersistentClient(str(CHROMA_PATH)),
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
    )
    vectorstore.add_documents(chunks)

    await progress_queue.put({"status": "done", "file": path.name, "chunks": len(chunks)})
    return {"file": path.name, "status": "ok", "chunks": len(chunks)}


def delete_by_source_id(source_id: str) -> int:
    collection = get_chroma_collection()
    results = collection.get(where={"source_id": source_id})
    ids = results["ids"]
    if ids:
        collection.delete(ids=ids)
    return len(ids)


def list_documents() -> list[dict]:
    collection = get_chroma_collection()
    results = collection.get(include=["metadatas"])
    seen: dict[str, dict] = {}
    for meta in results["metadatas"]:
        sid = meta.get("source_id", "")
        if sid and sid not in seen:
            seen[sid] = {"source": meta.get("source", ""), "source_id": sid}
    return list(seen.values())
```

- [ ] **Step 4: Rodar todos os testes de ingest**

```bash
cd backend && pytest tests/test_ingest_service.py -v
```

Esperado: todos passam (os testes antigos funcionam pois `read_config()` lê o `config.json` real que tem `rag_chunk_size: 900`, mesmo valor do hardcode anterior).

- [ ] **Step 5: Rodar toda a suite de backend**

```bash
cd backend && pytest -v
```

Esperado: todos passam.

- [ ] **Step 6: Commit**

```bash
git add backend/services/ingest_service.py backend/tests/test_ingest_service.py
git commit -m "feat(ingest): chunk_size dinâmico lido do config em vez de hardcode"
```

---

## Task 6: Atualizar página de Configurações (frontend)

**Files:**
- Modify: `src/app/config/page.tsx`

- [ ] **Step 1: Substituir o conteúdo de src/app/config/page.tsx**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/AppHeader'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const PROVIDERS = ['anthropic', 'openai', 'google'] as const
function token() { return sessionStorage.getItem('access_token') ?? '' }

type CfgState = {
  system_prompt: string
  llm_provider: string
  llm_model: string
  llm_temperature: number
  llm_max_tokens: number
  embed_provider: string
  embed_model: string
  rag_retrieval_k: number
  rag_chunk_size: number
  rag_score_threshold: number
}

export default function ConfigPage() {
  const [cfg, setCfg] = useState<CfgState>({
    system_prompt: '',
    llm_provider: 'anthropic',
    llm_model: '',
    llm_temperature: 0.3,
    llm_max_tokens: 1024,
    embed_provider: 'openai',
    embed_model: '',
    rag_retrieval_k: 6,
    rag_chunk_size: 900,
    rag_score_threshold: 0.0,
  })
  const [apiKeys, setApiKeys] = useState({ anthropic: '', openai: '', google: '' })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/config`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(({
        system_prompt, llm_provider, llm_model,
        llm_temperature, llm_max_tokens,
        embed_provider, embed_model,
        rag_retrieval_k, rag_chunk_size, rag_score_threshold,
      }) =>
        setCfg({
          system_prompt, llm_provider, llm_model,
          llm_temperature: llm_temperature ?? 0.3,
          llm_max_tokens: llm_max_tokens ?? 1024,
          embed_provider, embed_model,
          rag_retrieval_k: rag_retrieval_k ?? 6,
          rag_chunk_size: rag_chunk_size ?? 900,
          rag_score_threshold: rag_score_threshold ?? 0.0,
        })
      )
      .catch(() => setError('Erro ao carregar configurações'))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaved(false)
    const res = await fetch(`${API}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        system_prompt: cfg.system_prompt,
        llm_provider: cfg.llm_provider,
        llm_model: cfg.llm_model,
        llm_temperature: cfg.llm_temperature,
        llm_max_tokens: cfg.llm_max_tokens,
        embed_provider: cfg.embed_provider,
        embed_model: cfg.embed_model,
        rag_retrieval_k: cfg.rag_retrieval_k,
        rag_chunk_size: cfg.rag_chunk_size,
        rag_score_threshold: cfg.rag_score_threshold,
        ...(apiKeys.anthropic && { anthropic_api_key: apiKeys.anthropic }),
        ...(apiKeys.openai && { openai_api_key: apiKeys.openai }),
        ...(apiKeys.google && { google_api_key: apiKeys.google }),
      }),
    })
    if (res.ok) { setSaved(true); setApiKeys({ anthropic: '', openai: '', google: '' }) }
    else setError('Erro ao salvar')
  }

  function numField(
    key: keyof CfgState,
    opts: { min: number; max: number; step?: number }
  ) {
    return (
      <input
        type="number"
        value={cfg[key] as number}
        min={opts.min}
        max={opts.max}
        step={opts.step ?? 1}
        onChange={e => setCfg(c => ({ ...c, [key]: parseFloat(e.target.value) }))}
        className={fieldClass}
      />
    )
  }

  const fieldClass =
    'rounded-xl border border-mist px-4 py-3 bg-cream min-h-[48px] focus-visible:border-owl-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange-dark'

  return (
    <>
      <AppHeader />
      <main id="main-content" className="max-w-2xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold text-ink mb-6 pl-4 border-l-4 border-owl-orange">Configurações</h1>
        <form onSubmit={handleSave} className="flex flex-col gap-5">

          {/* System Prompt */}
          <div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              System Prompt do OWL
              <textarea
                rows={10}
                value={cfg.system_prompt}
                onChange={e => setCfg(c => ({ ...c, system_prompt: e.target.value }))}
                className="rounded-2xl border border-mist px-5 py-3.5 text-sm bg-cream font-mono focus-visible:border-owl-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-orange-dark"
              />
            </label>
          </div>

          {/* Modelo de Linguagem */}
          <div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-4">Modelo de Linguagem</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Provedor LLM
                <select value={cfg.llm_provider}
                  onChange={e => setCfg(c => ({ ...c, llm_provider: e.target.value }))}
                  className={fieldClass}>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Modelo LLM
                <input type="text" value={cfg.llm_model}
                  onChange={e => setCfg(c => ({ ...c, llm_model: e.target.value }))}
                  className={fieldClass} />
              </label>
            </div>
          </div>

          {/* Parâmetros de Geração */}
          <div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-4">Parâmetros de Geração</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Temperatura (0 – 1)
                {numField('llm_temperature', { min: 0, max: 1, step: 0.1 })}
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Máx. tokens (256 – 4096)
                {numField('llm_max_tokens', { min: 256, max: 4096, step: 128 })}
              </label>
            </div>
          </div>

          {/* Embeddings */}
          <div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-4">Embeddings</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Provedor Embeddings
                <select value={cfg.embed_provider}
                  onChange={e => setCfg(c => ({ ...c, embed_provider: e.target.value }))}
                  className={fieldClass}>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Modelo Embeddings
                <input type="text" value={cfg.embed_model}
                  onChange={e => setCfg(c => ({ ...c, embed_model: e.target.value }))}
                  className={fieldClass} />
              </label>
            </div>
          </div>

          {/* RAG — Recuperação e Chunking */}
          <div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-4">RAG — Recuperação e Chunking</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Chunks recuperados (1 – 20)
                {numField('rag_retrieval_k', { min: 1, max: 20 })}
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                Limiar de relevância (0 = desabilitado)
                {numField('rag_score_threshold', { min: 0, max: 1, step: 0.05 })}
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              Tamanho do chunk (200 – 2000)
              {numField('rag_chunk_size', { min: 200, max: 2000, step: 100 })}
            </label>
            <p role="note" className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              ⚠ Alterações no tamanho do chunk exigem re-ingestão de todos os documentos para ter efeito.
            </p>
          </div>

          {/* Chaves de API */}
          <div className="bg-violet-soft rounded-2xl border border-violet/20 p-5">
            <p className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <span aria-hidden="true">🔒</span> Chaves de API
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Anthropic API Key', key: 'anthropic' as const },
                { label: 'OpenAI API Key', key: 'openai' as const },
                { label: 'Google API Key', key: 'google' as const },
              ].map(({ label, key }) => (
                <label key={key} htmlFor={`api-key-${key}`} className="flex flex-col gap-1 text-sm font-medium text-ink">
                  {label}
                  <input
                    id={`api-key-${key}`}
                    type="password"
                    value={apiKeys[key]}
                    onChange={e => setApiKeys(k => ({ ...k, [key]: e.target.value }))}
                    placeholder="sk-... (deixe vazio para não alterar)"
                    autoComplete="new-password"
                    className={fieldClass}
                  />
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-ink bg-error/10 rounded-xl px-4 py-2.5 border border-error/30">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}
          {saved && (
            <p role="status" className="flex items-center gap-2 text-sm text-success bg-success/10 rounded-xl px-4 py-2.5">
              <span aria-hidden="true">✓</span> Configurações salvas com sucesso.
            </p>
          )}

          <button type="submit"
            className="bg-owl-orange hover:bg-owl-orange-dark text-ink rounded-2xl py-2.5 px-5 font-semibold self-start transition-colors min-h-[44px]">
            Salvar
          </button>
        </form>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npm run build 2>&1 | tail -20
```

Esperado: build sem erros de tipo.

- [ ] **Step 3: Testar manualmente no browser**

Iniciar o backend e o frontend:

```bash
# Terminal 1
cd backend && uvicorn main:app --reload

# Terminal 2
npm run dev
```

Navegar para `http://localhost:3000/config` (autenticado como admin) e verificar:
- Card "Parâmetros de Geração" aparece com os campos Temperatura e Máx. tokens
- Card "RAG — Recuperação e Chunking" aparece com Chunks recuperados, Limiar de relevância e Tamanho do chunk
- Aviso âmbar aparece abaixo do campo "Tamanho do chunk"
- Alterar um valor e clicar Salvar → mensagem "Configurações salvas com sucesso."
- Recarregar a página → valores novos são carregados corretamente

- [ ] **Step 4: Commit**

```bash
git add src/app/config/page.tsx
git commit -m "feat(ui): adicionar campos de temperatura, max_tokens e RAG na página de configurações"
```

---

## Task 7: Verificação final — suite completa + smoke test

- [ ] **Step 1: Rodar toda a suite de testes do backend**

```bash
cd backend && pytest -v
```

Esperado: todos passam, sem skip ou warning de deprecação relevante.

- [ ] **Step 2: Rodar lint do frontend**

```bash
npm run lint
```

Esperado: sem erros.

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "chore: verificação final — todos os testes passando"
```
