# Deploy Dividido: Railway (backend) + Vercel (frontend)

**Data:** 2026-06-14
**Status:** Aprovado

---

## Contexto

NeuroGuia é composto por um frontend Next.js 15 e um backend FastAPI (Python) com ChromaDB, autenticação JWT via `users.json` e configuração em `config.json`. O backend usa estado persistente em disco, o que o torna incompatível com a arquitetura serverless da Vercel. A solução é um deploy dividido: frontend na Vercel, backend no Railway com Volume persistente.

---

## Arquitetura

```
GitHub (branch main)
├── / (raiz)       →  Vercel   →  neuoguia.vercel.app
└── /backend       →  Railway  →  <nome>.railway.app
```

**Vercel** detecta Next.js na raiz do repo e faz build/deploy automático a cada push para `main`.

**Railway** usa o subdiretório `backend/` como raiz do serviço Python. O nixpacks detecta `requirements.txt` e instala as dependências.

**Railway Volume** montado em `/data` dentro do container, provendo persistência entre deploys:

```
/data/
  users.json      ← migrado do local
  config.json     ← migrado do local
  chroma_db/      ← criado automaticamente no primeiro uso
  docs/           ← criado automaticamente no primeiro upload
```

---

## Mudanças no Código

### 1. Novo arquivo: `backend/paths.py`

Centraliza todos os paths usando a variável de ambiente `DATA_DIR`.  
Em dev local, `DATA_DIR` não é definida e os paths ficam dentro de `backend/` (comportamento atual mantido).  
Em produção, `DATA_DIR=/data` aponta para o Railway Volume.

```python
import os
from pathlib import Path

_BASE = Path(os.getenv("DATA_DIR", str(Path(__file__).parent)))

USERS_PATH  = _BASE / "users.json"
CONFIG_PATH = _BASE / "config.json"
CHROMA_PATH = _BASE / "chroma_db"
DOCS_PATH   = _BASE / "docs"
```

### 2. Arquivos que substituem paths hardcoded por imports de `paths.py`

| Arquivo | Path removido | Importação |
|---|---|---|
| `auth.py` | `Path(__file__).parent / "users.json"` | `from paths import USERS_PATH` |
| `services/config_service.py` | `Path(...) / "config.json"` | `from paths import CONFIG_PATH` |
| `services/rag_service.py` | `Path(...) / "chroma_db"` | `from paths import CHROMA_PATH` |
| `services/ingest_service.py` | `chroma_db` + `docs/` | `from paths import CHROMA_PATH, DOCS_PATH` |
| `routers/docs.py` | `Path(...) / "docs"` (2×) | `from paths import DOCS_PATH` |

### 3. `backend/main.py` — CORS via env var

```python
# antes
allow_origins=["http://localhost:3000"]

# depois
import os
_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
allow_origins=_origins
```

A mesma lista alimenta o `_ALLOWED_ORIGINS` do exception handler.

### 4. `backend/main.py` — criação de dirs no boot

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    from paths import DOCS_PATH, CHROMA_PATH
    DOCS_PATH.mkdir(parents=True, exist_ok=True)
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    yield
```

Evita erros de "diretório não encontrado" no primeiro uso após deploy.

### 5. Novo arquivo: `backend/railway.toml`

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30
```

---

## Dados e Migração

### Railway Volume
- Criar volume no dashboard do Railway e montar em `/data`
- O backend lê de lá via `DATA_DIR=/data`

### Migração dos arquivos locais
Após o primeiro deploy, usar o **Railway Shell** (terminal no container via dashboard):

```bash
cat > /data/users.json << 'EOF'
[conteúdo do users.json local]
EOF

cat > /data/config.json << 'EOF'
[conteúdo do config.json local]
EOF
```

### O que não migra
- `chroma_db/` — começa vazio; documentos são reingeridos via interface
- `docs/` — começa vazio; criado automaticamente no primeiro upload

---

## Variáveis de Ambiente

### Railway (backend)

| Variável | Valor | Observação |
|---|---|---|
| `DATA_DIR` | `/data` | Aponta para o Volume |
| `ALLOWED_ORIGINS` | `https://neuoguia.vercel.app` | Preencher após 1º deploy Vercel |
| `JWT_SECRET` | string aleatória ≥ 32 chars | Trocar o default de dev |
| `GOOGLE_API_KEY` | `AI...` | Obrigatório se `llm_provider=google` |
| `OPENAI_API_KEY` | `sk-...` | Condicional |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Condicional |
| `PORT` | *(Railway injeta automaticamente)* | Não configurar manualmente |

### Vercel (frontend)

| Variável | Valor | Escopo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<nome>.railway.app` | Production + Preview |

### Ordem de configuração

```
1. Deploy Railway  →  anota a URL pública gerada
2. Adiciona ALLOWED_ORIGINS no Railway  →  com a URL da Vercel (previsível pelo nome do projeto)
3. Deploy Vercel   →  adiciona NEXT_PUBLIC_API_URL com a URL do Railway
```

---

## Fluxo CI/CD

```
git push origin main
        │
        ├──▶ Vercel Build
        │      next build (root do repo)
        │      deploy → neuoguia.vercel.app
        │
        └──▶ Railway Build
               nixpacks detecta Python + requirements.txt
               instala deps → uvicorn main:app
               deploy → *.railway.app
```

- Vercel ignora `backend/` automaticamente (não é Next.js)
- Railway usa `backend/` como raiz — ignora o frontend
- Railway Volume não é tocado em redeploys
- Vercel cria preview URLs por PR; Railway não (plano gratuito) — previews de frontend apontam para backend de produção
- Rollback: Vercel via dashboard (1 clique); Railway via redeploy de versão anterior
