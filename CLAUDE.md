# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
npm test         # Jest
```

## Architecture

NeuroGuia is a Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 frontend for an educational chatbot aimed at neurodivergent students. The only page is `src/app/page.tsx`, which renders `<ChatInterface>`.

### Data flow

`useChat` (`src/hooks/useChat.ts`) drives all state. It POSTs to `http://localhost:8000/chat` and reads the response as a Server-Sent Events stream (each `data:` line is a JSON `ChatResponse`). Avatar state and movement are updated live as chunks arrive.

Types live in `src/types/chat.ts`:
- `AvatarState`: `neutral | happy | encouraging | empathetic | thoughtful`
- `Movement`: `idle | talking | thinking`

### OLLIE avatar

`OllieAvatar` is a fully inline SVG owl with no external asset dependency. Expression geometry (brow paths, beak path, pupil positions, eye shape, head tilt) is driven by the `EXPRESSIONS` map keyed on `AvatarState`. Animations are pure CSS classes (`ollie-idle`, `ollie-talking`, `ollie-thinking`) defined in `src/app/globals.css` and applied to the wrapper `<div>`. The `.ollie-beak-bottom` element gets an additional `ollie-talk` keyframe when `movement === 'talking'`.

### Layout and styling

The page is split vertically: top half contains the avatar + `EmotionControls` + `QuickReply` + `ChatInput`; bottom half is a scrollable message list (`ChatBubble`s). Primary colors: `#2D5016` (forest green) and `#C8860A` (amber). Font: Atkinson Hyperlegible (loaded via `next/font/google`) — chosen for accessibility/readability for neurodivergent users. `prefers-reduced-motion` is respected in `globals.css`.

### Backend contract

The frontend expects `POST http://localhost:8000/chat` with `{ message: string, history: { role, content }[] }` and a streaming SSE response where each event carries a `ChatResponse` (`message`, `avatar_state`, `movement`, `quick_replies?`).
