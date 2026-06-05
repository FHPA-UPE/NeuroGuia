# Chat Centering & Message Avatars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize the chat column to 768px max-width and add 40px round avatars beside each message bubble (Ollie SVG on the left for bot, generic user silhouette on the right for user).

**Architecture:** Two self-contained changes — (1) add `OllieAvatarThumb` and `UserAvatarThumb` helper functions inside `ChatBubble.tsx` and update the bubble row layout; (2) wrap the message list and input footer in `max-w-3xl mx-auto` in `chat/page.tsx`. No new files, no changes to `OllieAvatar` or types.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Jest + React Testing Library

---

## File Map

| File | Change |
|------|--------|
| `src/components/ChatBubble/ChatBubble.tsx` | Add `OllieAvatarThumb`, `UserAvatarThumb` helpers; update `Props`; update row layout |
| `src/components/ChatBubble/__tests__/ChatBubble.test.tsx` | Add 6 new tests for avatar rendering |
| `src/app/chat/page.tsx` | Add centering wrappers; pass `currentOllieState`; align loading indicator |

---

## Task 1: Update ChatBubble with avatar helpers (TDD)

**Files:**
- Modify: `src/components/ChatBubble/ChatBubble.tsx`
- Modify: `src/components/ChatBubble/__tests__/ChatBubble.test.tsx`

- [ ] **Step 1: Add failing tests to `ChatBubble.test.tsx`**

Append these 6 tests to the end of `src/components/ChatBubble/__tests__/ChatBubble.test.tsx` (keep the existing 6 tests untouched):

```tsx
test('bot message renders OllieAvatarThumb using message.avatar_state', () => {
  render(<ChatBubble message={{ ...baseMsg, avatar_state: 'happy' }} onFeedback={() => {}} />)
  expect(screen.getByRole('img', { name: /OLLIE está happy/i })).toBeInTheDocument()
})

test('bot message uses currentOllieState as fallback when message.avatar_state is undefined', () => {
  const msg = { ...baseMsg, avatar_state: undefined }
  render(<ChatBubble message={msg} onFeedback={() => {}} currentOllieState="encouraging" />)
  expect(screen.getByRole('img', { name: /OLLIE está encouraging/i })).toBeInTheDocument()
})

test('bot message falls back to neutral when both avatar states are undefined', () => {
  const msg = { ...baseMsg, avatar_state: undefined }
  render(<ChatBubble message={msg} onFeedback={() => {}} />)
  expect(screen.getByRole('img', { name: /OLLIE está neutral/i })).toBeInTheDocument()
})

test('user message renders UserAvatarThumb', () => {
  render(<ChatBubble message={{ ...baseMsg, role: 'user' }} onFeedback={() => {}} />)
  expect(screen.getByTestId('user-avatar-thumb')).toBeInTheDocument()
})

test('user message does not render OllieAvatarThumb', () => {
  render(<ChatBubble message={{ ...baseMsg, role: 'user' }} onFeedback={() => {}} />)
  expect(screen.queryByRole('img', { name: /OLLIE está/i })).toBeNull()
})

test('bot message does not render UserAvatarThumb', () => {
  render(<ChatBubble message={baseMsg} onFeedback={() => {}} />)
  expect(screen.queryByTestId('user-avatar-thumb')).toBeNull()
})
```

- [ ] **Step 2: Run tests to verify they FAIL**

```bash
npx jest src/components/ChatBubble/__tests__/ChatBubble.test.tsx --no-coverage
```

Expected: the 6 new tests fail with messages like `Unable to find role="img"` and `Unable to find an element by: [data-testid="user-avatar-thumb"]`. The original 6 tests pass.

- [ ] **Step 3: Replace `src/components/ChatBubble/ChatBubble.tsx` with the full implementation**

```tsx
'use client'
import { useState } from 'react'
import type { ChatMessage, AvatarState } from '@/types/chat'
import OllieAvatar from '@/components/OllieAvatar/OllieAvatar'

interface Props {
  message: ChatMessage
  onFeedback: (messageId: string, rating: 'up' | 'down') => void
  currentOllieState?: AvatarState
}

function OllieAvatarThumb({ state }: { state: AvatarState }) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-owl-orange/30 relative">
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.208)',
        transformOrigin: 'center center',
      }}>
        <OllieAvatar avatarState={state} movement="idle" />
      </div>
    </div>
  )
}

function UserAvatarThumb() {
  return (
    <div
      data-testid="user-avatar-thumb"
      className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-violet/20 border-2 border-violet/30 flex items-center justify-center"
    >
      <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
        <circle cx="20" cy="14" r="7" fill="#7C5CBF" opacity="0.7" />
        <ellipse cx="20" cy="34" rx="12" ry="9" fill="#7C5CBF" opacity="0.7" />
      </svg>
    </div>
  )
}

export function ChatBubble({ message, onFeedback, currentOllieState }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const isAssistant = message.role === 'assistant'
  const hasSources = isAssistant && message.sources && message.sources.length > 0
  const sourceCount = message.sources?.length ?? 0

  return (
    <div className={`flex items-end gap-2 ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
      {isAssistant && (
        <OllieAvatarThumb state={message.avatar_state ?? currentOllieState ?? 'neutral'} />
      )}
      <article
        aria-label={`Mensagem de ${isAssistant ? 'OWL' : 'você'}`}
        className={`max-w-[80%] rounded-2xl px-5 py-4 text-base leading-relaxed group ${
          isAssistant
            ? 'bg-owl-orange-soft border-l-4 border-owl-orange rounded-tl-sm'
            : 'bg-violet-soft border-r-4 border-violet rounded-tr-sm'
        }`}
      >
        <p className="text-ink">{message.content}</p>

        {hasSources && (
          <div className="mt-2">
            <button
              onClick={() => setSourcesOpen(o => !o)}
              className="text-slate-text text-sm flex items-center gap-1 hover:text-owl-orange transition-colors"
              aria-expanded={sourcesOpen}
            >
              📄 {sourceCount} {sourceCount === 1 ? 'fonte' : 'fontes'} {sourcesOpen ? '▴' : '▾'}
            </button>
            {sourcesOpen && (
              <p className="text-sm text-slate-text mt-1">
                {message.sources!.join(' · ')}
              </p>
            )}
          </div>
        )}

        {isAssistant && (
          <div className="flex gap-2 mt-2">
            <button
              aria-label="Resposta útil"
              onClick={() => onFeedback(message.id, 'up')}
              className="text-lg hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center opacity-60 hover:opacity-100"
            >
              👍
            </button>
            <button
              aria-label="Resposta não útil"
              onClick={() => onFeedback(message.id, 'down')}
              className="text-lg hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center opacity-60 hover:opacity-100"
            >
              👎
            </button>
          </div>
        )}
      </article>
      {!isAssistant && <UserAvatarThumb />}
    </div>
  )
}
```

- [ ] **Step 4: Run all tests to verify all 12 pass**

```bash
npx jest src/components/ChatBubble/__tests__/ChatBubble.test.tsx --no-coverage
```

Expected: 12 tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatBubble/ChatBubble.tsx src/components/ChatBubble/__tests__/ChatBubble.test.tsx
git commit -m "feat(chat): add OllieAvatarThumb and UserAvatarThumb to message bubbles"
```

---

## Task 2: Centering wrapper and loading indicator alignment in `chat/page.tsx`

**Files:**
- Modify: `src/app/chat/page.tsx`

- [ ] **Step 1: Replace the `<main>` block (lines 126–143) with the centered version**

Find this block in `src/app/chat/page.tsx`:

```tsx
        {/* Mensagens */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-4"
          aria-live="polite"
          aria-label="Conversa com OLLIE"
        >
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
          ))}
          {isLoading && (
            <div aria-label="Carregando resposta" className="flex gap-1 p-3">
              <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>
```

Replace with:

```tsx
        {/* Mensagens */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-4"
          aria-live="polite"
          aria-label="Conversa com OLLIE"
        >
          <div className="max-w-3xl mx-auto w-full">
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} onFeedback={handleFeedback} currentOllieState={avatarState} />
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 mb-4">
                <div className="w-10 h-10 shrink-0" />
                <div aria-label="Carregando resposta" className="flex gap-1 p-3">
                  <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-owl-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
```

- [ ] **Step 2: Replace the Quick replies + Input block (lines 145–161) with the centered version**

Find this block:

```tsx
        {/* Quick replies + Input */}
        <div className="shrink-0">
          {quickReplies.length > 0 && (
            <QuickReply options={quickReplies} onSelect={handleSend} />
          )}
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            isListening={isListening}
            isSpeaking={audioEnabled || speechIsSpeaking || ttsIsSpeaking}
            speechSupported={mounted && supported}
            onToggleListen={handleToggleListen}
            onToggleSpeak={handleToggleSpeak}
            transcript={transcript}
          />
        </div>
```

Replace with:

```tsx
        {/* Quick replies + Input */}
        <div className="shrink-0">
          <div className="max-w-3xl mx-auto w-full">
            {quickReplies.length > 0 && (
              <QuickReply options={quickReplies} onSelect={handleSend} />
            )}
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              isListening={isListening}
              isSpeaking={audioEnabled || speechIsSpeaking || ttsIsSpeaking}
              speechSupported={mounted && supported}
              onToggleListen={handleToggleListen}
              onToggleSpeak={handleToggleSpeak}
              transcript={transcript}
            />
          </div>
        </div>
```

- [ ] **Step 3: Run the full test suite to confirm no regressions**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4: Start the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000/chat`. Confirm:
- Chat column is horizontally centered with empty margins on wide screens
- Each bot message has a small round Ollie avatar on the left showing the correct expression
- Each user message has a round silhouette avatar on the right
- Loading indicator (3 dots) is offset to align with the bot avatar column
- Stage zone (Ollie + background color) remains full-width

Fine-tune `top: '35%'` in `OllieAvatarThumb` if the owl's face is not well-framed in the 40px circle — increment/decrement by 5% until the head is centered.

- [ ] **Step 5: Commit**

```bash
git add src/app/chat/page.tsx
git commit -m "feat(chat): center message column to 768px and align loading indicator"
```
