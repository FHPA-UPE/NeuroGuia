from pydantic import BaseModel
from typing import Literal, Optional


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    message: str
    avatar_state: Literal["neutral", "happy", "encouraging", "empathetic", "thoughtful"]
    movement: Literal["idle", "talking", "thinking"]
    quick_replies: Optional[list[str]] = None
