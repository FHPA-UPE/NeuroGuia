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
