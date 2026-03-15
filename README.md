# Биохим — Frontend

Веб-интерфейс научно-информационного портала по биомеханике и биохимии человеческого организма для ООО «Биохим».

## Стек

- **Astro 5** (SSR режим) — серверный рендеринг страниц
- **Tailwind CSS** + **@tailwindcss/typography** — стилизация
- **TypeScript** — типизация
- **KaTeX** — отображение математических и химических формул
- **Node.js 22** в Docker

## Быстрый старт

Фронтенд работает в паре с [biochem-backend](https://github.com/sakyaaa/biochem-backend). Запуск через docker-compose в репозитории backend:

```bash
# Из директории biochem-backend:
docker-compose -f docker-compose.yml -f docker-compose.override.development.yml up frontend
```

Или локально (требует запущенного backend):

```bash
npm install
PUBLIC_API_URL=http://localhost:3000/api npm run dev
```

Приложение будет доступно на `http://localhost:4321`.

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Главная: список статей, разделы, поиск |
| `/article/:id` | Полный текст научной статьи с формулами |
| `/section/:slug` | Статьи раздела (биомеханика, биохимия и др.) |
| `/search?q=...` | Полнотекстовый поиск по базе знаний |
| `/login` | Форма входа |
| `/admin` | Панель управления (для редакторов и администраторов) |

## Разделы каталога

- Биомеханика (`/section/biomechanics`)
- Биохимия (`/section/biochemistry`)
- Метаболизм (`/section/metabolism`)
- Физиология движений (`/section/physiology`)
- Спортивная медицина (`/section/sport-medicine`)

## Структура проекта

```
src/
├── pages/            # Файловый роутинг Astro (SSR)
├── layouts/          # BaseLayout.astro — общая HTML-обёртка
├── components/       # Переиспользуемые компоненты
└── services/
    └── api.ts        # Единая точка работы с Rails API
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PUBLIC_API_URL` | URL Rails API | `http://localhost/api` |

Скопируйте `.env.example` в `.env` и при необходимости измените значения.

## Команды

```bash
npm run dev        # Запуск в режиме разработки
npm run build      # Сборка для production
npm run preview    # Предпросмотр production-сборки
npm run typecheck  # Проверка типов TypeScript
```

## Связанные репозитории

- [biochem-backend](https://github.com/sakyaaa/biochem-backend) — Rails API
