const path = require('path');
const express = require('express');
const logger = require('./middleware/logger');
const courseRoutes = require('./routes/courseRoutes');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.locals.appTitle = 'Система управления учебными курсами';
app.locals.student = { name: 'Иордатий Игнат', group: 'IA2403' };

// 1. Логирование всех запросов (до маршрутов)
app.use(logger);

// 2. Разбор данных HTML-форм (заполняет req.body)
app.use(express.urlencoded({ extended: true }));

// 3. Статические файлы (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// 4. Маршруты
app.get('/', (req, res) => {
    res.redirect('/courses');
});
app.use('/courses', courseRoutes);

// 5. Неизвестный маршрут -> страница 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Страница не найдена',
        url: req.originalUrl
    });
});

// 6. Обработчик внутренних ошибок (4 параметра!)
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).render('error', {
        title: 'Ошибка сервера',
        message: 'Произошла внутренняя ошибка. Попробуйте позже.'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});