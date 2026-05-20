import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

import auth as auth_module
from providers import mask_key
from services import config_service

router = APIRouter(prefix="/config", tags=["config"])
security = HTTPBearer(auto_error=False)


def _require_admin(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token ausente")
    try:
        user = auth_module.verify_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido")
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requer perfil admin")
    return user


class ConfigUpdate(BaseModel):
    system_prompt: str
    llm_provider: str
    llm_model: str
    embed_provider: str
    embed_model: str


@router.get("")
async def get_config(user: dict = Depends(_require_admin)):
    cfg = config_service.read_config()
    return {
        **cfg,
        "anthropic_api_key": mask_key(os.getenv("ANTHROPIC_API_KEY", "")),
        "openai_api_key": mask_key(os.getenv("OPENAI_API_KEY", "")),
        "google_api_key": mask_key(os.getenv("GOOGLE_API_KEY", "")),
    }


@router.put("")
async def put_config(body: ConfigUpdate, user: dict = Depends(_require_admin)):
    cfg = config_service.read_config()
    cfg.update(body.model_dump())
    config_service.write_config(cfg)
    return {"status": "saved"}
