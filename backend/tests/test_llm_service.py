import pytest
import json
from unittest.mock import patch, MagicMock
from app.services.llm_service import LlmService
from app.models.chat import ChatResponse

def test_llm_service_retorna_chat_response():
    mock_resposta = json.dumps({
        "message": "Olá! Fico feliz em ajudar.",
        "avatar_state": "happy",
        "movement": "talking",
        "quick_replies": ["Direitos", "Onboard", "Organizar semana"]
    })

    with patch('app.services.llm_service.anthropic.Anthropic') as mock_client:
        mock_message = MagicMock()
        mock_message.content = [MagicMock(text=mock_resposta)]
        mock_client.return_value.messages.create.return_value = mock_message

        service = LlmService()
        resultado = service.responder(
            message="Olá",
            context="",
            history=[]
        )

        assert isinstance(resultado, ChatResponse)
        assert resultado.avatar_state == "happy"
        assert resultado.movement == "talking"
        assert len(resultado.quick_replies) == 3

def test_llm_service_usa_context_no_prompt():
    mock_resposta = json.dumps({
        "message": "Você tem direito a adaptações conforme a LBI.",
        "avatar_state": "encouraging",
        "movement": "talking",
        "quick_replies": ["Como solicitar?", "Prazo?", "Mais direitos"]
    })

    with patch('app.services.llm_service.anthropic.Anthropic') as mock_client:
        mock_message = MagicMock()
        mock_message.content = [MagicMock(text=mock_resposta)]
        mock_client.return_value.messages.create.return_value = mock_message

        service = LlmService()
        service.responder(
            message="quais são meus direitos?",
            context="Lei 13.146/2015 — Art. 28: adaptações razoáveis",
            history=[]
        )

        call_args = mock_client.return_value.messages.create.call_args
        messages = call_args.kwargs['messages']
        assert any("Lei 13.146" in str(m) for m in messages)
