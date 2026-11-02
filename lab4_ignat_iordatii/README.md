# Лабораторная работа №4. CRUD-приложение с PostgreSQL и Sequelize

Система управления учебными курсами: данные хранятся в PostgreSQL, доступ через ORM Sequelize.
Преподаватели и курсы связаны отношением «один ко многим». Интерфейс на EJS, архитектура MVC.

**Автор:** Иордатий Игнат, группа IA2403

## Технологии

Node.js, Express.js 5, EJS, PostgreSQL, Sequelize, dotenv

## Установка и запуск

1. Установите PostgreSQL и создайте базу данных:

   ```sql
   CREATE DATABASE node_courses;
   ```

2. Скопируйте `.env.example` в `.env` и укажите свои параметры подключения:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=node_courses
   DB_USER=postgres
   DB_PASSWORD=your_password
   PORT=3000
   ```

3. Установите зависимости и запустите приложение:

   ```bash
   npm install
   npm start
   ```

При запуске приложение проверяет соединение с базой (`Database connection established`)
и создаёт недостающие таблицы через `sequelize.sync()`. Приложение доступно на `http://localhost:3000`.

## Структура проекта

```
lab4/
├── app.js
├── config/database.js          # подключение Sequelize
├── models/
│   ├── index.js                # связи между моделями
│   ├── Teacher.js
│   └── Course.js
├── controllers/                # логика обработки запросов
├── routes/                     # маршруты
├── middleware/
│   ├── logger.js               # логирование запросов
│   └── validateData.js         # валидация данных
├── views/                      # EJS-шаблоны
├── public/css/style.css
├── .env.example
└── .gitignore
```

## Модели и связь

**Teacher:** `id`, `name`, `email` (уникальный), `department`, `academicDegree`

**Course:** `id`, `title`, `credits`, `semester` (1-8), `description`, `teacherId`

```js
Teacher.hasMany(Course, { foreignKey: 'teacherId' });
Course.belongsTo(Teacher, { foreignKey: 'teacherId' });
```

В базе внешний ключ создан с `ON DELETE RESTRICT`: преподавателя с курсами удалить нельзя.

## Маршруты

### Курсы

| Метод | URL | Назначение |
|---|---|---|
| GET | `/courses` | список (поиск и фильтры) |
| GET | `/courses/new` | форма добавления |
| POST | `/courses` | сохранение |
| GET | `/courses/:id` | просмотр |
| GET | `/courses/:id/edit` | форма редактирования |
| POST | `/courses/:id/edit` | сохранение изменений |
| POST | `/courses/:id/delete` | удаление |

### Преподаватели

| Метод | URL | Назначение |
|---|---|---|
| GET | `/teachers` | список с количеством курсов |
| GET | `/teachers/new` | форма добавления |
| POST | `/teachers` | сохранение |
| GET | `/teachers/:id` | просмотр и список курсов |
| GET | `/teachers/:id/edit` | форма редактирования |
| POST | `/teachers/:id/edit` | сохранение изменений |
| POST | `/teachers/:id/delete` | удаление (если нет курсов) |

### Прочее

| Метод | URL | Назначение |
|---|---|---|
| GET | `/statistics` | статистика |

## Поиск и фильтрация курсов

Условия выполняются в базе данных через Sequelize и применяются одновременно:

```
GET /courses?search=node
GET /courses?teacherId=2
GET /courses?semester=1
GET /courses?search=node&teacherId=2&semester=1
```

## Валидация

- **Преподаватель:** имя, кафедра и учёная степень заполнены; email заполнен, корректен и уникален.
- **Курс:** название и описание заполнены; кредиты — положительное число; семестр от 1 до 8; выбранный преподаватель существует.

Некорректные данные не сохраняются, форма возвращается с сообщениями и введёнными значениями.

## Обработка ошибок

Все асинхронные операции выполняются через `async/await` в `try...catch`. Ошибки передаются в общий
обработчик в `app.js`, который показывает страницу `error.ejs` (без технических подробностей):
недоступность БД (503), нарушение уникальности, валидации или внешнего ключа (400), прочие ошибки (500).
Некорректный ID, отсутствующий курс или преподаватель дают страницу 404.

## Статистика

Страница `/statistics`: количество преподавателей и курсов, курсы по семестрам,
курсы по преподавателям, преподаватель с наибольшим числом курсов.
Данные считаются в БД (`COUNT`, `GROUP BY`).