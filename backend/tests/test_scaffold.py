import json
from pathlib import Path

BACKEND = Path(__file__).parent.parent

def test_config_json_has_required_keys():
    cfg = json.loads((BACKEND / "config.json").read_text(encoding="utf-8"))
    for key in ("system_prompt", "llm_provider", "llm_model", "embed_provider", "embed_model"):
        assert key in cfg, f"config.json missing key: {key}"

def test_env_example_has_api_key_placeholders():
    content = (BACKEND / ".env.example").read_text(encoding="utf-8")
    for key in ("ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY"):
        assert key in content

def test_users_json_is_empty_list():
    users = json.loads((BACKEND / "users.json").read_text(encoding="utf-8"))
    assert users == []

def test_docs_directory_exists():
    assert (BACKEND / "docs").is_dir()
