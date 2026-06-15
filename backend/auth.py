import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from paths import USERS_PATH
SECRET_KEY = os.getenv("JWT_SECRET", "neuroguia-dev-secret-change-in-prod")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440  # 24 horas


def _load_users() -> list[dict]:
    return json.loads(USERS_PATH.read_text(encoding="utf-8"))


def _save_users(users: list[dict]) -> None:
    USERS_PATH.write_text(json.dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    if hashed.startswith("$2b$") or hashed.startswith("$2a$"):
        return bcrypt.checkpw(password.encode(), hashed.encode())
    return password == hashed


def create_user(username: str, password: str, role: str) -> None:
    users = _load_users()
    users.append({"username": username, "password": hash_password(password), "role": role})
    _save_users(users)


def authenticate_user(username: str, password: str) -> Optional[dict]:
    for user in _load_users():
        if user["username"] == username and verify_password(password, user["password"]):
            return user
    return None


def create_token(username: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": username, "role": role, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Token invalido: {e}") from e
