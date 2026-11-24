const { body, validationResult } = require('express-validator');
const { Teacher, Course } = require('../models');

const MAX_INT = 2147483647; // верхняя граница типа INTEGER в PostgreSQL

// В Express 5 req.body может быть undefined, если тело запроса не пришло
const text = (value) => (typeof value === 'string' ? value : '');
const firstErrors = (req) =>
    validationResult(req).array({ onlyFirstError: true }).map((error) => error.msg);

// ===== Проверка параметра :id (подключается через router.param) =====
const checkIdParam = (req, res, next, value) => {
    const id = Number(value);

    if (!Number.isInteger(id) || id < 1 || id > MAX_INT) {
        return res.status(404).render('404', {
            title: 'Некорректный ID',
            url: req.originalUrl
        });
    }
    next();
};

// ===================== Регистрация и вход =====================
const registerRules = [
    body('name')
        .isString().withMessage('Имя обязательно').bail()
        .trim()
        .notEmpty().withMessage('Имя обязательно').bail()
        .isLength({ min: 2 }).withMessage('Имя должно содержать минимум два символа'),

    body('email')
        .isString().withMessage('Email обязателен').bail()
        .trim()
        .notEmpty().withMessage('Email обязателен').bail()
        .isEmail().withMessage('Email имеет некорректный формат').bail()
        .toLowerCase(),

    // Пароль НЕ обрезаем (trim): пробелы в пароле допустимы
    body('password')
        .isString().withMessage('Пароль обязателен').bail()
        .notEmpty().withMessage('Пароль обязателен').bail()
        .isLength({ min: 6 }).withMessage('Пароль должен содержать минимум шесть символов'),

    body('confirmPassword')
        .isString().withMessage('Подтвердите пароль').bail()
        .notEmpty().withMessage('Подтвердите пароль').bail()
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Пароль и подтверждение не совпадают')
];

const loginRules = [
    body('email')
        .isString().withMessage('Email обязателен').bail()
        .trim()
        .notEmpty().withMessage('Email обязателен').bail()
        .isEmail().withMessage('Email имеет некорректный формат').bail()
        .toLowerCase(),

    body('password')
        .isString().withMessage('Пароль обязателен').bail()
        .notEmpty().withMessage('Пароль обязателен')
];

const checkRegister = (req, res, next) => {
    const errors = firstErrors(req);
    if (errors.length === 0) {
        return next();
    }

    const data = req.body || {};
    res.status(400).render('auth/register', {
        title: 'Регистрация',
        errors,
        form: { name: text(data.name), email: text(data.email) }
    });
};

const checkLogin = (req, res, next) => {
    const errors = firstErrors(req);
    if (errors.length === 0) {
        return next();
    }

    const data = req.body || {};
    res.status(400).render('auth/login', {
        title: 'Вход',
        errors,
        form: { email: text(data.email) },
        registered: false
    });
};

// ===================== Преподаватель =====================
const teacherRules = [
    body('name')
        .isString().withMessage('Имя обязательно').bail()
        .trim()
        .notEmpty().withMessage('Имя обязательно'),

    body('email')
        .isString().withMessage('Email обязателен').bail()
        .trim()
        .notEmpty().withMessage('Email обязателен').bail()
        .isEmail().withMessage('Email имеет некорректный формат').bail()
        .toLowerCase()
        // Email должен быть уникальным (при редактировании свою запись не считаем)
        .custom(async (email, { req }) => {
            const existing = await Teacher.findOne({ where: { email } });
            const currentId = req.params.id !== undefined ? Number(req.params.id) : null;
            if (existing && existing.id !== currentId) {
                throw new Error('Преподаватель с таким email уже существует');
            }
        }),

    body('department')
        .isString().withMessage('Кафедра обязательна').bail()
        .trim()
        .notEmpty().withMessage('Кафедра обязательна'),

    body('academicDegree')
        .isString().withMessage('Учёная степень обязательна').bail()
        .trim()
        .notEmpty().withMessage('Учёная степень обязательна')
];

const checkTeacher = async (req, res, next) => {
    try {
        const errors = firstErrors(req);

        if (errors.length === 0) {
            const { name, email, department, academicDegree } = req.body;
            req.validatedTeacher = { name, email, department, academicDegree };
            return next();
        }

        const data = req.body || {};
        const entered = {
            name: text(data.name),
            email: text(data.email),
            department: text(data.department),
            academicDegree: text(data.academicDegree)
        };

        if (req.params.id !== undefined) {
            const id = Number(req.params.id);
            const teacher = await Teacher.findByPk(id);
            if (!teacher) {
                return res.status(404).render('404', {
                    title: 'Преподаватель не найден',
                    url: req.originalUrl
                });
            }
            return res.status(400).render('teachers/edit', {
                title: 'Редактирование преподавателя',
                teacher: { ...entered, id },
                errors
            });
        }

        res.status(400).render('teachers/create', {
            title: 'Добавление преподавателя',
            teacher: entered,
            errors
        });
    } catch (err) {
        next(err);
    }
};

// ===================== Курс =====================
const courseRules = [
    body('title')
        .isString().withMessage('Название курса обязательно').bail()
        .trim()
        .notEmpty().withMessage('Название курса обязательно'),

    body('credits')
        .isString().withMessage('Количество кредитов должно быть числом').bail()
        .trim()
        .isInt({ min: 1, max: 100 })
        .withMessage('Количество кредитов должно быть целым числом от 1 до 100')
        .toInt(),

    body('semester')
        .isString().withMessage('Семестр должен быть целым числом').bail()
        .trim()
        .isInt({ min: 1, max: 8 })
        .withMessage('Семестр должен быть целым числом от 1 до 8')
        .toInt(),

    body('description')
        .isString().withMessage('Описание обязательно').bail()
        .trim()
        .notEmpty().withMessage('Описание обязательно'),

    // Преподаватель должен быть выбран и существовать в БД
    body('teacherId')
        .isString().withMessage('Выберите преподавателя').bail()
        .trim()
        .notEmpty().withMessage('Выберите преподавателя').bail()
        .isInt({ min: 1, max: MAX_INT }).withMessage('Выбранный преподаватель не существует').bail()
        .toInt()
        .custom(async (teacherId) => {
            const teacher = await Teacher.findByPk(teacherId);
            if (!teacher) {
                throw new Error('Выбранный преподаватель не существует');
            }
        })
];

const checkCourse = async (req, res, next) => {
    try {
        const errors = firstErrors(req);

        if (errors.length === 0) {
            const { title, credits, semester, description, teacherId } = req.body;
            req.validatedCourse = { title, credits, semester, description, teacherId };
            return next();
        }

        const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });

        const data = req.body || {};
        const entered = {
            title: text(data.title),
            credits: text(data.credits),
            semester: text(data.semester),
            description: text(data.description),
            teacherId: text(data.teacherId)
        };

        if (req.params.id !== undefined) {
            const id = Number(req.params.id);
            const course = await Course.findByPk(id);
            if (!course) {
                return res.status(404).render('404', {
                    title: 'Курс не найден',
                    url: req.originalUrl
                });
            }
            return res.status(400).render('courses/edit', {
                title: 'Редактирование курса',
                course: { ...entered, id },
                teachers,
                errors
            });
        }

        res.status(400).render('courses/create', {
            title: 'Добавление курса',
            course: entered,
            teachers,
            errors
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    checkIdParam,
    registerRules, loginRules, checkRegister, checkLogin,
    teacherRules, checkTeacher,
    courseRules, checkCourse
};
