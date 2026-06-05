# Design: Parâmetros ML na Página de Configurações

**Data:** 2026-05-25
**Status:** Aprovado
**Avaliador técnico:** ML Engineer Agent (voltagent-data-ai:ml-engineer)

## Contexto

A página de Configurações do NeuroGuia expõe system prompt, LLM provider/model, embed provider/model e API keys. Parâmetros críticos de comportamento do LLM e do pipeline RAG estão hardcoded no backend, impedindo ajuste sem deploys de código. Este spec descreve a adição de 5 novos parâmetros configuráveis pela UI de admin.

## Parâmetros adicionados

### Categoria LLM

| Parâmetro | Default | Range | Controla |
|---|---|---|---|
| `llm_temperature` | `0.3` | 0.0 – 1.0 | Aleatoriedade/criatividade das respostas |
| `llm_max_tokens` | `1024` | 256 – 4096 | Teto duro no tamanho da resposta |

### Categoria RAG

| Parâmetro | Default | Range | Controla |
|---|---|---|---|
| `rag_retrieval_k` | `6` | 1 – 20 | Chunks recuperados do ChromaDB por query |
| `rag_score_threshold` | `0.0` | 0.0 – 1.0 | Limiar de relevância pós-reranking (0 = desabilitado) |
| `rag_chunk_size` | `900` | 200 – 2000 | Tamanho dos chunks na ingestão de documentos |

### Parâmetros derivados (internos, não expostos na UI)

- `chunk_overlap = round(rag_chunk_size × 0.17)` — mantém proporção 17% do chunk
- `reranker_top_n = max(3, rag_retrieval_k)` — evita invariante reranker > candidatos
- Candidatos do ensemble = `rag_retrieval_k × 2` — ensemble recupera o dobro antes do reranker

### Parâmetros avaliados e descartados

| Parâmetro | Razão para não expor |
|---|---|
| `top_p` | Redundante com `temperature`; a própria documentação da OpenAI/Anthropic desaconselha ajustar os dois juntos |
| `timeout` | 30s é adequado para todos os providers atuais; só relevante com modelos locais |
| `chunk_overlap` | Derivado de `chunk_size`; expor separado cria risco de `overlap >= chunk` em runtime |
| `reranker_top_n` | Derivado de `retrieval_k`; expor separado cria risco de `top_n > candidatos` |
| `ensemble_weights` | Balanceamento 40/60 BM25/vetor é adequado; admin pedagógico não tem critérios para ajustar |
| `reranker_model` | Troca de modelo exige download HuggingFace; `ms-marco-MiniLM-L-6-v2` é o padrão de fato |

## Schema — `config.json`

```json
{
  "system_prompt": "...",
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

Campos novos são opcionais no `PUT /config`; campos ausentes mantêm valor atual. Retrocompatibilidade: `config_service.read_config()` retorna defaults se campos não existirem.

## Backend

### `backend/routers/config.py`

Adicionar ao modelo Pydantic do `PUT /config`:

```python
llm_temperature: float | None = Field(None, ge=0.0, le=1.0)
llm_max_tokens: int | None = Field(None, ge=256, le=4096)
rag_retrieval_k: int | None = Field(None, ge=1, le=20)
rag_chunk_size: int | None = Field(None, ge=200, le=2000)
rag_score_threshold: float | None = Field(None, ge=0.0, le=1.0)
```

Incluir os novos campos na resposta do `GET /config`.

### `backend/providers.py` — `call_llm_stream`

```python
cfg = read_config()
temperature = cfg.get("llm_temperature", 0.3)
max_tokens = cfg.get("llm_max_tokens", None)

response = await litellm.acompletion(
    model=litellm_model,
    messages=messages,
    temperature=temperature,
    max_tokens=max_tokens,
    timeout=30,
    stream=True,
    ...
)
```

### `backend/rag_service.py` — `_build_retriever` e `retrieve`

`CrossEncoderReranker.compress_documents` (langchain-classic 1.0.7) ordena os documentos por score e retorna os `top_n`, mas **não armazena scores em metadados**. Portanto, `score_threshold` não pode ser aplicado via `ContextualCompressionRetriever`. A implementação deve bypassar o reranker encapsulado e chamar o CrossEncoder diretamente em `retrieve()`.

Abordagem:

```python
def retrieve(query: str, embeddings: Any) -> list[Document]:
    cfg = read_config()
    k = cfg.get("rag_retrieval_k", 6)
    score_threshold = cfg.get("rag_score_threshold", 0.0)

    if _get_collection_count() == 0:
        return []

    # 1. Ensemble recupera k*2 candidatos
    ensemble = _build_ensemble(embeddings, k * 2)   # extrai do _build_retriever atual
    candidates = ensemble.invoke(query)

    # 2. CrossEncoder scores — sigmoid normaliza para 0–1
    cross_encoder = HuggingFaceCrossEncoder(model_name=RERANKER_MODEL)
    raw_scores = cross_encoder.score([(query, doc.page_content) for doc in candidates])
    import math
    norm_scores = [1 / (1 + math.exp(-s)) for s in raw_scores]

    # 3. Ordenar por score normalizado
    ranked = sorted(zip(candidates, norm_scores), key=lambda x: x[1], reverse=True)

    # 4. Aplicar limiar (0.0 = desabilitado)
    if score_threshold > 0.0:
        ranked = [(d, s) for d, s in ranked if s >= score_threshold]

    return [doc for doc, _ in ranked[:k]]
```

A sigmoid normaliza os logits do CrossEncoder (que podem ser negativos) para 0–1, tornando o campo `score_threshold` intuitivo para o admin: `0.5` = 50% de confiança de relevância. `score_threshold = 0.0` desabilita o filtro sem alterar o comportamento atual.

`_build_retriever` é refatorado em `_build_ensemble(embeddings, n_candidates)` retornando apenas o `EnsembleRetriever`, e `retrieve()` gerencia o reranking diretamente.

Se todos os docs forem filtrados pelo threshold, o LLM recebe prompt sem contexto RAG e responde com "Não tenho essa informação no momento" (comportamento já instruído no system prompt).

### `backend/ingest_service.py`

Instanciar `RecursiveCharacterTextSplitter` dinamicamente:

```python
cfg = read_config()
chunk_size = cfg.get("rag_chunk_size", 900)
chunk_overlap = round(chunk_size * 0.17)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size,
    chunk_overlap=chunk_overlap,
)
```

Mudança só afeta novas ingestões. Documentos já no ChromaDB usam os chunks existentes.

## Frontend — `src/app/config/page.tsx`

### Tipo `CfgState` — campos adicionados

```ts
llm_temperature: number
llm_max_tokens: number
rag_retrieval_k: number
rag_chunk_size: number
rag_score_threshold: number
```

### Defaults do `useState`

```ts
llm_temperature: 0.3,
llm_max_tokens: 1024,
rag_retrieval_k: 6,
rag_chunk_size: 900,
rag_score_threshold: 0.0,
```

### Dois novos cards (inseridos entre "Modelo de Linguagem" e "Embeddings")

**Card "Parâmetros de Geração"**

```tsx
<div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
  <h2>Parâmetros de Geração</h2>
  <div className="grid grid-cols-2 gap-4">
    {/* Temperatura — input number, step 0.1, min 0, max 1 */}
    {/* Máx. tokens — input number, step 128, min 256, max 4096 */}
  </div>
</div>
```

**Card "RAG — Recuperação e Chunking"**

```tsx
<div className="bg-cream-card rounded-2xl border border-mist p-6 shadow-sm">
  <h2>RAG — Recuperação e Chunking</h2>
  <div className="grid grid-cols-2 gap-4">
    {/* Chunks recuperados — input number, min 1, max 20 */}
    {/* Limiar de relevância — input number, step 0.05, min 0, max 1 */}
  </div>
  {/* chunk_size — input number, step 100, min 200, max 2000, largura total */}
  {/* Aviso abaixo do chunk_size */}
  <p role="note" className="...amber warning...">
    ⚠ Alterações no tamanho do chunk exigem re-ingestão dos documentos para ter efeito.
  </p>
</div>
```

Controles: `<input type="number">` com hint de range no label (ex: "Temperatura (0 – 1)"). Mesma classe `fieldClass` dos campos existentes.

## Validação e tratamento de erros

- Validação dos ranges no backend via Pydantic `Field`. Respostas `422` com mensagem descritiva.
- Frontend: atributos `min`/`max`/`step` no `<input type="number">` para validação nativa do browser. Sem validação JavaScript adicional — a validação authoritative é o backend.
- `rag_score_threshold = 0.0` desabilita o filtro (sem mudança de comportamento para usuários existentes).

## Testes

- Backend: testes unitários para `call_llm_stream` (verificar que `temperature` e `max_tokens` são passados ao LiteLLM), `_build_retriever` (verificar `k` e filtro de threshold), e `ingest_service` (verificar `chunk_size` e `chunk_overlap` derivado).
- Frontend: atualizar o mock do `GET /config` nos testes existentes para incluir os novos campos; verificar que campos numéricos renderizam com os valores corretos.
- Retrocompatibilidade: testar que um `config.json` sem os novos campos usa os defaults corretamente.

## Ordem de implementação (Abordagem A — Schema-first)

1. Atualizar `config.json` com defaults
2. Atualizar `config_service.py` para retrocompatibilidade (defaults ao ler campos ausentes)
3. Atualizar router `config.py` (modelo Pydantic + GET/PUT)
4. Atualizar `providers.py`
5. Atualizar `rag_service.py`
6. Atualizar `ingest_service.py`
7. Atualizar frontend `config/page.tsx`
8. Executar testes
