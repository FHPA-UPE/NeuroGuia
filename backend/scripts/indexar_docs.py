import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv()

from app.services.rag_service import RagService

service = RagService(
    persist_dir=os.getenv("CHROMA_PERSIST_DIR", "./data/chroma"),
    docs_dir=os.getenv("DOCS_DIR", "./data/docs"),
)
total = service.indexar_documentos()
print(f"Indexados {total} chunks com sucesso.")
