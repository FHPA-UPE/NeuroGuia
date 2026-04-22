# NeuroGuia — UX/UI com Avatar OLLIE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a camada UX/UI completa do NeuroGuia — avatar OLLIE animado com estados reativos, interface de chat acessível, e backend FastAPI com RAG e saída estruturada de avatar_state via SSE.

**Architecture:** Frontend Next.js renderiza a OLLIE (Rive) e a UI de chat. Backend FastAPI processa mensagens via RAG (LangChain + ChromaDB), chama Claude API com structured output retornando `avatar_state` + `movement`, e envia a resposta via SSE. O frontend usa `avatar_state` para controlar a State Machine do Rive.

**Tech Stack:** Next.js 14, React 18, TypeScript, @rive-app/react, FastAPI, LangChain, ChromaDB, anthropic Python SDK (claude-sonnet-4-6), pytest, Jest + React Testing Library

---

## Mapa de Arquivos

### Frontend (`frontend/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/types/chat.ts` | Tipos compartilhados: ChatMessage, ChatResponse, AvatarState, Movement |
| `src/components/OllieAvatar/OllieAvatar.tsx` | Rive player reativo aos estados |
| `src/components/OllieAvatar/OllieAvatar.test.tsx` | Testes de troca de estado |
| `src/components/ChatBubble/ChatBubble.tsx` | Balão de mensagem acessível |
| `src/components/ChatBubble/ChatBubble.test.tsx` | Testes de renderização |
| `src/components/QuickReply/QuickReply.tsx` | Botões de resposta rápida |
| `src/components/QuickReply/QuickReply.test.tsx` | Testes de clique |
| `src/components/ChatInput/ChatInput.tsx` | Input com Enter-to-send |
| `src/components/ChatInput/ChatInput.test.tsx` | Testes de submit |
| `src/hooks/useChat.ts` | Hook SSE: estado do chat + envio de mensagens |
| `src/hooks/useChat.test.ts` | Testes do hook |
| `src/components/ChatInterface/ChatInterface.tsx` | Componente raiz que compõe tudo |
| `src/components/ChatInterface/ChatInterface.test.tsx` | Teste de integração |
| `src/app/page.tsx` | Entry point Next.js |
| `src/app/globals.css` | Estilos globais: Atkinson Hyperlegible + prefers-reduced-motion |
| `public/ollie.riv` | Arquivo Rive (substituir pelo real após trabalho no Rive editor) |

### Backend (`backend/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `app/models/chat.py` | Pydantic models: ChatRequest, ChatResponse |
| `app/services/state_manager.py` | System prompt com instruções de avatar_state |
| `app/services/rag_service.py` | LangChain + ChromaDB: indexar e consultar documentos |
| `app/services/llm_service.py` | Chamada Claude API com structured output |
| `app/routers/chat.py` | FastAPI SSE endpoint |
| `app/main.py` | App FastAPI com CORS |
| `tests/test_state_manager.py` | Testes do system prompt |
| `tests/test_rag_service.py` | Testes de retrieval |
| `tests/test_llm_service.py` | Testes de structured output |
| `tests/test_chat_router.py` | Testes do endpoint SSE |
| `data/docs/` | Diretório para os PDFs (LBI, Decreto 12.686, MEC 3.284, Normas UPE) |
| `requirements.txt` | Dependências Python |

---

## Task 1: Setup do Projeto

**Files:**
- Create: `frontend/package.json`
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`

- [ ] **Step 1: Criar projeto Next.js**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd frontend
```

- [ ] **Step 2: Instalar dependências do frontend**

```bash
npm install @rive-app/react
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 3: Mover estrutura para src/**

```bash
mkdir -p src/components/OllieAvatar src/components/ChatBubble src/components/QuickReply src/components/ChatInput src/components/ChatInterface src/hooks src/types
mv app src/app
```

- [ ] **Step 4: Criar jest.config.js**

```javascript
// frontend/jest.config.js
const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
})
```

- [ ] **Step 5: Criar jest.setup.ts**

```typescript
// frontend/jest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Criar projeto backend**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
mkdir -p backend/app/models backend/app/services backend/app/routers backend/tests backend/data/docs
touch backend/app/__init__.py backend/app/models/__init__.py backend/app/services/__init__.py backend/app/routers/__init__.py
```

- [ ] **Step 7: Criar requirements.txt**

```
# backend/requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
pydantic==2.7.0
anthropic==0.34.0
langchain==0.3.0
langchain-community==0.3.0
langchain-anthropic==0.3.0
chromadb==0.5.0
pypdf==4.3.0
python-dotenv==1.0.1
httpx==0.27.0
pytest==8.3.0
pytest-asyncio==0.24.0
httpx==0.27.0
```

- [ ] **Step 8: Instalar dependências do backend**

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
```

- [ ] **Step 9: Criar .env**

```bash
# backend/.env
ANTHROPIC_API_KEY=sua_chave_aqui
CHROMA_PERSIST_DIR=./data/chroma
DOCS_DIR=./data/docs
```

- [ ] **Step 10: Commit**

```bash
cd C:/Users/FHPA/Desktop/NeuroGuia
git init
git add .
git commit -m "feat: scaffold frontend Next.js e backend FastAPI"
```

---

## Task 2: Tipos Compartilhados (Frontend)

**Files:**
- Create: `frontend/src/types/chat.ts`

- [ ] **Step 1: Criar chat.ts**

```typescript
// frontend/src/types/chat.ts
export type AvatarState = 'neutral' | 'happy' | 'encouraging' | 'empathetic' | 'thoughtful'
export type Movement = 'idle' | 'talking' | 'thinking'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  avatar_state?: AvatarState
  movement?: Movement
  quick_replies?: string[]
}

export interface ChatResponse {
  message: string
  avatar_state: AvatarState
  movement: Movement
  quick_replies?: string[]
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/chat.ts
git commit -m "feat: tipos ChatMessage, ChatResponse, AvatarState"
```

---

## Task 3: Backend — Models e State Manager

**Files:**
- Create: `backend/app/models/chat.py`
- Create: `backend/app/services/state_manager.py`
- Create: `backend/tests/test_state_manager.py`

- [ ] **Step 1: Escrever teste para o State Manager**

```python
# backend/tests/test_state_manager.py
from app.services.state_manager import build_system_prompt

def test_system_prompt_contem_instrucoes_de_avatar_state():
    prompt = build_system_prompt()
    assert "avatar_state" in prompt
    assert "neutral" in prompt
    assert "happy" in prompt
    assert "encouraging" in prompt
    assert "empathetic" in prompt
    assert "thoughtful" in prompt

def test_system_prompt_contem_instrucoes_de_movement():
    prompt = build_system_prompt()
    assert "movement" in prompt
    assert "idle" in prompt
    assert "talking" in prompt
    assert "thinking" in prompt

def test_system_prompt_nao_vazio():
    prompt = build_system_prompt()
    assert len(prompt) > 200
```

- [ ] **Step 2: Rodar teste e confirmar falha**

```bash
cd backend
pytest tests/test_state_manager.py -v
```
Esperado: FAIL com `ModuleNotFoundError`

- [ ] **Step 3: Criar models/chat.py**

```python
# backend/app/models/chat.py
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
```

- [ ] **Step 4: Criar services/state_manager.py**

```python
# backend/app/services/state_manager.py

def build_system_prompt() -> str:
    return """Você é OLLIE, uma coruja sábia e acolhedora que ajuda estudantes neurodivergentes 
da PPGEC/UPE com dúvidas acadêmicas e direitos de acessibilidade.

PERSONALIDADE: Paciente, atenta, sem julgamento. Celebra pequenas conquistas.
Use linguagem simples, direta e sem jargão jurídico.

FORMATO DE RESPOSTA: Responda SEMPRE em JSON válido com exatamente estes campos:
{
  "message": "sua resposta aqui (máximo 3 frases curtas)",
  "avatar_state": "<estado>",
  "movement": "<movimento>",
  "quick_replies": ["opção 1", "opção 2", "opção 3"]
}

REGRAS PARA avatar_state:
- "happy": saudações, boas-vindas, celebração de conquistas
- "encouraging": explicando direitos, orientando passos, instruções
- "empathetic": usuário relata dificuldade, sobrecarga ou frustração
- "thoughtful": buscando informação, resposta complexa
- "neutral": respostas informativas padrão, navegação

REGRAS PARA movement:
- "talking": sempre que enviar uma resposta de texto
- "thinking": quando a resposta exigir busca ou raciocínio complexo
- "idle": nunca usar neste contexto (reservado para aguardar input)

quick_replies: forneça sempre 2-3 opções curtas relevantes para o próximo passo do usuário.
"""
```

- [ ] **Step 5: Rodar testes e confirmar aprovação**

```bash
pytest tests/test_state_manager.py -v
```
Esperado: 3 testes PASS

- [ ] **Step 6: Commit**

```bash
git add backend/app/models/chat.py backend/app/services/state_manager.py backend/tests/test_state_manager.py
git commit -m "feat: models ChatRequest/ChatResponse e state_manager system prompt"
```

---

## Task 4: Backend — RAG Service

**Files:**
- Create: `backend/app/services/rag_service.py`
- Create: `backend/tests/test_rag_service.py`

- [ ] **Step 1: Escrever testes para RAG Service**

```python
# backend/tests/test_rag_service.py
import pytest
from unittest.mock import patch, MagicMock
from app.services.rag_service import RagService

def test_rag_service_inicializa():
    with patch('app.services.rag_service.Chroma') as mock_chroma:
        mock_chroma.return_value = MagicMock()
        service = RagService(persist_dir="./test_chroma", docs_dir="./test_docs")
        assert service is not None

def test_buscar_retorna_string():
    with patch('app.services.rag_service.Chroma') as mock_chroma:
        mock_retriever = MagicMock()
        mock_retriever.invoke.return_value = [
            MagicMock(page_content="Estudantes com deficiência têm direito a adaptações razoáveis.")
        ]
        mock_chroma.return_value.as_retriever.return_value = mock_retriever
        
        service = RagService(persist_dir="./test_chroma", docs_dir="./test_docs")
        resultado = service.buscar("quais são meus direitos?")
        
        assert isinstance(resultado, str)
        assert len(resultado) > 0

def test_buscar_retorna_string_vazia_sem_resultados():
    with patch('app.services.rag_service.Chroma') as mock_chroma:
        mock_retriever = MagicMock()
        mock_retriever.invoke.return_value = []
        mock_chroma.return_value.as_retriever.return_value = mock_retriever
        
        service = RagService(persist_dir="./test_chroma", docs_dir="./test_docs")
        resultado = service.buscar("pergunta sem contexto")
        
        assert resultado == ""
```

- [ ] **Step 2: Rodar testes e confirmar falha**

```bash
pytest tests/test_rag_service.py -v
```
Esperado: FAIL com `ModuleNotFoundError`

- [ ] **Step 3: Criar services/rag_service.py**

```python
# backend/app/services/rag_service.py
import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_anthropic import AnthropicEmbeddings

class RagService:
    def __init__(self, persist_dir: str, docs_dir: str):
        self.persist_dir = persist_dir
        self.docs_dir = docs_dir
        self.vectorstore = Chroma(persist_directory=persist_dir)
    
    def indexar_documentos(self) -> int:
        docs_path = Path(self.docs_dir)
        pdfs = list(docs_path.glob("*.pdf"))
        if not pdfs:
            return 0
        
        documentos = []
        for pdf in pdfs:
            loader = PyPDFLoader(str(pdf))
            documentos.extend(loader.load())
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(documentos)
        
        self.vectorstore.add_documents(chunks)
        return len(chunks)
    
    def buscar(self, query: str, k: int = 4) -> str:
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})
        docs = retriever.invoke(query)
        if not docs:
            return ""
        return "\n\n".join(doc.page_content for doc in docs)
```

- [ ] **Step 4: Rodar testes e confirmar aprovação**

```bash
pytest tests/test_rag_service.py -v
```
Esperado: 3 testes PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/rag_service.py backend/tests/test_rag_service.py
git commit -m "feat: RAG service com LangChain + ChromaDB"
```

---

## Task 5: Backend — LLM Service + Endpoint SSE

**Files:**
- Create: `backend/app/services/llm_service.py`
- Create: `backend/app/routers/chat.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/test_llm_service.py`
- Create: `backend/tests/test_chat_router.py`

- [ ] **Step 1: Escrever testes para LLM Service**

```python
# backend/tests/test_llm_service.py
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
```

- [ ] **Step 2: Rodar testes e confirmar falha**

```bash
pytest tests/test_llm_service.py -v
```
Esperado: FAIL

- [ ] **Step 3: Criar services/llm_service.py**

```python
# backend/app/services/llm_service.py
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
```

- [ ] **Step 4: Rodar testes e confirmar aprovação**

```bash
pytest tests/test_llm_service.py -v
```
Esperado: 2 testes PASS

- [ ] **Step 5: Escrever teste para chat router**

```python
# backend/tests/test_chat_router.py
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
```

- [ ] **Step 6: Criar routers/chat.py**

```python
# backend/app/routers/chat.py
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.chat import ChatRequest
from app.services.llm_service import LlmService
from app.services.rag_service import RagService
import os

router = APIRouter()
llm_service = LlmService()
rag_service = RagService(
    persist_dir=os.getenv("CHROMA_PERSIST_DIR", "./data/chroma"),
    docs_dir=os.getenv("DOCS_DIR", "./data/docs"),
)

async def stream_resposta(request: ChatRequest):
    context = rag_service.buscar(request.message)
    response = llm_service.responder(
        message=request.message,
        context=context,
        history=request.history,
    )
    data = json.dumps(response.model_dump())
    yield f"data: {data}\n\n"

@router.post("/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_resposta(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

- [ ] **Step 7: Criar main.py**

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.chat import router

app = FastAPI(title="NeuroGuia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(router)
```

- [ ] **Step 8: Rodar todos os testes backend**

```bash
pytest tests/ -v
```
Esperado: todos PASS

- [ ] **Step 9: Verificar servidor sobe**

```bash
uvicorn app.main:app --reload --port 8000
```
Esperado: `Application startup complete.` na porta 8000. Encerrar com Ctrl+C.

- [ ] **Step 10: Commit**

```bash
git add backend/
git commit -m "feat: LLM service, RAG service, endpoint SSE /chat"
```

---

## Task 6: Frontend — OllieAvatar Component

**Files:**
- Create: `frontend/src/components/OllieAvatar/OllieAvatar.tsx`
- Create: `frontend/src/components/OllieAvatar/OllieAvatar.test.tsx`
- Create: `frontend/public/ollie.riv` (placeholder vazio — substituir pelo arquivo real)

- [ ] **Step 1: Criar arquivo Rive placeholder**

```bash
# Cria um arquivo vazio como placeholder — substituir pelo ollie.riv real após trabalho no Rive editor
touch frontend/public/ollie.riv
echo "PLACEHOLDER — substituir pelo arquivo ollie.riv exportado do Rive editor" > frontend/public/ollie.riv
```

- [ ] **Step 2: Escrever testes para OllieAvatar**

```typescript
// frontend/src/components/OllieAvatar/OllieAvatar.test.tsx
import { render, screen } from '@testing-library/react'
import OllieAvatar from './OllieAvatar'

jest.mock('@rive-app/react', () => ({
  useRive: jest.fn(() => ({
    rive: { setInputState: jest.fn() },
    RiveComponent: () => <canvas data-testid="rive-canvas" />,
  })),
  Layout: { Contain: 'contain' },
}))

describe('OllieAvatar', () => {
  it('renderiza o canvas do Rive', () => {
    render(<OllieAvatar avatarState="neutral" movement="idle" />)
    expect(screen.getByTestId('rive-canvas')).toBeInTheDocument()
  })

  it('renderiza fallback acessível quando Rive não está disponível', () => {
    const { useRive } = require('@rive-app/react')
    useRive.mockReturnValueOnce({ rive: null, RiveComponent: () => null })
    render(<OllieAvatar avatarState="happy" movement="talking" />)
    expect(screen.getByRole('img', { name: /ollie/i })).toBeInTheDocument()
  })

  it('tem aria-label descrevendo o estado atual', () => {
    render(<OllieAvatar avatarState="empathetic" movement="talking" />)
    const container = screen.getByLabelText(/ollie está empathetic/i)
    expect(container).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Rodar testes e confirmar falha**

```bash
cd frontend
npx jest src/components/OllieAvatar/OllieAvatar.test.tsx
```
Esperado: FAIL com `Cannot find module './OllieAvatar'`

- [ ] **Step 4: Criar OllieAvatar.tsx**

```typescript
// frontend/src/components/OllieAvatar/OllieAvatar.tsx
'use client'
import { useEffect } from 'react'
import { useRive, Layout } from '@rive-app/react'
import type { AvatarState, Movement } from '@/types/chat'

interface OllieAvatarProps {
  avatarState: AvatarState
  movement: Movement
}

export default function OllieAvatar({ avatarState, movement }: OllieAvatarProps) {
  const { rive, RiveComponent } = useRive({
    src: '/ollie.riv',
    autoplay: true,
    layout: new Layout({ fit: 'contain' }),
  })

  useEffect(() => {
    if (!rive) return
    rive.setInputState('expression', avatarState)
    rive.setInputState('movement', movement)
  }, [rive, avatarState, movement])

  if (!RiveComponent) {
    return (
      <img
        role="img"
        aria-label="OLLIE a coruja"
        src="/ollie-fallback.png"
        alt="OLLIE a coruja"
        className="w-48 h-48"
      />
    )
  }

  return (
    <div
      aria-label={`OLLIE está ${avatarState}`}
      className="w-48 h-48"
    >
      <RiveComponent />
    </div>
  )
}
```

- [ ] **Step 5: Rodar testes e confirmar aprovação**

```bash
npx jest src/components/OllieAvatar/OllieAvatar.test.tsx
```
Esperado: 3 testes PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/OllieAvatar/ frontend/public/ollie.riv
git commit -m "feat: OllieAvatar component com Rive e fallback acessível"
```

---

## Task 7: Frontend — ChatBubble, QuickReply, ChatInput

**Files:**
- Create: `frontend/src/components/ChatBubble/ChatBubble.tsx`
- Create: `frontend/src/components/ChatBubble/ChatBubble.test.tsx`
- Create: `frontend/src/components/QuickReply/QuickReply.tsx`
- Create: `frontend/src/components/QuickReply/QuickReply.test.tsx`
- Create: `frontend/src/components/ChatInput/ChatInput.tsx`
- Create: `frontend/src/components/ChatInput/ChatInput.test.tsx`

- [ ] **Step 1: Escrever testes para ChatBubble**

```typescript
// frontend/src/components/ChatBubble/ChatBubble.test.tsx
import { render, screen } from '@testing-library/react'
import ChatBubble from './ChatBubble'

describe('ChatBubble', () => {
  it('renderiza mensagem do assistente', () => {
    render(<ChatBubble role="assistant" content="Olá! Como posso ajudar?" />)
    expect(screen.getByText('Olá! Como posso ajudar?')).toBeInTheDocument()
  })

  it('renderiza mensagem do usuário', () => {
    render(<ChatBubble role="user" content="Quais são meus direitos?" />)
    expect(screen.getByText('Quais são meus direitos?')).toBeInTheDocument()
  })

  it('tem role="log" para leitores de tela', () => {
    const { container } = render(<ChatBubble role="assistant" content="teste" />)
    expect(container.firstChild).toHaveAttribute('role', 'log')
  })
})
```

- [ ] **Step 2: Criar ChatBubble.tsx**

```typescript
// frontend/src/components/ChatBubble/ChatBubble.tsx
interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === 'assistant'
  return (
    <div
      role="log"
      aria-live="polite"
      className={`max-w-[80%] rounded-2xl px-4 py-3 text-lg leading-relaxed font-[Atkinson_Hyperlegible] ${
        isAssistant
          ? 'bg-[#2D5016] text-white self-start'
          : 'bg-[#C8860A] text-white self-end'
      }`}
    >
      {content}
    </div>
  )
}
```

- [ ] **Step 3: Escrever testes para QuickReply**

```typescript
// frontend/src/components/QuickReply/QuickReply.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuickReply from './QuickReply'

describe('QuickReply', () => {
  it('renderiza todas as opções', () => {
    render(<QuickReply options={['Direitos', 'Onboard', 'Ajuda']} onSelect={jest.fn()} />)
    expect(screen.getByText('Direitos')).toBeInTheDocument()
    expect(screen.getByText('Onboard')).toBeInTheDocument()
    expect(screen.getByText('Ajuda')).toBeInTheDocument()
  })

  it('chama onSelect com o texto correto ao clicar', async () => {
    const onSelect = jest.fn()
    render(<QuickReply options={['Direitos']} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Direitos'))
    expect(onSelect).toHaveBeenCalledWith('Direitos')
  })

  it('não renderiza nada quando options está vazio', () => {
    const { container } = render(<QuickReply options={[]} onSelect={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 4: Criar QuickReply.tsx**

```typescript
// frontend/src/components/QuickReply/QuickReply.tsx
interface QuickReplyProps {
  options: string[]
  onSelect: (option: string) => void
}

export default function QuickReply({ options, onSelect }: QuickReplyProps) {
  if (options.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Opções rápidas de resposta">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="rounded-full border-2 border-[#2D5016] text-[#2D5016] px-4 py-2 text-base font-[Atkinson_Hyperlegible] hover:bg-[#2D5016] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8860A]"
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Escrever testes para ChatInput**

```typescript
// frontend/src/components/ChatInput/ChatInput.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from './ChatInput'

describe('ChatInput', () => {
  it('renderiza o campo de texto', () => {
    render(<ChatInput onSubmit={jest.fn()} disabled={false} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('envia ao pressionar Enter', async () => {
    const onSubmit = jest.fn()
    render(<ChatInput onSubmit={onSubmit} disabled={false} />)
    await userEvent.type(screen.getByRole('textbox'), 'Olá{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Olá')
  })

  it('não envia mensagem vazia', async () => {
    const onSubmit = jest.fn()
    render(<ChatInput onSubmit={onSubmit} disabled={false} />)
    await userEvent.type(screen.getByRole('textbox'), '{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('desabilita input quando disabled=true', () => {
    render(<ChatInput onSubmit={jest.fn()} disabled={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
```

- [ ] **Step 6: Criar ChatInput.tsx**

```typescript
// frontend/src/components/ChatInput/ChatInput.tsx
'use client'
import { useState } from 'react'

interface ChatInputProps {
  onSubmit: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim())
      setValue('')
    }
  }

  return (
    <div className="flex gap-2 p-4 border-t border-[#2D5016]/20">
      <input
        role="textbox"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Digite sua mensagem..."
        aria-label="Mensagem para OLLIE"
        className="flex-1 rounded-full border-2 border-[#2D5016] px-4 py-2 text-lg font-[Atkinson_Hyperlegible] focus:outline-none focus:ring-2 focus:ring-[#C8860A] disabled:opacity-50"
      />
    </div>
  )
}
```

- [ ] **Step 7: Rodar todos os testes de componentes**

```bash
npx jest src/components/ --testPathPattern="ChatBubble|QuickReply|ChatInput"
```
Esperado: 10 testes PASS

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/ChatBubble/ frontend/src/components/QuickReply/ frontend/src/components/ChatInput/
git commit -m "feat: ChatBubble, QuickReply, ChatInput com testes"
```

---

## Task 8: Frontend — useChat Hook

**Files:**
- Create: `frontend/src/hooks/useChat.ts`
- Create: `frontend/src/hooks/useChat.test.ts`

- [ ] **Step 1: Escrever testes para useChat**

```typescript
// frontend/src/hooks/useChat.test.ts
import { renderHook, act } from '@testing-library/react'
import { useChat } from './useChat'

global.fetch = jest.fn()

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('inicia com histórico vazio e não carregando', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.messages).toHaveLength(0)
    expect(result.current.isLoading).toBe(false)
  })

  it('adiciona mensagem do usuário ao enviar', async () => {
    const mockResponse = {
      message: 'Olá!',
      avatar_state: 'happy',
      movement: 'talking',
      quick_replies: ['Direitos'],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode(`data: ${JSON.stringify(mockResponse)}\n\n`),
            })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Olá')
    })

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0].role).toBe('user')
    expect(result.current.messages[0].content).toBe('Olá')
    expect(result.current.messages[1].role).toBe('assistant')
    expect(result.current.messages[1].avatar_state).toBe('happy')
  })
})
```

- [ ] **Step 2: Rodar teste e confirmar falha**

```bash
npx jest src/hooks/useChat.test.ts
```
Esperado: FAIL

- [ ] **Step 3: Criar useChat.ts**

```typescript
// frontend/src/hooks/useChat.ts
'use client'
import { useState, useCallback } from 'react'
import type { ChatMessage, ChatResponse, AvatarState, Movement } from '@/types/chat'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [avatarState, setAvatarState] = useState<AvatarState>('neutral')
  const [movement, setMovement] = useState<Movement>('idle')

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setMovement('thinking')

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data: ChatResponse = JSON.parse(line.slice(6))
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          avatar_state: data.avatar_state,
          movement: data.movement,
          quick_replies: data.quick_replies,
        }
        setMessages((prev) => [...prev, assistantMessage])
        setAvatarState(data.avatar_state)
        setMovement(data.movement)
      }
    }

    setIsLoading(false)
    setMovement('idle')
  }, [messages])

  return { messages, isLoading, avatarState, movement, sendMessage }
}
```

- [ ] **Step 4: Rodar testes e confirmar aprovação**

```bash
npx jest src/hooks/useChat.test.ts
```
Esperado: 3 testes PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/
git commit -m "feat: useChat hook com SSE streaming e estado do avatar"
```

---

## Task 9: Frontend — ChatInterface + Page

**Files:**
- Create: `frontend/src/components/ChatInterface/ChatInterface.tsx`
- Create: `frontend/src/components/ChatInterface/ChatInterface.test.tsx`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Escrever teste de integração**

```typescript
// frontend/src/components/ChatInterface/ChatInterface.test.tsx
import { render, screen } from '@testing-library/react'
import ChatInterface from './ChatInterface'

jest.mock('@rive-app/react', () => ({
  useRive: jest.fn(() => ({
    rive: { setInputState: jest.fn() },
    RiveComponent: () => <canvas data-testid="rive-canvas" />,
  })),
  Layout: { Contain: 'contain' },
}))

jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn(() => ({
    messages: [],
    isLoading: false,
    avatarState: 'neutral',
    movement: 'idle',
    sendMessage: jest.fn(),
  })),
}))

describe('ChatInterface', () => {
  it('renderiza OLLIE e o campo de input', () => {
    render(<ChatInterface />)
    expect(screen.getByTestId('rive-canvas')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('exibe mensagens do histórico', () => {
    const { useChat } = require('@/hooks/useChat')
    useChat.mockReturnValueOnce({
      messages: [
        { id: '1', role: 'assistant', content: 'Olá! Como posso ajudar?' },
      ],
      isLoading: false,
      avatarState: 'happy',
      movement: 'talking',
      sendMessage: jest.fn(),
    })
    render(<ChatInterface />)
    expect(screen.getByText('Olá! Como posso ajudar?')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar teste e confirmar falha**

```bash
npx jest src/components/ChatInterface/ChatInterface.test.tsx
```
Esperado: FAIL

- [ ] **Step 3: Criar ChatInterface.tsx**

```typescript
// frontend/src/components/ChatInterface/ChatInterface.tsx
'use client'
import OllieAvatar from '@/components/OllieAvatar/OllieAvatar'
import ChatBubble from '@/components/ChatBubble/ChatBubble'
import QuickReply from '@/components/QuickReply/QuickReply'
import ChatInput from '@/components/ChatInput/ChatInput'
import { useChat } from '@/hooks/useChat'

export default function ChatInterface() {
  const { messages, isLoading, avatarState, movement, sendMessage } = useChat()

  const lastMessage = messages.filter((m) => m.role === 'assistant').at(-1)
  const quickReplies = lastMessage?.quick_replies ?? []

  return (
    <main className="flex flex-col h-screen max-w-lg mx-auto bg-[#F5F0E8]">
      <header className="flex items-center justify-center p-4 bg-[#2D5016]">
        <span className="text-white text-xl font-bold font-[Atkinson_Hyperlegible]">
          NeuroGuia — OLLIE
        </span>
      </header>

      <div className="flex justify-center p-4">
        <OllieAvatar avatarState={avatarState} movement={movement} />
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3"
        aria-live="polite"
        aria-label="Conversa com OLLIE"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="text-[#2D5016] text-sm font-[Atkinson_Hyperlegible] self-start px-2">
            OLLIE está pensando...
          </div>
        )}
      </div>

      <div className="px-4 pb-2">
        <QuickReply options={quickReplies} onSelect={sendMessage} />
      </div>

      <ChatInput onSubmit={sendMessage} disabled={isLoading} />
    </main>
  )
}
```

- [ ] **Step 4: Atualizar page.tsx**

```typescript
// frontend/src/app/page.tsx
import ChatInterface from '@/components/ChatInterface/ChatInterface'

export default function Home() {
  return <ChatInterface />
}
```

- [ ] **Step 5: Atualizar globals.css**

```css
/* frontend/src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Atkinson Hyperlegible', sans-serif;
  background-color: #F5F0E8;
  color: #1a1a1a;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .ollie-avatar canvas {
    animation: none !important;
  }
}
```

- [ ] **Step 6: Rodar todos os testes frontend**

```bash
npx jest
```
Esperado: todos PASS

- [ ] **Step 7: Verificar app no browser**

```bash
npm run dev
```
Abrir `http://localhost:3000` — deve aparecer OLLIE (placeholder), campo de input e header.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/ChatInterface/ frontend/src/app/page.tsx frontend/src/app/globals.css
git commit -m "feat: ChatInterface completo, page.tsx, estilos globais acessíveis"
```

---

## Task 10: Indexar Documentos e Smoke Test End-to-End

**Files:**
- Create: `backend/scripts/indexar_docs.py`

- [ ] **Step 1: Adicionar os PDFs dos documentos**

```bash
# Copiar para backend/data/docs/:
# - LBI_13146_2015.pdf
# - Decreto_12686_2025.pdf
# - Portaria_MEC_3284_2003.pdf
# - Normas_UPE_PPGEC.pdf
ls backend/data/docs/
```
Esperado: 4 arquivos PDF listados

- [ ] **Step 2: Criar script de indexação**

```python
# backend/scripts/indexar_docs.py
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv()

from app.services.rag_service import RagService

service = RagService(
    persist_dir=os.getenv("CHROMA_PERSIST_DIR", "./data/chroma"),
    docs_dir=os.getenv("DOCS_DIR", "./data/docs"),
)
total = service.indexar_documentos()
print(f"Indexados {total} chunks com sucesso.")
```

- [ ] **Step 3: Rodar indexação**

```bash
cd backend
python scripts/indexar_docs.py
```
Esperado: `Indexados N chunks com sucesso.` (N > 0)

- [ ] **Step 4: Smoke test end-to-end**

```bash
# Terminal 1: iniciar backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: iniciar frontend
cd frontend && npm run dev

# Terminal 3: testar endpoint diretamente
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, quais são meus direitos?", "history": []}' \
  --no-buffer
```
Esperado: resposta SSE com `data: {"message": "...", "avatar_state": "...", "movement": "...", "quick_replies": [...]}`

- [ ] **Step 5: Verificar no browser**

Abrir `http://localhost:3000`, digitar "Olá" e pressionar Enter. Verificar:
- OLLIE muda de estado (ou mostra fallback enquanto .riv não está pronto)
- Resposta aparece no chat
- Quick replies aparecem
- OLLIE mostra "pensando..." durante a espera

- [ ] **Step 6: Commit final**

```bash
git add backend/scripts/ backend/data/
git commit -m "feat: indexação de documentos e smoke test end-to-end completo"
```

---

## Próximos Passos (Fora do Escopo deste Plano)

1. **Criar assets da OLLIE no Figma** — exportar SVG por camada (corpo, olhos, bico, asas, chapéu separados)
2. **Importar no Rive editor** e criar rigging + State Machine com os 5 estados de expressão e 3 movimentos
3. **Substituir `frontend/public/ollie.riv`** pelo arquivo real exportado do Rive
4. **Validar acessibilidade** com o agente `voltagent-qa-sec:accessibility-tester` após o componente estar em produção
5. **Adicionar TTS** (Text-to-Speech) para comunicação por voz — recomendado: Web Speech API
