from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import auth as auth_router
from routers import chat as chat_router
from routers import config as config_router
from routers import docs as docs_router
from routers import feedback as feedback_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="NeuroGuia API", lifespan=lifespan, docs_url="/api-docs", redoc_url="/api-redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(chat_router.router)
app.include_router(config_router.router)
app.include_router(docs_router.router)
app.include_router(feedback_router.router)


@app.get("/health")
async def health():
    try:
        import chromadb
        client = chromadb.PersistentClient(path="chroma_db")
        client.list_collections()
        chromadb_status = "ok"
    except Exception as e:
        chromadb_status = f"error: {e}"
    return {"status": "ok", "chromadb": chromadb_status}
