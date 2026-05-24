---
name: chat-centering-and-message-avatars
description: Centralizar o chat horizontalmente (max-w 768px) e adicionar avatares redondos 40px nas message bubbles — Ollie à esquerda das respostas do bot, silhueta genérica à direita das perguntas do usuário
metadata:
  type: project
---

# Chat Centering & Message Avatars

## Goal

Improve the chat layout by (1) constraining the message column to 768px centered on the page and (2) adding small round avatars beside each message bubble to visually identify the speaker.

## Scope

- `src/app/chat/page.tsx` — add centering wrapper
- `src/components/ChatBubble/ChatBubble.tsx` — add avatar rendering
- No new files, no new components, no changes to OllieAvatar or types

## Layout Centering

The stage zone (avatar + emotion controls, full-width background color) stays full-width.

Inside `<main>` and the QuickReply+ChatInput footer `<div>`, add an inner wrapper:

```tsx
<div className="max-w-3xl mx-auto w-full">
  {/* message list or input */}
</div>
```

`max-w-3xl` = 768px in Tailwind. The outer containers keep their existing flex/overflow classes.

## ChatBubble Avatars

### New prop

```ts
interface Props {
  message: ChatMessage
  onFeedback: (messageId: string, rating: 'up' | 'down') => void
  currentOllieState?: AvatarState  // fallback when message.avatar_state is undefined
}
```

Per-message `avatar_state` is already stored on `ChatMessage`. `currentOllieState` is the fallback for messages that predate this field.

### Layout change per message

Current row structure:
```
<div flex justify-end/start>
  <article bubble />
</div>
```

New structure:
```
// Bot message
<div flex items-end gap-2 justify-start>
  <OllieAvatarThumb state={message.avatar_state ?? currentOllieState ?? 'neutral'} />
  <article bubble />
</div>

// User message
<div flex items-end gap-2 justify-end>
  <article bubble />
  <UserAvatarThumb />
</div>
```

### OllieAvatarThumb

An inline helper inside `ChatBubble.tsx` (not exported):

```tsx
function OllieAvatarThumb({ state }: { state: AvatarState }) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-owl-orange/30">
      <OllieAvatar avatarState={state} movement="idle" />
    </div>
  )
}
```

`OllieAvatar` renders at `w-48 h-48` internally but is inside a 40×40 clipping container — the SVG scales down via the `viewBox`. No changes to OllieAvatar.

### UserAvatarThumb

Inline SVG silhouette, no external asset:

```tsx
function UserAvatarThumb() {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-violet/20 border-2 border-violet/30 flex items-center justify-center">
      <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
        <circle cx="20" cy="14" r="7" fill="#7C5CBF" opacity="0.7" />
        <ellipse cx="20" cy="34" rx="12" ry="9" fill="#7C5CBF" opacity="0.7" />
      </svg>
    </div>
  )
}
```

### Caller change

In `chat/page.tsx`, pass `currentOllieState={avatarState}` to each `ChatBubble`:

```tsx
<ChatBubble
  key={msg.id}
  message={msg}
  onFeedback={handleFeedback}
  currentOllieState={avatarState}
/>
```

### Loading indicator

The 3-dot loading indicator is also inside `<main>`. It represents the bot "thinking" — position it with the same left-avatar offset to keep visual consistency:

```tsx
<div className="flex items-end gap-2">
  <div className="w-10 h-10 shrink-0" /> {/* spacer matching avatar width */}
  <div aria-label="Carregando resposta" className="flex gap-1 p-3">
    ...dots...
  </div>
</div>
```

## Constraints

- `prefers-reduced-motion` remains unaffected (movement="idle" passes no animation to OllieAvatar)
- Bubble `max-w-[80%]` stays — avatars are outside the bubble, so effective reading width is `80% of max-w-3xl`
- Accessibility: `aria-label` on the outer row div not needed — `OllieAvatar` already has `role="img"` with label; `UserAvatarThumb` is `aria-hidden`

## Testing

- Existing ChatBubble snapshot/unit tests: update snapshots for the new prop
- No new test files required
