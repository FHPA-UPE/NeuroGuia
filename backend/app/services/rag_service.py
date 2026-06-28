import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma


class RagService:
    def __init__(self, persist_dir: str, docs_dir: str):
        self.persist_dir = persist_dir
        self.docs_dir = docs_dir
        self.vectorstore = Chroma(persist_directory=persist_dir)

    def indexar_documentos(self) -> int:
        docs_path = Path(self.docs_dir)
        pdfs = list(docs_path.glob("*.pdf"))
        if not pdfs:
            return 0

        documentos = []
        for pdf in pdfs:
            loader = PyPDFLoader(str(pdf))
            documentos.extend(loader.load())

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(documentos)

        self.vectorstore.add_documents(chunks)
        return len(chunks)

    def buscar(self, query: str, k: int = 4) -> str:
        context, _ = self.buscar_com_chunks(query, k)
        return context

    def buscar_com_chunks(self, query: str, k: int = 4) -> tuple[str, list[str]]:
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})
        docs = retriever.invoke(query)
        if not docs:
            return "", []
        chunks = [doc.page_content for doc in docs]
        return "\n\n".join(chunks), chunks
