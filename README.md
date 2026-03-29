# Xray Manager Client

Веб-клиент для управления Xray Reality сервером.

## Стек технологий

- **Vite** - сборка
- **SolidJS** - реактивный UI фреймворк
- **TypeScript** - типизация
- **TanStack Query** - управление серверным состоянием
- **Solid App Router** - роутинг

## Установка

```bash
pnpm install
```

## Запуск

```bash
pnpm dev
```

Приложение будет доступно на http://localhost:3000

## Проксирование API

Vite настроен на проксирование `/api` запросов на `http://localhost:8080`.

Убедитесь, что Xray Server запущен:

```bash
cd ../xray_server
go run cmd/server/main.go
```

## Использование

1. Откройте http://localhost:3000
2. Войдите с учетными данными администратора (по умолчанию: `admin` / `admin`)
3. Добавляйте клиентов и отслеживайте статистику трафика

## Функционал

- ✅ Аутентификация через JWT
- ✅ Просмотр списка клиентов
- ✅ Добавление новых клиентов
- ✅ Мониторинг трафика в реальном времени (обновление каждые 5 секунд)
- ✅ Копирование VLESS ссылок

## Сборка

```bash
pnpm build
```

Продукционная версия будет в папке `dist/`.

## Docker

### Сборка образа

```bash
docker build -t xray-manager-client:latest .
```

### Запуск контейнера

```bash
docker run -d --name xray-manager-client \
  -p 80:80 \
  xray-manager-client:latest
```

Приложение будет доступно на http://localhost

### Docker Compose

Пример `docker-compose.yml` для запуска вместе с Xray Server:

```yaml
services:
  xray-manager-client:
    image: xray-manager-client:latest
    container_name: xray-manager-client
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - xray-server

  xray-server:
    image: xray-server:latest
    container_name: xray-server
    restart: unless-stopped
    environment:
      - private_key=...
      - public_key=...
      - mldsa65_seed=...
      - mldsa65_public=...
      - shorts_id=...
      - server_ip=...
    volumes:
      - ./config.json:/app/config.json
```

## Переменные окружения

Для настройки API endpoint в production можно использовать nginx proxy_pass или изменить API URL в `src/api/index.ts`.

## Структура проекта

```
src/
├── api/           # API сервис для запросов к серверу
├── components/    # UI компоненты (LoginPage, Dashboard)
├── types/         # TypeScript типы
├── App.tsx        # Главный компонент с роутингом
├── App.css        # Стили приложения
└── index.tsx      # Точка входа
```
