const bcrypt = require('bcrypt');
const { User } = require('../models');

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

// GET /register
const showRegister = (req, res) => {
    res.render('auth/register', {
        title: 'Регистрация',
        errors: [],
        form: { name: '', email: '' }
    });
};

// POST /register   (данные уже проверены в checkRegister)
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).render('auth/register', {
                title: 'Регистрация',
                errors: ['Пользователь с таким email уже зарегистрирован'],
                form: { name, email }
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Роль из формы НЕ читаем: она всегда равна значению по умолчанию (user)
        await User.create({ name, email, password: hashedPassword });

        res.redirect('/login?registered=1');
    } catch (err) {
        next(err);
    }
};

// GET /login
const showLogin = (req, res) => {
    res.render('auth/login', {
        title: 'Вход',
        errors: [],
        form: { email: '' },
        registered: req.query.registered === '1'
    });
};

// POST /login   (данные уже проверены в checkLogin)
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        const passwordOk = user ? await bcrypt.compare(password, user.password) : false;

        // Одно и то же сообщение и для неверного email, и для неверного пароля
        if (!passwordOk) {
            return res.status(401).render('auth/login', {
                title: 'Вход',
                errors: ['Неверный email или пароль'],
                form: { email },
                registered: false
            });
        }

        user.lastLogin = new Date();
        await user.save();

        // regenerate создаёт новый id сессии после входа (защита от session fixation)
        req.session.regenerate((err) => {
            if (err) {
                return next(err);
            }

            // В сессии только нужные данные. Пароль (и его hash) сюда не попадает
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            req.session.save((saveErr) => {
                if (saveErr) {
                    return next(saveErr);
                }
                res.redirect('/profile');
            });
        });
    } catch (err) {
        next(err);
    }
};

// POST /logout
const logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

// GET /profile   (доступно только после isAuthenticated)
const profile = async (req, res, next) => {
    try {
        // Берём актуальные данные из БД, но без пароля
        const user = await User.findByPk(req.session.user.id, {
            attributes: { exclude: ['password'] }
        });

        // Пользователя могли удалить из БД, пока сессия ещё жива
        if (!user) {
            return req.session.destroy(() => {
                res.clearCookie('connect.sid');
                res.redirect('/login');
            });
        }

        res.render('profile', { title: 'Профиль', user });
    } catch (err) {
        next(err);
    }
};

module.exports = { showRegister, register, showLogin, login, logout, profile };
