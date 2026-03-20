# MEMORY.md — biochem-frontend

## 2026-03-20 — Локализация profile.astro

### Изменённые файлы
- `src/i18n/translations.ts` — добавлена секция `profile` (ru + en): title, accountSection, name, email, newPassword, passwordHint, save, role, bookmarksSection, noBookmarks, removeBookmark, saveSuccess, loadError, saveError, roles (guest/member/editor/admin)
- `src/pages/profile.astro` — добавлен SSR frontmatter (`getLang`/`getT`), заголовок через `t.profile.title`, loading через `t.common.loading`; в клиентском скрипте все строки вынесены в объект `L` по `dataset.lang`

### Итог
- TypeScript: 0 ошибок

---

## 2026-03-18 — Локализация RU/EN, фикс share button, переключатель языка

### Новые файлы
- `src/i18n/translations.ts` — все строки интерфейса для RU и EN (nav, footer, toast, common, notFound, search, sections, article, auth, index)
- `src/i18n/index.ts` — `getLang(cookies): Lang`, `getT(lang): T`; `as unknown as T` для обхода TypeScript literal type mismatch

### Изменённые файлы
- `src/layouts/BaseLayout.astro` — читает lang из cookie, `data-lang` на `<html>`, переключатель языка перенесён в футер как единый тоггл (RU↔EN)
- `src/pages/index.astro` — все строки через `t.index.*`
- `src/pages/search.astro` — через `t.search.*`
- `src/pages/404.astro` — через `t.notFound.*`
- `src/pages/sections.astro` — через `t.sections.*`; `pluralMaterials()` lang-aware
- `src/pages/login.astro` — статические метки через `t.auth.*`; fallback в скрипте через `dataset.lang`
- `src/pages/register.astro` — аналогично login
- `src/pages/article/[id].astro` — все строки (сервер + клиент) через `t.*` и объект `labels`; дата форматируется по локали (`ru-RU`/`en-US`); share button — fallback через `execCommand("copy")` для HTTP

### Итог
- TypeScript: 0 ошибок

## 2026-03-17 — Новые фичи: теги, авторы, пагинация/сортировка главной, закладки, фильтр статусов

### Изменённые файлы
- `src/services/api.ts` — в тип `Article` добавлено `comments_count: number`; в `api.articles.list` params добавлены `tag_id`, `author_id`, `sort`; добавлен namespace `api.tags` с методом `get(id)`; добавлен namespace `api.authors` с методом `show(id)` (размещён между `reports` и остальными)
- `src/components/ArticleCard.astro` — теги стали ссылками `/tag/:id`; в строку метаданных добавлен `comments_count` с иконкой chat bubble; добавлена кнопка «Читать далее →`
- `src/pages/index.astro` — `per_page` 6→9; читаются `page` и `sort` из URL; передаются в `api.articles.list`; добавлены кнопки сортировки (Новые/По просмотрам/Старые); добавлена пагинация с сохранением `sort`
- `src/pages/article/[id].astro` — добавлен `<div id="bookmark-area">` и client-side скрипт кнопки закладки (добавить/удалить, проверка текущего состояния)
- `src/pages/admin/index.astro` — добавлен фильтр статусов (Все/Опубликованные/Черновики) на клиенте; `renderArticles` принимает параметр `filter`

### Созданные файлы
- `src/pages/tag/[id].astro` — страница тега: название, список статей, пагинация
- `src/pages/author/[id].astro` — страница автора: аватар с первой буквой, роль, список статей, пагинация

### Итог проверки
- `npm run typecheck` — чистый
- `npm test` — 20 тестов, 0 failures

---

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
