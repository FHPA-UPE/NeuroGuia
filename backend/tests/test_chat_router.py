import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.models.chat import ChatResponse

client = TestClient(app)

def test_chat_endpoint_retorna_200():
    mock_response = ChatResponse(
        message="Olá! Como posso ajudar?",
        avatar_state="happy",
        movement="talking",
        quick_replies=["Direitos", "Onboard"]
    )

    with patch('app.routers.chat.llm_service.responder', return_value=mock_response), \
         patch('app.routers.chat.rag_service.buscar', return_value=""):
        response = client.post("/chat", json={"message": "Olá", "history": []})
        assert response.status_code == 200

def test_chat_endpoint_retorna_event_stream():
    mock_response = ChatResponse(
        message="Olá! Como posso ajudar?",
        avatar_state="happy",
        movement="talking",
        quick_replies=["Direitos"]
    )

    with patch('app.routers.chat.llm_service.responder', return_value=mock_response), \
         patch('app.routers.chat.rag_service.buscar', return_value=""):
        response = client.post("/chat", json={"message": "Olá", "history": []})
        assert "text/event-stream" in response.headers.get("content-type", "")
