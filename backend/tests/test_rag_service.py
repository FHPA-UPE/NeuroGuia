import pytest
from unittest.mock import patch, MagicMock
from app.services.rag_service import RagService

def test_rag_service_inicializa():
    with patch('app.services.rag_service.Chroma') as mock_chroma:
        mock_chroma.return_value = MagicMock()
        service = RagService(persist_dir="./test_chroma", docs_dir="./test_docs")
        assert service is not None

def test_buscar_retorna_string():
    with patch('app.services.rag_service.Chroma') as mock_chroma:
        mock_retriever = MagicMock()
        mock_retriever.invoke.return_value = [
            MagicMock(page_content="Estudantes com deficiência têm direito a adaptações razoáveis.")
        ]
        mock_chroma.return_value.as_retriever.return_value = mock_retriever

        service = RagService(persist_dir="./test_chroma", docs_dir="./test_docs")
        resultado = service.buscar("quais são meus direitos?")

        assert isinstance(resultado, str)
        assert len(resultado) > 0

def test_buscar_retorna_string_vazia_sem_resultados():
    with patch('app.services.rag_service.Chroma') as mock_chroma:
        mock_retriever = MagicMock()
        mock_retriever.invoke.return_value = []
        mock_chroma.return_value.as_retriever.return_value = mock_retriever

        service = RagService(persist_dir="./test_chroma", docs_dir="./test_docs")
        resultado = service.buscar("pergunta sem contexto")

        assert resultado == ""
