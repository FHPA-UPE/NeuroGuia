# NeuroGuia — Design: UX/UI com Avatar (Tópico 4)

**Data:** 2026-04-20  
**Projeto:** NeuroGuia — Chatbot para universitários neurodivergentes da PPGEC/UPE  
**Responsável:** Felipe  
**Status:** Aprovado

---

## 1. Contexto

O NeuroGuia é um chatbot conversacional com avatar mascote (OLLIE) para estudantes neurodivergentes do PPGEC/UPE. O Tópico 4 cobre a camada de UX/UI: identidade visual, movimentação do avatar e comunicação (voz, texto, personalidade).

O avatar precisa transmitir acolhimento, paciência e clareza — valores essenciais para o público com TEA, TDAH e Dislexia.

---

## 2. Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js + React |
| Avatar | Rive (`@rive-app/react`) |
| Backend | Python + FastAPI |
| LLM | Claude API (claude-sonnet-4-6) |
| RAG | LangChain + ChromaDB |
| Comunicação frontend↔backend | SSE (Server-Sent Events) para streaming |

---

## 3. Avatar OLLIE

### 3.1 Identidade Visual

- **Espécie:** Coruja (sabedoria + acolhimento)
- **Estilo:** Cartoon arredondado, olhos grandes expressivos
- **Paleta:** Corpo âmbar/tawny, barriga branca, fundo verde floresta
- **Chapéu:** Âmbar com borda branca (correção de contraste)

### 3.2 Estados de Movimento (loop contínuo no Rive)

| Estado | Descrição |
|--------|-----------|
| `idle` | Corpo balançando suavemente, olhos piscando |
| `talking` | Bico abrindo/fechando, asas leves |
| `thinking` | Cabeça inclinando, olhos girando devagar |

### 3.3 Estados de Expressão (sobrepostos ao movimento)

| Estado | Gatilho |
|--------|---------|
| `neutral` | Navegação padrão, respostas informativas |
| `happy` | Saudação, celebração de conquista |
| `encouraging` | Explicando direitos, orientando passos |
| `empathetic` | Usuário relata dificuldade ou sobrecarga |
| `thoughtful` | Buscando no RAG, processando resposta |

### 3.4 Implementação no Rive

```javascript
const { rive } = useRive({ src: 'ollie.riv', autoplay: true });

// Sincronizar com resposta da API
rive.setInputState('expression', apiResponse.avatar_state);
rive.setInputState('movement', apiResponse.movement);
```

### 3.5 Correções de Acessibilidade

| Problema | Solução |
|----------|---------|
| Chapéu verde sobre fundo verde (contraste 1.2:1) | Chapéu âmbar com borda branca |
| Talões/pés invisíveis em tamanho pequeno | Remover ou simplificar |
| Expressões sutis (difícil leitura para TEA) | Sobrancelhas exageradas + posição de pupilas como diferenciadores |
| Animação contínua pode sobrecarregar | Suporte a `prefers-reduced-motion` |
| Detalhes somem em mobile (80–100px) | Design centrado em olhos e bico |

```css
@media (prefers-reduced-motion: reduce) {
  .ollie-avatar { animation: none; }
}
```

---

## 4. Backend — State Manager

### 4.1 Resposta Estruturada da API

```python
class ChatResponse(BaseModel):
    message: str
    avatar_state: Literal["neutral", "happy", "encouraging", "empathetic", "thoughtful"]
    movement: Literal["idle", "talking", "thinking"]
```

### 4.2 Lógica de Estado

| Situação | avatar_state | movement |
|----------|-------------|----------|
| Saudação / boas-vindas | `happy` | `talking` |
| Explicando direitos/normas | `encouraging` | `talking` |
| Usuário relata dificuldade | `empathetic` | `talking` |
| Buscando no RAG | `thoughtful` | `thinking` |
| Resposta padrão | `neutral` | `talking` |
| Aguardando input | `neutral` | `idle` |

### 4.3 Pipeline RAG

```
Documentos (LBI, Decreto 12.686, MEC 3.284, Normas UPE)
    → Chunking
    → ChromaDB (embeddings)
    → Query do usuário
    → Contexto relevante + Claude API
    → ChatResponse estruturada
    → SSE para frontend
```

---

## 5. Frontend — Chat UI

### 5.1 Layout

```
┌─────────────────────────────────┐
│  [OLLIE animada — lado direito] │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Mensagem da OLLIE       │   │
│  │ (texto simples, grande) │   │
│  └─────────────────────────┘   │
│                                 │
│  [Opções rápidas como botões]  │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Sim  │ │ Não  │ │ Ajuda│   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│  [Campo de texto livre]        │
└─────────────────────────────────┘
```

### 5.2 Componentes React

| Componente | Responsabilidade |
|------------|-----------------|
| `<OllieAvatar />` | Rive player com estado reativo |
| `<ChatBubble />` | Balão de mensagem com fonte acessível |
| `<QuickReply />` | Botões de resposta rápida |
| `<ChatInput />` | Campo de texto com envio por Enter |

### 5.3 Decisões de Acessibilidade

| Perfil | Decisão |
|--------|---------|
| TDAH | Respostas curtas, uma ação por vez |
| TEA | Linguagem literal, sem ambiguidade, expressões legíveis |
| Dislexia | Fonte Atkinson Hyperlegible, espaçamento amplo |
| Geral | Alto contraste, paleta verde/âmbar do briefing |
| Multimodal | Botões de resposta rápida + texto livre |

---

## 6. Fluxo Completo

```
Usuário digita / clica QuickReply
    → Frontend envia mensagem via SSE
    → Backend: RAG busca contexto relevante
    → Claude gera ChatResponse estruturada
    → Frontend recebe: message + avatar_state + movement
    → <OllieAvatar /> atualiza estado no Rive
    → <ChatBubble /> exibe mensagem
    → <QuickReply /> exibe próximas opções
```

---

## 7. Pendências para Implementação

- [ ] Criar assets da OLLIE no Figma (corpo separado por camadas)
- [ ] Importar partes no Rive e fazer rigging
- [ ] Criar State Machine no Rive com as transições
- [ ] Implementar `<OllieAvatar />` com `@rive-app/react`
- [ ] Implementar State Manager no FastAPI
- [ ] Integrar SSE entre frontend e backend
- [ ] Testar com `prefers-reduced-motion`
- [ ] Validar acessibilidade do componente final (ARIA, contraste)
