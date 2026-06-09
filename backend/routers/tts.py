from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.tts_service import generate_speech

router = APIRouter()

class TTSRequest(BaseModel):
    text: str

@router.post("/tts")
async def tts(req: TTSRequest):
    audio = await generate_speech(req.text)

    return StreamingResponse(
        audio,
        media_type="audio/mpeg"
    )