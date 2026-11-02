const { Teacher, Course } = require('../models');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_INT = 2147483647; // верхняя граница типа INTEGER в PostgreSQL

// Проверка параметра :id (подключается через router.param)
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

// ===== Преподаватели =====
const validateTeacher = async (req, res, next) => {
    try {
        const body = req.body || {};

        const name = String(body.name ?? '').trim();
        const email = String(body.email ?? '').trim().toLowerCase();
        const department = String(body.department ?? '').trim();
        const academicDegree = String(body.academicDegree ?? '').trim();

        const isEdit = req.params.id !== undefined;
        const currentId = isEdit ? Number(req.params.id) : null;

        const errors = [];

        if (!name) {
            errors.push('Имя обязательно');
        }

        if (!email) {
            errors.push('Email обязателен');
        } else if (!EMAIL_REGEX.test(email)) {
            errors.push('Email имеет некорректный формат');
        } else {
            const existing = await Teacher.findOne({ where: { email } });
            if (existing && existing.id !== currentId) {
                errors.push('Преподаватель с таким email уже существует');
            }
        }

        if (!department) {
            errors.push('Кафедра обязательна');
        }

        if (!academicDegree) {
            errors.push('Учёная степень обязательна');
        }

        if (errors.length > 0) {
            const entered = {
                name: body.name ?? '',
                email: body.email ?? '',
                department: body.department ?? '',
                academicDegree: body.academicDegree ?? ''
            };

            if (isEdit) {
                const teacher = await Teacher.findByPk(currentId);
                if (!teacher) {
                    return res.status(404).render('404', {
                        title: 'Преподаватель не найден',
                        url: req.originalUrl
                    });
                }
                return res.status(400).render('teachers/edit', {
                    title: 'Редактирование преподавателя',
                    teacher: { ...entered, id: currentId },
                    errors
                });
            }

            return res.status(400).render('teachers/create', {
                title: 'Добавление преподавателя',
                teacher: entered,
                errors
            });
        }

        req.validatedTeacher = { name, email, department, academicDegree };
        next();
    } catch (err) {
        next(err);
    }
};

// ===== Курсы =====
const validateCourse = async (req, res, next) => {
    try {
        const body = req.body || {};

        const title = String(body.title ?? '').trim();
        const description = String(body.description ?? '').trim();
        const creditsRaw = String(body.credits ?? '').trim().replace(',', '.');
        const semesterRaw = String(body.semester ?? '').trim();
        const teacherIdRaw = String(body.teacherId ?? '').trim();

        const isEdit = req.params.id !== undefined;
        const currentId = isEdit ? Number(req.params.id) : null;

        const errors = [];

        if (!title) {
            errors.push('Название курса обязательно');
        }

        const credits = Number(creditsRaw);
        if (creditsRaw === '' || !Number.isFinite(credits)) {
            errors.push('Количество кредитов должно быть числом');
        } else if (credits <= 0) {
            errors.push('Количество кредитов должно быть положительным числом');
        } else if (!Number.isInteger(credits)) {
            errors.push('Количество кредитов должно быть целым числом');
        } else if (credits > 100) {
            errors.push('Количество кредитов не должно превышать 100');
        }

        const semester = Number(semesterRaw);
        if (semesterRaw === '' || !Number.isInteger(semester)) {
            errors.push('Семестр должен быть целым числом');
        } else if (semester < 1 || semester > 8) {
            errors.push('Семестр должен находиться в диапазоне от 1 до 8');
        }

        if (!description) {
            errors.push('Описание обязательно');
        }

        // Преподаватель должен быть выбран и существовать в БД
        const teacherId = Number(teacherIdRaw);
        if (teacherIdRaw === '') {
            errors.push('Выберите преподавателя');
        } else if (!Number.isInteger(teacherId) || teacherId < 1 || teacherId > MAX_INT) {
            errors.push('Выбранный преподаватель не существует');
        } else {
            const teacher = await Teacher.findByPk(teacherId);
            if (!teacher) {
                errors.push('Выбранный преподаватель не существует');
            }
        }

        if (errors.length > 0) {
            const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });

            const entered = {
                title: body.title ?? '',
                credits: body.credits ?? '',
                semester: body.semester ?? '',
                description: body.description ?? '',
                teacherId: body.teacherId ?? ''
            };

            if (isEdit) {
                const existingCourse = await Course.findByPk(currentId);
                if (!existingCourse) {
                    return res.status(404).render('404', {
                        title: 'Курс не найден',
                        url: req.originalUrl
                    });
                }
                return res.status(400).render('courses/edit', {
                    title: 'Редактирование курса',
                    course: { ...entered, id: currentId },
                    teachers,
                    errors
                });
            }

            return res.status(400).render('courses/create', {
                title: 'Добавление курса',
                course: entered,
                teachers,
                errors
            });
        }

        req.validatedCourse = { title, credits, semester, description, teacherId };
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { checkIdParam, validateTeacher, validateCourse };