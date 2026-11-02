# Лабораторная работа №2. REST API на Express.js

REST API для управления книгами и авторами, построенное на Express.js по архитектуре MVC.
Данные хранятся в памяти (в массивах модулей `models/`), поэтому после перезапуска сервера они возвращаются к исходным.

**Автор:** Иордатий Игнат, группа IA2403

## Технологии

- Node.js
- Express.js 5

## Установка и запуск

```bash
npm install
npm start
```

Сервер запускается на `http://localhost:3000`.

## Структура проекта

```
lab2_ignat_iordatii/
├── app.js                      # точка входа, подключение middleware и роутеров
├── package.json
├── routes/
│   ├── bookRoutes.js           # маршруты /api/books
│   └── authorRoutes.js         # маршруты /api/authors
├── controllers/
│   ├── bookController.js       # логика обработки запросов к книгам
│   └── authorController.js     # логика обработки запросов к авторам
├── models/
│   ├── bookModel.js            # данные и функции работы с книгами
│   └── authorModel.js          # данные и функции работы с авторами
├── middleware/
│   └── logger.js               # логирование запросов
└── docs/
    └── lab2.postman_collection.json
```

## Архитектура MVC

| Слой | Папка | Назначение |
|---|---|---|
| Model | `models/` | хранение данных и функции доступа к ним |
| Controller | `controllers/` | обработка запроса, валидация, выбор кода ответа |
| Router | `routes/` | сопоставление метода и URL с функцией контроллера |
| View | - | JSON-ответ сервера |

## Модели данных

**Книга:** `{ id, title, authorId, genre, year }`

**Автор:** `{ id, name, country }`

## API

### Книги

| Метод | URL | Описание | Коды ответа |
|---|---|---|---|
| GET | `/api/books` | все книги (поддерживает фильтры) | 200 |
| GET | `/api/books/:id` | книга по ID | 200, 404 |
| GET | `/api/books/search?title=...` | поиск по части названия (без учёта регистра) | 200, 400 |
| POST | `/api/books` | добавить книгу | 201, 400 |
| PATCH | `/api/books/:id` | изменить поля книги | 200, 400, 404 |
| DELETE | `/api/books/:id` | удалить книгу | 200, 404 |

### Авторы

| Метод | URL | Описание | Коды ответа |
|---|---|---|---|
| GET | `/api/authors` | все авторы | 200 |
| GET | `/api/authors/:id` | автор по ID | 200, 404 |
| GET | `/api/authors/:id/books` | книги автора | 200, 404 |

### Статистика

| Метод | URL | Описание |
|---|---|---|
| GET | `/api/statistics` | количество книг, авторов, жанров, самая новая и самая старая книга |

## Фильтрация книг

Параметры можно комбинировать. Без параметров возвращаются все книги.

```
GET /api/books?genre=fantasy
GET /api/books?year=2008
GET /api/books?genre=fantasy&year=1937
```

## Примеры запросов

### Добавление книги

```
POST /api/books
Content-Type: application/json

{
    "title": "Clean Code",
    "authorId": 3,
    "genre": "programming",
    "year": 2008
}
```

Ответ `201 Created`:

```json
{
    "id": 7,
    "title": "Clean Code",
    "authorId": 3,
    "genre": "programming",
    "year": 2008
}
```

Все поля обязательны. При отсутствии поля возвращается `400 Bad Request`.
Указанный `authorId` должен существовать, иначе возвращается `400 Bad Request`.

### Изменение книги

```
PATCH /api/books/7
Content-Type: application/json

{
    "genre": "software engineering"
}
```

Изменяются только переданные поля.

### Статистика

```
GET /api/statistics
```

```json
{
    "totalBooks": 6,
    "totalAuthors": 4,
    "totalGenres": 4,
    "newestBook": { "id": 5, "title": "Clean Architecture", "authorId": 3, "genre": "programming", "year": 2017 },
    "oldestBook": { "id": 1, "title": "The Hobbit", "authorId": 1, "genre": "fantasy", "year": 1937 }
}
```

## Обработка ошибок

| Ситуация | Код | Тело ответа |
|---|---|---|
| Книга не найдена | 404 | `{ "error": "Book not found" }` |
| Автор не найден | 404 | `{ "error": "Author not found" }` |
| Неизвестный маршрут | 404 | `{ "error": "Route not found" }` |
| Нет обязательных полей | 400 | `{ "error": "Missing required fields: ..." }` |
| Несуществующий `authorId` при добавлении | 400 | `{ "error": "Author not found" }` |

## Логирование

Собственный middleware `middleware/logger.js` выводит в терминал каждый запрос в формате:

```
GET | /api/books | 02.11.2026 14:25
```

## Тестирование

Готовая коллекция запросов для Postman находится в `docs/lab2.postman_collection.json`
(Postman → Import → выбрать файл). Запросы 11, 14, 16, 17 нужно выполнять по порядку.
