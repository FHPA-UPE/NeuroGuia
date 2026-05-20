import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient


def _admin_token():
    import auth
    return auth.create_token("admin", "admin")


def _ppgec_token():
    import auth
    return auth.create_token("coord", "admin_ppgec")


@pytest.fixture(autouse=True)
def setup_users(tmp_path, monkeypatch):
    p = tmp_path / "users.json"
    p.write_text("[]", encoding="utf-8")
    import auth
    monkeypatch.setattr(auth, "USERS_PATH", p)
    auth.create_user("admin", "adminpass", "admin")
    auth.create_user("coord", "coordpass", "admin_ppgec")


def test_get_config_requires_admin():
    from main import app
    client = TestClient(app)
    resp = client.get("/config", headers={"Authorization": f"Bearer {_ppgec_token()}"})
    assert resp.status_code == 403


def test_get_config_masks_api_keys(monkeypatch):
    from main import app
    client = TestClient(app)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-abcd1234")
    resp = client.get("/config", headers={"Authorization": f"Bearer {_admin_token()}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "system_prompt" in data
    assert data["anthropic_api_key"] == "***1234"


def test_put_config_saves(monkeypatch):
    from main import app
    client = TestClient(app)
    new_cfg = {
        "system_prompt": "novo prompt",
        "llm_provider": "openai",
        "llm_model": "gpt-4o",
        "embed_provider": "openai",
        "embed_model": "text-embedding-3-small"
    }
    with patch("services.config_service.write_config") as mock_write:
        resp = client.put("/config", json=new_cfg, headers={"Authorization": f"Bearer {_admin_token()}"})
    assert resp.status_code == 200
    mock_write.assert_called_once()
