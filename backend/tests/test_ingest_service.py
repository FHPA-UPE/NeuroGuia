import hashlib
import pytest
from pathlib import Path


@pytest.fixture
def txt_file(tmp_path):
    f = tmp_path / "sample.txt"
    f.write_text(
        "Artigo 1. O prazo de matrícula é de 30 dias.\n\nArtigo 2. O aluno deve apresentar laudo médico.",
        encoding="utf-8",
    )
    return f


def test_compute_sha256(txt_file):
    from services.ingest_service import compute_sha256

    h = compute_sha256(txt_file)
    expected = hashlib.sha256(txt_file.read_bytes()).hexdigest()
    assert h == expected


def test_load_and_chunk_txt(txt_file):
    from services.ingest_service import load_and_chunk

    chunks = load_and_chunk(txt_file, source_id="abc123")
    assert len(chunks) >= 1
    for c in chunks:
        assert c.metadata["source"] == "sample.txt"
        assert c.metadata["source_id"] == "abc123"
        assert len(c.page_content) > 0


def test_is_duplicate_false_for_new_source(tmp_path):
    import chromadb
    from services.ingest_service import is_duplicate

    client = chromadb.EphemeralClient()
    col = client.get_or_create_collection("test")
    assert not is_duplicate("newid", col)


def test_is_duplicate_true_for_existing(tmp_path):
    import chromadb
    from services.ingest_service import is_duplicate

    client = chromadb.EphemeralClient()
    col = client.get_or_create_collection("test")
    col.add(ids=["doc1"], documents=["text"], metadatas=[{"source_id": "sha256abc"}])
    assert is_duplicate("sha256abc", col)


def test_load_and_chunk_uses_chunk_size_from_config(txt_file):
    from unittest.mock import patch, MagicMock
    from services import ingest_service

    with patch("services.ingest_service.read_config", return_value={"rag_chunk_size": 600}), \
         patch("services.ingest_service.RecursiveCharacterTextSplitter") as mock_splitter_cls:

        mock_splitter = MagicMock()
        mock_splitter.split_documents.return_value = []
        mock_splitter_cls.return_value = mock_splitter

        ingest_service.load_and_chunk(txt_file, "abc")

    mock_splitter_cls.assert_called_once_with(
        chunk_size=600,
        chunk_overlap=round(600 * 0.17),
        separators=["\n\n", "\n", "Art.", "§", ". ", " "],
    )
