# Лабораторная работа №2. REST API на Express.js

REST API для управления книгами и авторами, построенное на Express.js по архитектуре MVC.
Данные хранятся в памяти (в массивах модулей `models/`), поэтому после перезапуска сервера они возвращаются к исходным.

**Автор:** Иордатий Игнат, группа IA2403

## Цель работы

Освоить Express.js и построить REST API по архитектуре MVC: разделить код на маршруты, контроллеры и модели,
использовать middleware, корректные HTTP-методы и коды ответов, параметры пути и query-параметры.

## Что нового по сравнению с лабораторной №1

- Express.js вместо ручной проверки `req.method` и `req.url` в одной цепочке `if / else`: маршруты описываются
  через `app.use` и `express.Router`.
- Код разложен по слоям MVC (`routes`, `controllers`, `models`) вместо одного файла `app.js`.
- Тело запроса в формате JSON принимается через `express.json()` (доступно в `req.body`), параметры пути читаются
  из `req.params`, фильтры из `req.query`.
- Кроме GET появились POST, PATCH и DELETE, а также коды 201, 400 и 404 с JSON-описанием ошибки.
- Журнал запросов вынесен в собственный middleware `middleware/logger.js`.

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
    └── lab.2postman.json
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

## Порядок объявления маршрутов

В `routes/bookRoutes.js` маршрут `/search` объявлен раньше `/:id`. Express проверяет маршруты по порядку,
и при обратном порядке запрос `/api/books/search` был бы принят за поиск книги с `id = "search"`.
По той же причине обработчик неизвестных маршрутов (404) подключён в `app.js` после всех роутеров.

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

Готовая коллекция запросов для Postman находится в `docs/lab.2postman.json`
(Postman → Import → выбрать файл). Запросы 11, 14, 16, 17 нужно выполнять по порядку.

## Выводы

Построен REST API на Express.js с разделением на маршруты, контроллеры и модели. Освоены middleware, разбор
JSON-тела, параметров пути и query-параметров, а также выбор корректных кодов ответа (200, 201, 400, 404).

Ограничение: данные хранятся в массивах в памяти и сбрасываются при перезапуске сервера. Постоянное хранение
появляется в лабораторной работе №4 (PostgreSQL и Sequelize).
