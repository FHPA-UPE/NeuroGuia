import json
import pytest
from pathlib import Path

@pytest.fixture(autouse=True)
def tmp_users(tmp_path, monkeypatch):
    p = tmp_path / "users.json"
    p.write_text("[]", encoding="utf-8")
    import auth
    monkeypatch.setattr(auth, "USERS_PATH", p)
    return p

def test_hash_and_verify_password():
    import auth
    hashed = auth.hash_password("secret")
    assert auth.verify_password("secret", hashed)
    assert not auth.verify_password("wrong", hashed)

def test_create_user_and_load(tmp_users):
    import auth
    auth.create_user("alice", "pass123", "estudante")
    users = json.loads(tmp_users.read_text(encoding="utf-8"))
    assert len(users) == 1
    assert users[0]["username"] == "alice"
    assert users[0]["role"] == "estudante"

def test_authenticate_user_success(tmp_users):
    import auth
    auth.create_user("bob", "mypass", "admin")
    user = auth.authenticate_user("bob", "mypass")
    assert user is not None
    assert user["role"] == "admin"

def test_authenticate_user_wrong_password(tmp_users):
    import auth
    auth.create_user("carol", "correct", "estudante")
    assert auth.authenticate_user("carol", "wrong") is None

def test_authenticate_user_not_found(tmp_users):
    import auth
    assert auth.authenticate_user("nobody", "pass") is None

def test_create_and_verify_token():
    import auth
    token = auth.create_token("diana", "admin_ppgec")
    payload = auth.verify_token(token)
    assert payload["sub"] == "diana"
    assert payload["role"] == "admin_ppgec"

def test_verify_token_invalid():
    import auth
    with pytest.raises(Exception):
        auth.verify_token("not.a.valid.token")
