require('dotenv').config({ quiet: true });

const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const session = require('express-session');
const { sequelize } = require('./models');
const { requestLogger } = require('./middleware/logger');
const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const authRoutes = require('./routes/authRoutes');
const { setCurrentUser, isAuthenticated } = require('./middleware/auth');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const courseController = require('./controllers/courseController');

const app = express();
const PORT = process.env.PORT || 3000;

// Шаблонизатор EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Данные, доступные во всех шаблонах
app.locals.appTitle = 'Система управления учебными курсами';
// Значение по умолчанию: страница ошибки может отрисоваться до подключения сессии
app.locals.currentUser = null;
app.locals.student = { name: 'Иордатий Игнат', group: 'IA2403' };

// Middleware
app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Сессии: данные хранятся на сервере, браузеру отдаётся cookie с id сессии
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,              // не сохранять сессию, если она не менялась
    saveUninitialized: false,   // не создавать сессию для гостей без необходимости
    cookie: {
        maxAge: 1000 * 60 * 60, // cookie живёт 1 час
        httpOnly: true,         // JavaScript в браузере не видит cookie
        sameSite: 'lax'
    }
}));

// currentUser доступен во всех шаблонах (подключается после сессии)
app.use(setCurrentUser);

// Маршруты
app.get('/', (req, res) => {
    res.redirect('/courses');
});
app.use('/', authRoutes);
app.use('/courses', courseRoutes);
app.use('/teachers', teacherRoutes);

// Статистика: только для вошедших пользователей (user и admin)
app.get('/statistics', isAuthenticated, courseController.getStatistics);

// Неизвестный маршрут -> 404 (после всех маршрутов)
app.use(notFound);

// Централизованный обработчик ошибок (самый последний)
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
    console.error('Необработанная ошибка:', reason);
});

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established');

        await sequelize.sync();

        // Socket.IO подключается к HTTP-серверу, поэтому запускаем через http.createServer,
        // а не через app.listen()
        const server = http.createServer(app);
        const io = new Server(server);

        // Контроллеры получают io через req.app.get('io')
        app.set('io', io);

        io.on('connection', (socket) => {
            console.log(`WebSocket: клиент подключился (${socket.id})`);
            socket.on('disconnect', () => {
                console.log(`WebSocket: клиент отключился (${socket.id})`);
            });
        });

        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Не удалось подключиться к базе данных.');
        console.error('Проверьте, что PostgreSQL запущен и параметры в .env указаны верно.');
        console.error(`Причина: ${err.message}`);
        process.exit(1);
    }
};

start();