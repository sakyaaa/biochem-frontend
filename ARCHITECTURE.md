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
    index.astro              # Главная: список статей + разделы
    article/[id].astro       # Страница статьи (SSR)
    section/[slug].astro     # Страница раздела (SSR)
    search.astro             # Поиск (SSR)
    login.astro              # Форма входа
    admin/index.astro        # Панель управления (заглушка)
  layouts/
    BaseLayout.astro         # HTML-обёртка: header, footer, meta
  components/
    ArticleCard.astro        # Карточка статьи в листинге
  services/
    api.ts                   # Все запросы к Rails API
  styles/
    global.css               # Tailwind base + utilities
```

## Маршруты
```
/                            → index.astro (главная, список статей)
/article/:id                 → article/[id].astro (полная статья)
/section/:slug               → section/[slug].astro (раздел)
/search?q=...                → search.astro (полнотекстовый поиск)
/login                       → login.astro
/admin                       → admin/index.astro
```

## Связь с backend
- Все HTTP-запросы к Rails API в `src/services/api.ts`
- Base URL: `PUBLIC_API_URL` env var (default: `http://localhost/api`)
- Аутентификация: JWT в заголовке `Authorization: Bearer <token>`
- Токен сохраняется в `localStorage` после sign_in

## Запуск
```bash
# Локально
npm install
PUBLIC_API_URL=http://localhost:3000/api npm run dev

# Через Docker
docker-compose -f docker-compose.yml -f docker-compose.override.development.yml up frontend
```
