// Подключается ПОСЛЕ всех маршрутов: если ни один маршрут не подошёл, запрос попадает сюда
const notFound = (req, res) => {
    res.status(404).render('404', {
        title: 'Страница не найдена',
        url: req.originalUrl
    });
};

module.exports = notFound;
