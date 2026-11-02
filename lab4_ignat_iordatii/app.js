require('dotenv').config({ quiet: true });

const path = require('path');
const express = require('express');
const { sequelize } = require('./models');
const logger = require('./middleware/logger');
const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const courseController = require('./controllers/courseController');

const app = express();
const PORT = process.env.PORT || 3000;

// Шаблонизатор EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Данные, доступные во всех шаблонах
app.locals.appTitle = 'Система управления учебными курсами';
app.locals.student = { name: 'Иордатий Игнат', group: 'IA2403' };

// Middleware
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты
app.get('/', (req, res) => {
    res.redirect('/courses');
});
app.use('/courses', courseRoutes);
app.use('/teachers', teacherRoutes);

app.get('/statistics', courseController.getStatistics);

// Неизвестный маршрут -> 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Страница не найдена',
        url: req.originalUrl
    });
});

// Обработчик ошибок (4 параметра): сюда попадает всё, что передано в next(err)
app.use((err, req, res, next) => {
    console.error(`[${err.name}] ${err.message}`);

    let code = 500;
    let message = 'Произошла внутренняя ошибка. Попробуйте позже.';

    if (
        err.name === 'SequelizeConnectionError' ||
        err.name === 'SequelizeConnectionRefusedError' ||
        err.name === 'SequelizeHostNotFoundError' ||
        err.name === 'SequelizeConnectionTimedOutError'
    ) {
        code = 503;
        message = 'База данных временно недоступна. Попробуйте позже.';
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        code = 400;
        message = 'Запись с такими данными уже существует.';
    } else if (err.name === 'SequelizeValidationError') {
        code = 400;
        message = 'Переданы некорректные данные.';
    } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        code = 400;
        message = 'Операция нарушает связи между данными.';
    }

    res.status(code).render('error', {
        title: 'Ошибка',
        code,
        message
    });
});

process.on('unhandledRejection', (reason) => {
    console.error('Необработанная ошибка:', reason);
});

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established');

        await sequelize.sync();

        app.listen(PORT, () => {
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