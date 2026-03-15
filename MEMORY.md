# MEMORY.md — biochem-frontend

## 2026-03-15-16 — Фиксы безопасности и UI

- `src/services/api.ts` — убраны `getToken`/`setToken`/`clearToken` (localStorage); добавлен `credentials: "include"` для работы с httpOnly cookie
- `src/layouts/BaseLayout.astro` — добавлены `<link rel="icon">` для favicon.ico и favicon.svg
- `public/favicon.ico`, `public/favicon.svg` — созданы иконки сайта

## 2026-03-15 — Инициализация проекта

Создана начальная структура Astro 5 SSR проекта.

### Созданные файлы
- package.json (Astro 5, Tailwind, KaTeX, @astrojs/node)
- astro.config.mjs (SSR mode, node adapter, Tailwind integration)
- tailwind.config.mjs
- tsconfig.json
- Dockerfile (Node 22 Alpine)
- src/services/api.ts — типизированный API-клиент для Rails backend
- src/layouts/BaseLayout.astro — базовый layout с навигацией
- src/pages/ — index, article/[id], section/[slug], search, login, admin/index
- src/components/ArticleCard.astro
- src/styles/global.css
- CLAUDE.md, ARCHITECTURE.md
