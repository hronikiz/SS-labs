# Лабораторная работа №5. Аутентификация, авторизация и защита Express-приложения

Система управления учебными курсами (продолжение лабораторной №4). Добавлены регистрация и вход,
пароли в виде hash, сессии, роли `user` и `admin`, защита маршрутов, валидация, централизованная
обработка ошибок, логирование и уведомления в реальном времени через WebSocket.

**Автор:** Иордатий Игнат, группа IA2403

## Технологии

Node.js, Express.js 5, EJS, PostgreSQL, Sequelize, bcrypt, express-session, express-validator,
morgan, socket.io, dotenv

## Установка и запуск

1. Создайте базу данных:

   ```sql
   CREATE DATABASE node_courses;
   ```

2. Скопируйте `.env.example` в `.env` и укажите свои значения:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=node_courses
   DB_USER=postgres
   DB_PASSWORD=your_password
   PORT=3000
   SESSION_SECRET=your_long_secret_value
   BCRYPT_ROUNDS=10
   ```

   Файл `.env` не загружается в репозиторий (указан в `.gitignore`).

3. Установите зависимости и запустите приложение:

   ```bash
   npm install
   npm start
   ```

   Приложение доступно на `http://localhost:3000`. Таблицы создаются автоматически (`sequelize.sync()`).

## Как создать администратора

Выбрать роль при регистрации нельзя: новый пользователь всегда получает роль `user`.

1. Зарегистрируйте пользователя на `/register`.
2. Измените роль в базе данных:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
   ```

3. Выйдите и войдите снова (роль сохраняется в сессии при входе).

## Структура проекта

```
lab5_name_surname/
├── app.js
├── config/database.js
├── routes/                 # authRoutes, courseRoutes, teacherRoutes
├── controllers/            # authController, courseController, teacherController
├── models/                 # index, User, Course, Teacher
├── middleware/
│   ├── auth.js             # setCurrentUser, isAuthenticated, isAdmin
│   ├── validation.js       # правила express-validator
│   ├── logger.js           # morgan + журнал действий администратора
│   ├── notFound.js         # 404
│   └── errorHandler.js     # централизованная обработка ошибок
├── views/                  # auth/, courses/, teachers/, partials/, profile, 403, 404, error
├── public/css/style.css
├── public/js/notifications.js
├── logs/requests.log       # создаётся автоматически
├── .env.example
└── .gitignore
```

## Модель User

`id`, `name`, `email` (уникальный), `password` (только hash bcrypt), `role` (`user` или `admin`,
по умолчанию `user`), `lastLogin`, `createdAt`, `updatedAt`.

## Маршруты аутентификации

| Метод | URL | Назначение |
|---|---|---|
| GET | `/register` | форма регистрации |
| POST | `/register` | создание пользователя |
| GET | `/login` | форма входа |
| POST | `/login` | проверка данных и вход |
| POST | `/logout` | завершение сессии |
| GET | `/profile` | профиль (только для вошедших) |

## Права доступа

| Действие | Гость | User | Admin |
|---|---|---|---|
| Просмотр курсов и преподавателей, поиск и фильтрация | да | да | да |
| Профиль | нет | да | да |
| Статистика | нет | да | да |
| Добавление, редактирование и удаление курсов и преподавателей | нет | нет | да |

Права проверяются middleware `isAuthenticated` и `isAdmin` на сервере. Скрытие кнопок в шаблонах
служит только удобству. Гость перенаправляется на `/login`, пользователь без прав получает 403.

## Валидация

`express-validator` проверяет регистрацию, вход, преподавателей и курсы. Некорректные данные не
сохраняются, форма возвращается с сообщениями об ошибках (пароль обратно не выводится).

## Обработка ошибок

`middleware/notFound.js` (404) подключается после всех маршрутов, `middleware/errorHandler.js`
подключается последним. Ошибки со всех контроллеров передаются через `next(err)`.
Коды: 400, 401, 403, 404, 409, 500 (и 503 при недоступной БД). Пользователю не показываются пароли,
параметры подключения, stack trace и текст SQL.

## Логирование

- Morgan (`dev`) выводит запросы в терминал.
- Запросы также пишутся в `logs/requests.log`:

  ```
  POST /login | 302 | 74 ms | 18.11.2026 14:35
  ```

- Действия администратора выводятся в терминал:

  ```
  ADMIN ACTION | admin@example.com | DELETE COURSE | Course ID: 5 | 18.11.2026 14:35:07
  ```

## Уведомления (Socket.IO)

Приложение запускается через `http.createServer(app)`, к которому подключён `socket.io`.
Когда администратор добавляет курс, сервер отправляет всем клиентам событие `courseCreated`
(название курса, имя преподавателя, время). `public/js/notifications.js` показывает уведомление в блоке
«Уведомления» без перезагрузки страницы; оно исчезает через 10 секунд или по кнопке закрытия.
