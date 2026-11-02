const courseModel = require('../models/courseModel');

const validateCourse = (req, res, next) => {
    const body = req.body || {};

    const title = String(body.title ?? '').trim();
    const teacher = String(body.teacher ?? '').trim();
    const description = String(body.description ?? '').trim();
    const creditsRaw = String(body.credits ?? '').trim().replace(',', '.');
    const semesterRaw = String(body.semester ?? '').trim();

    const errors = [];

    if (!title) {
        errors.push('Название дисциплины обязательно');
    }

    if (!teacher) {
        errors.push('Имя преподавателя обязательно');
    }

    const credits = Number(creditsRaw);
    if (creditsRaw === '' || !Number.isFinite(credits)) {
        errors.push('Количество кредитов должно быть числом');
    } else if (credits <= 0) {
        errors.push('Количество кредитов должно быть положительным числом');
    }

    const semester = Number(semesterRaw);
    if (semesterRaw === '' || !Number.isInteger(semester)) {
        errors.push('Семестр должен быть целым числом');
    } else if (semester < 1 || semester > 8) {
        errors.push('Семестр должен находиться в диапазоне от 1 до 8');
    }

    if (!description) {
        errors.push('Описание дисциплины обязательно');
    }

    if (errors.length > 0) {
        const entered = {
            title: body.title ?? '',
            teacher: body.teacher ?? '',
            credits: body.credits ?? '',
            semester: body.semester ?? '',
            description: body.description ?? ''
        };

        if (req.params.id !== undefined) {
            const id = Number(req.params.id);

            if (!courseModel.getById(id)) {
                return res.status(404).render('404', {
                    title: 'Курс не найден',
                    url: req.originalUrl
                });
            }

            return res.status(400).render('courses/edit', {
                title: 'Редактирование курса',
                course: { ...entered, id },
                errors
            });
        }

        return res.status(400).render('courses/create', {
            title: 'Добавление курса',
            course: entered,
            errors
        });
    }

    req.validatedCourse = { title, teacher, credits, semester, description };
    next();
};

module.exports = validateCourse;