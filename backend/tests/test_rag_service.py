import pytest
from unittest.mock import MagicMock, patch
from langchain_core.documents import Document


def _make_doc(content: str, source: str = "test.pdf") -> Document:
    return Document(page_content=content, metadata={"source": source, "source_id": "abc"})


def test_retrieve_returns_empty_for_empty_collection():
    from services.rag_service import retrieve
    with patch("services.rag_service._get_collection_count", return_value=0):
        docs = retrieve("qualquer pergunta", embeddings=MagicMock())
    assert docs == []


def test_retrieve_sources_from_metadata():
    from services.rag_service import extract_sources
    docs = [_make_doc("texto", "normas.pdf"), _make_doc("outro", "decreto.pdf"), _make_doc("rep", "normas.pdf")]
    sources = extract_sources(docs)
    assert sources == ["normas.pdf", "decreto.pdf"]


def test_extract_sources_empty():
    from services.rag_service import extract_sources
    assert extract_sources([]) == ["Sem identificação da fonte"]


def test_retrieve_uses_retrieval_k_from_config():
    from services.rag_service import retrieve

    doc1 = _make_doc("content 1")
    doc2 = _make_doc("content 2")

    with patch("services.rag_service._get_collection_count", return_value=2), \
         patch("services.rag_service.read_config",
               return_value={"rag_retrieval_k": 1, "rag_score_threshold": 0.0}), \
         patch("services.rag_service._build_ensemble") as mock_ensemble, \
         patch("services.rag_service.HuggingFaceCrossEncoder") as mock_ce_class:

        mock_ens = MagicMock()
        mock_ens.invoke.return_value = [doc1, doc2]
        mock_ensemble.return_value = mock_ens

        mock_ce = MagicMock()
        mock_ce.score.return_value = [0.5, 0.3]
        mock_ce_class.return_value = mock_ce

        result = retrieve("query", embeddings=MagicMock())

    assert len(result) == 1
    assert result[0].page_content == "content 1"


def test_retrieve_filters_below_score_threshold():
    from services.rag_service import retrieve

    doc1 = _make_doc("relevant")
    doc2 = _make_doc("irrelevant")

    with patch("services.rag_service._get_collection_count", return_value=2), \
         patch("services.rag_service.read_config",
               return_value={"rag_retrieval_k": 5, "rag_score_threshold": 0.6}), \
         patch("services.rag_service._build_ensemble") as mock_ensemble, \
         patch("services.rag_service.HuggingFaceCrossEncoder") as mock_ce_class:

        mock_ens = MagicMock()
        mock_ens.invoke.return_value = [doc1, doc2]
        mock_ensemble.return_value = mock_ens

        mock_ce = MagicMock()
        # sigmoid(1.0) ≈ 0.731 > 0.6 → passa; sigmoid(-1.0) ≈ 0.269 < 0.6 → filtrado
        mock_ce.score.return_value = [1.0, -1.0]
        mock_ce_class.return_value = mock_ce

        result = retrieve("query", embeddings=MagicMock())

    assert len(result) == 1
    assert result[0].page_content == "relevant"


def test_retrieve_no_filter_when_threshold_zero():
    from services.rag_service import retrieve

    doc1 = _make_doc("doc1")
    doc2 = _make_doc("doc2")

    with patch("services.rag_service._get_collection_count", return_value=2), \
         patch("services.rag_service.read_config",
               return_value={"rag_retrieval_k": 5, "rag_score_threshold": 0.0}), \
         patch("services.rag_service._build_ensemble") as mock_ensemble, \
         patch("services.rag_service.HuggingFaceCrossEncoder") as mock_ce_class:

        mock_ens = MagicMock()
        mock_ens.invoke.return_value = [doc1, doc2]
        mock_ensemble.return_value = mock_ens

        mock_ce = MagicMock()
        mock_ce.score.return_value = [-5.0, -3.0]
        mock_ce_class.return_value = mock_ce

        result = retrieve("query", embeddings=MagicMock())

    assert len(result) == 2


def test_retrieve_returns_empty_when_all_filtered():
    from services.rag_service import retrieve

    doc1 = _make_doc("doc1")

    with patch("services.rag_service._get_collection_count", return_value=1), \
         patch("services.rag_service.read_config",
               return_value={"rag_retrieval_k": 5, "rag_score_threshold": 0.9}), \
         patch("services.rag_service._build_ensemble") as mock_ensemble, \
         patch("services.rag_service.HuggingFaceCrossEncoder") as mock_ce_class:

        mock_ens = MagicMock()
        mock_ens.invoke.return_value = [doc1]
        mock_ensemble.return_value = mock_ens

        mock_ce = MagicMock()
        mock_ce.score.return_value = [-10.0]  # sigmoid(-10) ≈ 0.0000 < 0.9
        mock_ce_class.return_value = mock_ce

        result = retrieve("query", embeddings=MagicMock())

    assert result == []
