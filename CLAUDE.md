# CLAUDE.md — biochem-frontend

## Контекст
Astro 5 SSR frontend для научно-информационного портала ООО «Биохим».
Работает в паре с `biochem-backend` (Rails API).

## Важные паттерны

- Все запросы к API идут через `src/services/api.ts` — единственная точка связи с backend
- SSR-режим (`output: "server"`) — все страницы рендерятся на сервере, данные фетчатся при запросе
- JWT-токен хранится в `localStorage` (клиент) и передаётся через `Authorization: Bearer <token>`
- Стили: Tailwind CSS + `@tailwindcss/typography` для prose-контента статей
- Формулы: KaTeX (подключается через CDN в BaseLayout)

## ENV переменные
- `PUBLIC_API_URL` — URL Rails API (default: `http://localhost/api`)
  - В dev: `http://localhost/api` (через Nginx)
  - В prod: `https://domain.ru/api`

## Команды
```bash
npm run dev      # локальный запуск
npm run build    # сборка для production
npm run typecheck # проверка типов TypeScript

# Через docker-compose
docker-compose -f docker-compose.yml -f docker-compose.override.development.yml up frontend
```
