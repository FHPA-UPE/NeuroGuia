import importlib
from pathlib import Path


def test_default_paths_relative_to_backend(monkeypatch):
    monkeypatch.delenv("DATA_DIR", raising=False)
    import paths
    importlib.reload(paths)
    backend_dir = Path(__file__).parent.parent
    assert paths.USERS_PATH == backend_dir / "users.json"
    assert paths.CONFIG_PATH == backend_dir / "config.json"
    assert paths.CHROMA_PATH == backend_dir / "chroma_db"
    assert paths.DOCS_PATH == backend_dir / "docs"


def test_data_dir_env_overrides_base(monkeypatch, tmp_path):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    import paths
    importlib.reload(paths)
    assert paths.USERS_PATH == tmp_path / "users.json"
    assert paths.CONFIG_PATH == tmp_path / "config.json"
    assert paths.CHROMA_PATH == tmp_path / "chroma_db"
    assert paths.DOCS_PATH == tmp_path / "docs"
