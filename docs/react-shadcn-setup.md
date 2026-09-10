# React + shadcn setup for Dotyk Slov

The production repository is currently a Shoptet asset repository. It builds LESS/CSS and plain JavaScript and does **not** currently bundle React, TypeScript, Tailwind CSS or shadcn/ui.

## Current paths

- Runtime CSS: `/css`
- Runtime JS: `/js`
- LESS sources: `/src`
- Reusable React component source prepared for future bundling: `/components/ui`

`/components/ui` is important because it is the conventional shadcn component location and lets imports stay stable as `@/components/ui/...`. Keeping third-party and reusable UI primitives there avoids mixing them with Shoptet-specific runtime scripts.

## Recommended isolated React setup

Do not replace the current Shoptet build. Add React as a separate bundle that compiles to files under `/js` and `/css`.

```bash
npm install react react-dom
npm install -D typescript @types/react @types/react-dom @types/node vite @vitejs/plugin-react tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
```

During shadcn setup use:

- TypeScript: yes
- components alias: `@/components`
- utils alias: `@/lib/utils`
- components path: `/components`
- UI primitives: `/components/ui`
- global styles: `/styles/globals.css`

Then add a Vite library entry for each Shoptet React island and build it as an IIFE/UMD asset. The output can then be loaded by Shoptet with a normal `<script defer src="...">` and CSS `<link>`.

For the current homepage implementation we intentionally use the native Shoptet version in `/js/new-arrivals-gallery.js` and `/css/new-arrivals-gallery.css`, so production works without introducing React into the existing build pipeline.
