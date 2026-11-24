// Кладёт пользователя из сессии в res.locals: после этого
// переменная currentUser доступна во ВСЕХ шаблонах EJS
const setCurrentUser = (req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
};

// Аутентификация: пускает дальше только вошедшего пользователя
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Авторизация: пускает дальше только администратора
const isAdmin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).render('403', {
            title: 'Доступ запрещён',
            url: req.originalUrl
        });
    }

    next();
};

module.exports = { setCurrentUser, isAuthenticated, isAdmin };
