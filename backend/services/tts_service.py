import edge_tts
from typing import AsyncGenerator

VOICE = "pt-BR-AntonioNeural"

async def generate_speech(text: str) -> AsyncGenerator[bytes, None]:
    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        rate="-8%",
        pitch="-2Hz"
    )

    async def _stream():
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

    return _stream()