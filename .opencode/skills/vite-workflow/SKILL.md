---
name: vite-workflow
description: Build, dev, preview, and deployment workflow for the Agentix AI Vite project. Use when running dev server, building for production, previewing builds, or deploying.
license: MIT
compatibility: opencode
metadata:
  build-tool: vite-6
---

## Project Scripts (from `package.json`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000, host 0.0.0.0 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove `dist/` and `server.js` |
| `npm run lint` | TypeScript type checking (`tsc --noEmit`) |

## Dev Server

```bash
npm run dev
```
Runs on `http://localhost:3000`. HMR can be disabled via `DISABLE_HMR=true` env var (used in AI Studio to prevent flickering during agent edits).

## Production Build

```bash
npm run build
```
Outputs to `dist/`. The build uses Vite 6 with the React plugin and Tailwind CSS 4 plugin.

## Type Checking

```bash
npm run lint
```
Runs `tsc --noEmit` — this checks types without emitting compiled files.

## Configuration Files

- `vite.config.ts` — Vite configuration (plugins, aliases, env injection, server settings)
- `tsconfig.json` — TypeScript configuration (ES2022 target, JSX react-jsx, `@/` alias)
- `index.html` — Entry HTML with `<div id="root">` and `<script type="module" src="/src/main.tsx">`

## Deployment

This project targets Google AI Studio deployment. The `metadata.json` declares `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`. The `APP_URL` env var is used for Cloud Run service URL auto-injection.

## When to Use

Activate when running dev server, building, debugging build issues, deploying, or modifying build configuration.
