---
name: react-component
description: Create React 19 TypeScript components following Agentix AI project conventions. Use when building new UI components, refactoring existing ones, or adding features to the dashboard.
license: MIT
compatibility: opencode
metadata:
  framework: react-19
  language: typescript
---

## Project Conventions

This project uses React 19 with TypeScript, Vite 6, and Tailwind CSS 4. Components are in `src/components/`. All state lives in `src/App.tsx` via hooks (no external state library). Navigation uses tab-based state (`currentTab`), not React Router.

## Component Pattern

```typescript
import { motion } from "motion/react";
import { IconName } from "lucide-react";

interface ComponentProps {
  // props here
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* content */}
    </motion.div>
  );
}
```

## Key Rules

1. **Imports**: Use `import React, { useState, useMemo, useEffect } from "react"`. Import `motion` from `"motion/react"`. Import icons from `"lucide-react"`.
2. **Styling**: Tailwind CSS utility classes only. Dark theme uses `bg-slate-900`/`bg-slate-800`, light uses `bg-white`. Use `text-slate-100`/`text-slate-400` for text.
3. **Animations**: Wrap new views in `<motion.div>` with `initial`/`animate`/`transition` for entrance animations. Use `<AnimatePresence>` from `"motion/react"` for mount/unmount animations.
4. **State**: Keep state in `App.tsx` and pass via props. Do NOT create new state stores.
5. **No comments**: Do not add comments to the code.
6. **Path alias**: Use `@/` to reference root (e.g., `@/src/data/dashboardConfig`).
7. **Pluralization**: Use the `plural()` helper from `App.tsx` for count-based labels.

## When to Use

Activate this skill when asked to create a new React component, modify an existing component, add a new tab/view, or refactor UI code in this project.
