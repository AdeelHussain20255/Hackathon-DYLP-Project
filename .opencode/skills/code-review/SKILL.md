---
name: code-review
description: Review code in the Agentix AI project for consistency with project patterns, TypeScript best practices, and the tech stack conventions.
license: MIT
compatibility: opencode
metadata:
  purpose: quality
---

## What to Check

1. **TypeScript types**: No `any` types. All props have interfaces. Use proper React 19 patterns.
2. **Imports**: `motion` from `"motion/react"` (not `"framer-motion"`). Icons from `"lucide-react"`. Gemini from `"@google/genai"`.
3. **State location**: All state belongs in `src/App.tsx`. Components receive props. No external state stores.
4. **Styling**: Tailwind utility classes only. Dark theme colors (`bg-slate-900`, `text-slate-100`, etc.). No CSS modules or styled-components.
5. **Animations**: Use `<motion.div>` with `initial`/`animate`/`transition`. Use `<AnimatePresence>` for enter/exit animations.
6. **No comments**: Code should be self-documenting. No JSDoc or inline comments.
7. **No React Router**: Use tab-based navigation via `currentTab` state.
8. **Pluralization**: Use the `plural()` helper function for count labels.
9. **Path alias**: Use `@/` for root-relative imports.
10. **Build**: Must pass `npm run lint` (tsc --noEmit) without errors.

## When to Use

Activate when asked to review code changes, debug TypeScript errors, validate pull requests, or ensure consistency with project conventions.
