import json
import anthropic
from app.models.chat import ChatRequest, ChatResponse
from app.services.state_manager import build_system_prompt


class LlmService:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.model = "claude-sonnet-4-6"

    def responder(self, message: str, context: str, history: list[dict]) -> ChatResponse:
        system = build_system_prompt()

        messages = list(history)

        user_content = message
        if context:
            user_content = f"[Contexto relevante dos documentos]\n{context}\n\n[Pergunta do usuário]\n{message}"

        messages.append({"role": "user", "content": user_content})

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=system,
            messages=messages,
        )

        raw = response.content[0].text
        data = json.loads(raw)

        return ChatResponse(
            message=data["message"],
            avatar_state=data["avatar_state"],
            movement=data["movement"],
            quick_replies=data.get("quick_replies"),
        )
