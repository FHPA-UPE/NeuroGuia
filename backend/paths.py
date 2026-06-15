import os
from pathlib import Path

_BASE = Path(os.getenv("DATA_DIR", str(Path(__file__).parent)))

USERS_PATH  = _BASE / "users.json"
CONFIG_PATH = _BASE / "config.json"
CHROMA_PATH = _BASE / "chroma_db"
DOCS_PATH   = _BASE / "docs"
