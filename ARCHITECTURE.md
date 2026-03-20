# ARCHITECTURE.md — biochem-frontend

## Стек
| Компонент | Версия | Назначение |
|---|---|---|
| Astro | 5.x | Web-фреймворк (SSR) |
| @astrojs/node | 9.x | Node.js адаптер для SSR |
| Tailwind CSS | 3.x | Стилизация |
| @tailwindcss/typography | 0.5.x | Prose-стили для научного контента |
| TypeScript | 5.7 | Типизация |
| KaTeX | 0.16 | Рендер математических формул |

## Структура директорий
```
src/
  pages/                     # Файловый роутинг Astro
    index.astro              # Главная: список статей + разделы + сортировка + пагинация
    article/[id].astro       # Страница статьи (SSR) + форма комментария + кнопка закладки
    section/[slug].astro     # Страница раздела (SSR)
    tag/[id].astro           # Страница тега (SSR)
    author/[id].astro        # Страница автора (SSR)
    search.astro             # Поиск (SSR)
    login.astro              # Форма входа
    register.astro           # Регистрация
    profile.astro            # Профиль + закладки
    admin/
      index.astro            # Панель управления: список статей, фильтр статусов, удаление
      articles/
        new.astro            # Создание статьи
        [id]/edit.astro      # Редактирование статьи
  layouts/
    BaseLayout.astro         # HTML-обёртка: header, footer, meta
  components/
    ArticleCard.astro        # Карточка статьи: теги-ссылки, comments_count, кнопка «Читать далее»
  services/
    api.ts                   # Все запросы к Rails API
  styles/
    global.css               # Tailwind base + utilities
```

## Маршруты
```
/                              → index.astro (главная, список статей + сортировка + пагинация)
/article/:id                   → article/[id].astro (полная статья + форма комментария + закладка)
/section/:slug                 → section/[slug].astro (раздел)
/tag/:id                       → tag/[id].astro (страница тега)
/author/:id                    → author/[id].astro (страница автора)
/search?q=...                  → search.astro (полнотекстовый поиск)
/login                         → login.astro
/register                      → register.astro
/profile                       → profile.astro (профиль + закладки)
/admin                         → admin/index.astro (список статей редактора + фильтр статусов)
/admin/articles/new            → admin/articles/new.astro
/admin/articles/:id/edit       → admin/articles/[id]/edit.astro
```

## Локализация (i18n)
- `src/i18n/translations.ts` — все строки UI для `ru` и `en`: nav, footer, toast, common, notFound, search, sections, article, auth, index, profile
- `src/i18n/index.ts` — `getLang(cookies): Lang` (читает cookie `lang`), `getT(lang): T`
- SSR-страницы: `const lang = getLang(Astro.cookies); const t = getT(lang)` в frontmatter
- Клиентские скрипты: читают `document.documentElement.dataset.lang` (установлен в `BaseLayout.astro`)
- Переключатель: кнопка в футере, пишет cookie `lang`, перезагружает страницу

## Связь с backend
- Все HTTP-запросы к Rails API в `src/services/api.ts`
- Base URL: `PUBLIC_API_URL` env var (default: `http://localhost/api`)
- Аутентификация: JWT в httpOnly cookie (устанавливается бэкендом через `Set-Cookie`)
- Браузер отправляет cookie автоматически при `credentials: "include"`
- Auth-параметры: `api_user: { email, password }` / `api_user: { name, email, password, password_confirmation }` (Devise scope)

## Запуск
```bash
# Локально
npm install
PUBLIC_API_URL=http://localhost:3000/api npm run dev

# Через Docker
docker-compose -f docker-compose.yml -f docker-compose.override.development.yml up frontend
```
