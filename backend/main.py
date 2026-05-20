from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="NeuroGuia API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
