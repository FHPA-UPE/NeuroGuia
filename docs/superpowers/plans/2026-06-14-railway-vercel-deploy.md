# Railway + Vercel Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o deploy dividido do NeuroGuia — frontend Next.js na Vercel e backend FastAPI no Railway com Volume persistente para `users.json`, `config.json`, `chroma_db/` e `docs/`.

**Architecture:** Um módulo `backend/paths.py` centraliza todos os paths de dados usando a env var `DATA_DIR` (default: diretório do próprio `backend/` para desenvolvimento local; `/data` para o Volume Railway em produção). O CORS do backend passa a ser configurado via `ALLOWED_ORIGINS` em vez de hardcoded. O `railway.toml` instrui o Railway a subir o uvicorn com a porta injetada automaticamente.

**Tech Stack:** Next.js 15, FastAPI, ChromaDB, Railway (nixpacks + Volume), Vercel (GitHub integration)

---

## Mapa de arquivos

| Arquivo | Ação |
|---|---|
| `backend/paths.py` | **Criar** — define `USERS_PATH`, `CONFIG_PATH`, `CHROMA_PATH`, `DOCS_PATH` |
| `backend/tests/test_paths.py` | **Criar** — testa `DATA_DIR` padrão e override |
| `backend/auth.py` | **Modificar** — troca definição própria por `from paths import USERS_PATH` |
| `backend/services/config_service.py` | **Modificar** — troca por `from paths import CONFIG_PATH` |
| `backend/services/rag_service.py` | **Modificar** — troca por `from paths import CHROMA_PATH` |
| `backend/services/ingest_service.py` | **Modificar** — troca por `from paths import CHROMA_PATH, DOCS_PATH` |
| `backend/routers/docs.py` | **Modificar** — troca `docs_dir` (2×) por `from paths import DOCS_PATH` |
| `backend/main.py` | **Modificar** — CORS via env var, lifespan cria dirs, health usa `CHROMA_PATH` |
| `backend/railway.toml` | **Criar** — config de build e start para o Railway |

---

## Task 1: Criar `backend/paths.py`

**Files:**
- Create: `backend/paths.py`
- Create: `backend/tests/test_paths.py`

- [ ] **Step 1: Escrever o teste de paths (vai falhar porque o módulo não existe)**

```python
# backend/tests/test_paths.py
import importlib
from pathlib import Path


def test_default_paths_relative_to_backend(monkeypatch):
    monkeypatch.delenv("DATA_DIR", raising=False)
    import paths
    importlib.reload(paths)
    backend_dir = Path(__file__).parent.parent
    assert paths.USERS_PATH == backend_dir / "users.json"
    assert paths.CONFIG_PATH == backend_dir / "config.json"
    assert paths.CHROMA_PATH == backend_dir / "chroma_db"
    assert paths.DOCS_PATH == backend_dir / "docs"


def test_data_dir_env_overrides_base(monkeypatch, tmp_path):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    import paths
    importlib.reload(paths)
    assert paths.USERS_PATH == tmp_path / "users.json"
    assert paths.CONFIG_PATH == tmp_path / "config.json"
    assert paths.CHROMA_PATH == tmp_path / "chroma_db"
    assert paths.DOCS_PATH == tmp_path / "docs"
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

```bash
cd backend && pytest tests/test_paths.py -v
```

Esperado: `ModuleNotFoundError: No module named 'paths'`

- [ ] **Step 3: Criar `backend/paths.py`**

```python
import os
from pathlib import Path

_BASE = Path(os.getenv("DATA_DIR", str(Path(__file__).parent)))

USERS_PATH  = _BASE / "users.json"
CONFIG_PATH = _BASE / "config.json"
CHROMA_PATH = _BASE / "chroma_db"
DOCS_PATH   = _BASE / "docs"
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

```bash
cd backend && pytest tests/test_paths.py -v
```

Esperado: 2 testes passando.

- [ ] **Step 5: Commit**

```bash
git add backend/paths.py backend/tests/test_paths.py
git commit -m "feat: módulo paths.py com DATA_DIR configurável"
```

---

## Task 2: Atualizar `backend/auth.py`

**Files:**
- Modify: `backend/auth.py:10`

- [ ] **Step 1: Substituir a definição de `USERS_PATH` por import de `paths`**

Localizar e remover a linha:
```python
USERS_PATH = Path(__file__).parent / "users.json"
```

Substituir por:
```python
from paths import USERS_PATH
```

O `import` de `Path` no topo do arquivo continua necessário para os outros usos de `Path`. Remover apenas a linha de `USERS_PATH`.

- [ ] **Step 2: Rodar os testes de auth para confirmar que nada quebrou**

```bash
cd backend && pytest tests/test_auth.py -v
```

Esperado: todos os testes passando (o fixture `tmp_users` usa `monkeypatch.setattr(auth, "USERS_PATH", p)` que continua funcionando).

- [ ] **Step 3: Commit**

```bash
git add backend/auth.py
git commit -m "refactor: auth usa USERS_PATH de paths.py"
```

---

## Task 3: Atualizar `backend/services/config_service.py`

**Files:**
- Modify: `backend/services/config_service.py:6-7`

- [ ] **Step 1: Substituir a definição de `CONFIG_PATH` por import de `paths`**

Remover as linhas:
```python
CONFIG_PATH = Path(__file__).parent.parent / "config.json"
_LOCK_PATH = CONFIG_PATH.with_suffix(".lock")
```

Substituir por:
```python
from paths import CONFIG_PATH
_LOCK_PATH = CONFIG_PATH.with_suffix(".lock")
```

O import de `Path` no topo pode ser removido se não há outros usos de `Path` no arquivo (verificar — se não houver, remover o import).

- [ ] **Step 2: Rodar os testes de config_service para confirmar que nada quebrou**

```bash
cd backend && pytest tests/test_config_service.py -v
```

Esperado: 4 testes passando.

- [ ] **Step 3: Commit**

```bash
git add backend/services/config_service.py
git commit -m "refactor: config_service usa CONFIG_PATH de paths.py"
```

---

## Task 4: Atualizar `backend/services/rag_service.py`

**Files:**
- Modify: `backend/services/rag_service.py:14`

- [ ] **Step 1: Substituir a definição de `CHROMA_PATH` por import de `paths`**

Remover a linha:
```python
CHROMA_PATH = Path(__file__).parent.parent / "chroma_db"
```

Substituir por:
```python
from paths import CHROMA_PATH
```

Verificar se `Path` ainda é usado em outro lugar no arquivo — se não, remover o import de `pathlib`.

- [ ] **Step 2: Rodar os testes de rag_service**

```bash
cd backend && pytest tests/test_rag_service.py -v
```

Esperado: todos os testes passando.

- [ ] **Step 3: Commit**

```bash
git add backend/services/rag_service.py
git commit -m "refactor: rag_service usa CHROMA_PATH de paths.py"
```

---

## Task 5: Atualizar `backend/services/ingest_service.py`

**Files:**
- Modify: `backend/services/ingest_service.py:16,149`

- [ ] **Step 1: Substituir as definições de path por imports de `paths`**

Remover a linha:
```python
CHROMA_PATH = Path(__file__).parent.parent / "chroma_db"
```

Substituir por:
```python
from paths import CHROMA_PATH, DOCS_PATH
```

Na função `delete_by_source_id` (linha 149), substituir:
```python
physical = Path(__file__).parent.parent / "docs" / filename
```

por:
```python
physical = DOCS_PATH / filename
```

Verificar se `Path` ainda é usado em outro lugar no arquivo — se sim, manter o import de `pathlib`.

- [ ] **Step 2: Rodar os testes de ingest_service**

```bash
cd backend && pytest tests/test_ingest_service.py -v
```

Esperado: todos os testes passando.

- [ ] **Step 3: Commit**

```bash
git add backend/services/ingest_service.py
git commit -m "refactor: ingest_service usa CHROMA_PATH e DOCS_PATH de paths.py"
```

---

## Task 6: Atualizar `backend/routers/docs.py`

**Files:**
- Modify: `backend/routers/docs.py:55,63`

- [ ] **Step 1: Substituir as duas ocorrências de `docs_dir` por `DOCS_PATH`**

Adicionar no topo do arquivo (junto aos outros imports):
```python
from paths import DOCS_PATH
```

Na função `upload` (linha 55-56), substituir:
```python
docs_dir = Path(__file__).parent.parent / "docs"
dest = docs_dir / (Path(file.filename).stem + suffix)
```

por:
```python
dest = DOCS_PATH / (Path(file.filename).stem + suffix)
```

Na função `ingest` (linha 63-64), substituir:
```python
docs_dir = Path(__file__).parent.parent / "docs"
files = [f for f in docs_dir.iterdir() if f.suffix in (".pdf", ".txt", ".docx") and f.name != ".gitkeep"]
```

por:
```python
files = [f for f in DOCS_PATH.iterdir() if f.suffix in (".pdf", ".txt", ".docx") and f.name != ".gitkeep"]
```

Também atualizar a mensagem de erro na linha seguinte:
```python
raise HTTPException(status_code=404, detail="Nenhum arquivo encontrado em docs/")
```
Essa linha não precisa mudar — a mensagem é para o usuário, não um path técnico.

- [ ] **Step 2: Rodar os testes de docs_router**

```bash
cd backend && pytest tests/test_docs_router.py -v
```

Esperado: todos os testes passando.

- [ ] **Step 3: Commit**

```bash
git add backend/routers/docs.py
git commit -m "refactor: docs router usa DOCS_PATH de paths.py"
```

---

## Task 7: Atualizar `backend/main.py`

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Aplicar as três mudanças em `main.py`**

O arquivo final deve ficar assim (mostrado completo para evitar ambiguidade):

```python
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.requests import Request
from dotenv import load_dotenv
from routers import auth as auth_router
from routers import chat as chat_router
from routers import config as config_router
from routers import docs as docs_router
from routers import feedback as feedback_router
from routers.tts import router as tts_router

_ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from paths import DOCS_PATH, CHROMA_PATH
    DOCS_PATH.mkdir(parents=True, exist_ok=True)
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="NeuroGuia API", lifespan=lifespan, docs_url="/api-docs", redoc_url="/api-redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(chat_router.router)
app.include_router(config_router.router)
app.include_router(docs_router.router)
app.include_router(feedback_router.router)
app.include_router(tts_router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in _ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse({"detail": "Erro interno do servidor."}, status_code=500, headers=headers)


@app.get("/health")
async def health():
    try:
        import chromadb
        from paths import CHROMA_PATH
        client = chromadb.PersistentClient(path=str(CHROMA_PATH))
        client.list_collections()
        chromadb_status = "ok"
    except Exception as e:
        chromadb_status = f"error: {e}"
    return {"status": "ok", "chromadb": chromadb_status}
```

- [ ] **Step 2: Rodar o teste de health e a suíte completa do backend**

```bash
cd backend && pytest tests/test_health.py -v
```

Esperado: 2 testes passando.

```bash
cd backend && pytest -v
```

Esperado: toda a suíte passa (sem regressões).

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: CORS via ALLOWED_ORIGINS, dirs criados no boot, health usa paths.py"
```

---

## Task 8: Criar `backend/railway.toml`

**Files:**
- Create: `backend/railway.toml`

- [ ] **Step 1: Criar o arquivo**

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30
```

- [ ] **Step 2: Commit e push de todas as mudanças de código**

```bash
git add backend/railway.toml
git commit -m "feat: railway.toml com start command e healthcheck"
git push origin main
```

Aguardar o push completar antes de prosseguir — o Railway vai puxar esse código.

---

## Task 9: Criar conta e projeto no Railway

*Tarefa procedural — sem código.*

- [ ] **Step 1: Criar conta no Railway**

Acessar https://railway.app e criar conta com GitHub (recomendado — facilita a integração).

- [ ] **Step 2: Criar novo projeto**

No dashboard, clicar em **New Project → Deploy from GitHub repo**.
Selecionar o repositório `NeuroGuia`.

- [ ] **Step 3: Configurar o subdiretório do serviço**

Após criar o serviço, ir em **Settings → Build** do serviço e definir:
- **Root Directory:** `backend`

O Railway vai detectar o `railway.toml` e usar o `startCommand` definido.

- [ ] **Step 4: Criar e montar o Volume**

No dashboard do serviço, ir em **Volumes → Add Volume**.
- **Mount Path:** `/data`

Aguardar o volume ser criado.

- [ ] **Step 5: Gerar um JWT_SECRET seguro**

Rodar localmente:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copiar o valor gerado — será usado no próximo passo.

---

## Task 10: Configurar variáveis de ambiente e fazer o deploy no Railway

*Tarefa procedural — sem código.*

- [ ] **Step 1: Adicionar variáveis de ambiente no Railway**

No serviço Railway, ir em **Variables** e adicionar:

| Variável | Valor |
|---|---|
| `DATA_DIR` | `/data` |
| `JWT_SECRET` | *(valor gerado no Task 9 Step 5)* |
| `GOOGLE_API_KEY` | *(valor do arquivo `backend/.env` local)* |
| `ALLOWED_ORIGINS` | `http://localhost:3000` *(temporário — será atualizado após deploy da Vercel)* |

> `PORT` é injetado automaticamente pelo Railway — não adicionar.
> `OPENAI_API_KEY` e `ANTHROPIC_API_KEY`: adicionar apenas se `llm_provider` no config usar esses provedores.

- [ ] **Step 2: Fazer o deploy**

Clicar em **Deploy** (ou aguardar o trigger automático do push feito na Task 8).
Monitorar os logs de build — o nixpacks vai instalar as dependências do `requirements.txt`.

- [ ] **Step 3: Aguardar healthcheck passar**

O Railway vai chamar `GET /health` no container. Aguardar o serviço ficar verde (pode levar 2-5 minutos na primeira vez por conta da instalação de dependências pesadas como `sentence-transformers`).

- [ ] **Step 4: Anotar a URL pública do Railway**

No dashboard, copiar a URL gerada (formato: `https://<nome-aleatório>.railway.app`).
Essa URL será usada como `NEXT_PUBLIC_API_URL` na Vercel.

---

## Task 11: Migrar `users.json` e `config.json` para o Volume

*Tarefa procedural — sem código.*

- [ ] **Step 1: Abrir o Railway Shell**

No dashboard do serviço Railway, clicar em **Deploy → Shell** (ou ícone de terminal).

- [ ] **Step 2: Copiar o conteúdo de `users.json` local**

Abrir `backend/users.json` localmente e copiar o conteúdo JSON.

No Railway Shell, executar:

```bash
cat > /data/users.json << 'EOF'
[COLAR AQUI O CONTEÚDO EXATO DO users.json LOCAL]
EOF
```

Verificar:
```bash
cat /data/users.json
```

- [ ] **Step 3: Copiar o conteúdo de `config.json` local**

Abrir `backend/config.json` localmente e copiar o conteúdo JSON.

No Railway Shell, executar:

```bash
cat > /data/config.json << 'EOF'
[COLAR AQUI O CONTEÚDO EXATO DO config.json LOCAL]
EOF
```

Verificar:
```bash
cat /data/config.json
```

- [ ] **Step 4: Confirmar que os arquivos estão acessíveis pelo app**

```bash
curl https://<nome>.railway.app/health
```

Esperado: `{"status": "ok", "chromadb": "ok"}` (ou `"error: ..."` se chroma_db ainda vazio — aceitável nesse ponto).

---

## Task 12: Criar projeto na Vercel e fazer o deploy do frontend

*Tarefa procedural — sem código.*

- [ ] **Step 1: Importar o repositório na Vercel**

Acessar https://vercel.com, fazer login e clicar em **Add New → Project**.
Selecionar o repositório `NeuroGuia`.

- [ ] **Step 2: Configurar o projeto**

- **Framework Preset:** Next.js *(detectado automaticamente)*
- **Root Directory:** `.` *(deixar como padrão — raiz do repo)*
- **Build Command:** `npm run build` *(padrão)*
- **Output Directory:** `.next` *(padrão)*

- [ ] **Step 3: Adicionar a variável de ambiente**

Antes de clicar em Deploy, ir em **Environment Variables** e adicionar:

| Variável | Valor | Environments |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<nome>.railway.app` | Production, Preview, Development |

*(Usar a URL copiada no Task 10 Step 4)*

- [ ] **Step 4: Fazer o deploy**

Clicar em **Deploy** e aguardar o build completar (~2 minutos).

- [ ] **Step 5: Anotar a URL da Vercel**

Copiar a URL gerada (formato: `https://neuoguia.vercel.app` ou similar).

---

## Task 13: Atualizar CORS no Railway e verificar integração

*Tarefa procedural — sem código.*

- [ ] **Step 1: Atualizar `ALLOWED_ORIGINS` no Railway**

No dashboard Railway → **Variables**, atualizar:

| Variável | Valor |
|---|---|
| `ALLOWED_ORIGINS` | `https://<projeto>.vercel.app` |

Se quiser permitir também URLs de preview da Vercel (ex: por branch), separar por vírgula:
```
https://neuoguia.vercel.app,https://neuoguia-git-main-fhpa.vercel.app
```

- [ ] **Step 2: Aguardar o redeploy do Railway**

A mudança de variável dispara um redeploy automático. Aguardar o healthcheck ficar verde novamente.

- [ ] **Step 3: Testar a integração ponta a ponta**

Acessar a URL da Vercel no browser:
1. A página de login deve carregar
2. Fazer login com as credenciais do `users.json` migrado
3. Enviar uma mensagem no chat — a resposta do OWL deve aparecer
4. Abrir o DevTools (F12 → Network) e confirmar que as requests vão para `*.railway.app` sem erros de CORS

- [ ] **Step 4: Commit de validação**

```bash
git commit --allow-empty -m "chore: deploy Railway + Vercel validado em produção"
```
