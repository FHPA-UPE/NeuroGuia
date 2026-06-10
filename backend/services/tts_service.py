from io import BytesIO
import edge_tts

VOICE = "pt-BR-AntonioNeural"

async def generate_speech(text: str):
    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        rate="-8%",
        pitch="-2Hz"
    )

    audio_bytes = b""

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes += chunk["data"]

    return BytesIO(audio_bytes)