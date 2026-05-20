from pathlib import Path
from typing import Any

import chromadb
from langchain_classic.retrievers import EnsembleRetriever, ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors.cross_encoder_rerank import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_community.retrievers import BM25Retriever
from langchain_chroma import Chroma
from langchain_core.documents import Document

CHROMA_PATH = Path(__file__).parent.parent / "chroma_db"
COLLECTION_NAME = "neuroguia"
TOP_K = 8
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


def _get_collection_count() -> int:
    client = chromadb.PersistentClient(str(CHROMA_PATH))
    try:
        col = client.get_collection(COLLECTION_NAME)
        return col.count()
    except Exception:
        return 0


def _build_retriever(embeddings: Any) -> Any:
    chroma_client = chromadb.PersistentClient(str(CHROMA_PATH))
    vectorstore = Chroma(
        client=chroma_client,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
    )
    chroma_retriever = vectorstore.as_retriever(search_kwargs={"k": TOP_K})

    all_docs_result = chroma_client.get_collection(COLLECTION_NAME).get(
        include=["documents", "metadatas"]
    )
    bm25_docs = [
        Document(page_content=text, metadata=meta)
        for text, meta in zip(all_docs_result["documents"], all_docs_result["metadatas"])
    ]
    bm25_retriever = BM25Retriever.from_documents(bm25_docs, k=TOP_K)

    ensemble = EnsembleRetriever(
        retrievers=[bm25_retriever, chroma_retriever],
        weights=[0.4, 0.6],
    )

    cross_encoder = HuggingFaceCrossEncoder(model_name=RERANKER_MODEL)
    reranker = CrossEncoderReranker(model=cross_encoder, top_n=TOP_K)
    return ContextualCompressionRetriever(base_compressor=reranker, base_retriever=ensemble)


def retrieve(query: str, embeddings: Any) -> list[Document]:
    if _get_collection_count() == 0:
        return []
    retriever = _build_retriever(embeddings)
    return retriever.invoke(query)


def extract_sources(docs: list[Document]) -> list[str]:
    if not docs:
        return ["Sem identificação da fonte"]
    seen: list[str] = []
    for doc in docs:
        src = doc.metadata.get("source", "")
        if src and src not in seen:
            seen.append(src)
    return seen or ["Sem identificação da fonte"]
