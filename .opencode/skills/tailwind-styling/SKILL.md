---
name: tailwind-styling
description: Apply consistent Tailwind CSS 4 styling patterns used in the Agentix AI project. Use when writing or modifying UI styles, adjusting layouts, or theming components.
license: MIT
compatibility: opencode
metadata:
  framework: tailwind-css-4
---

## Project Theme

This project uses Tailwind CSS 4 with `@tailwindcss/vite` plugin. The primary font is `Inter` (body) and `JetBrains Mono` (monospace). See `src/index.css` for font imports.

## Color Palette

- **Backgrounds**: `bg-slate-950` (page), `bg-slate-900` (cards/sections), `bg-slate-800` (elevated cards), `bg-slate-700` (hover states)
- **Text**: `text-white` (headings), `text-slate-100` (primary), `text-slate-400` (secondary/muted), `text-slate-500` (tertiary)
- **Accent/Primary**: `text-indigo-400` / `bg-indigo-500` / `border-indigo-500/30` / `hover:bg-indigo-600`
- **Success**: `text-emerald-400` / `bg-emerald-500/10` / `border-emerald-500/20`
- **Warning**: `text-amber-400` / `bg-amber-500/10`
- **Error/Danger**: `text-rose-400` / `bg-rose-500/10`
- **Borders**: `border-slate-700/50` (default), `border-slate-600` (stronger)
- **Dividers**: `divide-slate-700/50`

## Common Patterns

### Card
```html
<div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
```

### Stats/Value Display
```html
<span className="text-2xl font-bold text-white">{value}</span>
```

### Badge
```html
<span className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
```

### Button (Primary)
```html
<button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
```

### Button (Ghost)
```html
<button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
```

### Input
```html
<input className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50" />
```

### Table Header
```html
<th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-3">
```

### Table Cell
```html
<td className="py-3 text-sm text-slate-100">
```

### Monospace text
```html
<span className="font-mono text-xs">
```

## Layout

- Use `max-w-7xl mx-auto` for centered content containers
- Use `space-y-*` for vertical spacing between children
- Use `gap-*` on flex/grid containers
- Animate with `motion` components (not CSS transitions alone)
