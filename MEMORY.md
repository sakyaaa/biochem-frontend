# MEMORY.md — biochem-frontend

## 2026-03-17 — MVP финализация

### Исправления
- `src/pages/login.astro` — убрана проверка `authHeader` (JwtCookieMiddleware удаляет заголовок, JWT в httpOnly cookie); ключ `user` → `api_user`
- `src/services/api.ts` — `signIn`/`signUp` используют `api_user` (Devise scope); `signUp` добавлен `password_confirmation`; убран `process.env` (только `import.meta.env`); добавлены типы `UserProfile`, `Bookmark`, методы `api.profile.*`, `api.bookmarks.*`
- `src/services/api.test.ts` — тесты обновлены под `api_user`; итог: 20 tests, 0 failures
- `tsconfig.json` — добавлены `lib`, `skipLibCheck`; typecheck чистый

### Новые страницы
- `src/pages/register.astro` — регистрация с `api_user` + `password_confirmation`, вывод `errors[]`
- `src/pages/profile.astro` — профиль + редактирование + закладки
- `src/pages/admin/index.astro` — реальная панель: проверка роли, список статей с удалением
- `src/pages/admin/articles/new.astro` — создание статьи (раздел, теги, статус)
- `src/pages/admin/articles/[id]/edit.astro` — редактирование с предзаполнением

### Обновлено
- `src/layouts/BaseLayout.astro` — динамический header: проверяет `/api/profile`, показывает имя/выйти или «Войти»
- `src/pages/article/[id].astro` — клиентская форма комментария (только для авторизованных)

---

## 2026-03-16 — Тестовое покрытие (Vitest)

- `package.json` — добавлены `vitest ^3.x`, `@vitest/coverage-v8 ^3.x`; скрипты `test`, `test:watch`, `test:coverage`
- `vitest.config.ts` — создан; `environment: node`, `globals: true`, `env.PUBLIC_API_URL` задан для детерминированных тестов
- `src/services/api.test.ts` — 20 unit-тестов для `api.ts`: все методы articles/sections/comments/auth/reports, проверка `credentials: include` и `Content-Type`
- Итог: 20 Vitest тестов, 0 failures

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
