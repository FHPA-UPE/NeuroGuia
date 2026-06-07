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
    results = collection.get(where={"source_id": source_id}, include=["metadatas"])
    ids = results["ids"]
    if not ids:
        return 0
    filename = (results["metadatas"][0] or {}).get("source", "") if results["metadatas"] else ""
    collection.delete(ids=ids)
    if filename:
        physical = Path(__file__).parent.parent / "docs" / filename
        physical.unlink(missing_ok=True)
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
