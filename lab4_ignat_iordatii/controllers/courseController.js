const { Op, fn, col } = require('sequelize');
const { Course, Teacher } = require('../models');

const renderNotFound = (req, res) => {
    res.status(404).render('404', {
        title: 'Курс не найден',
        url: req.originalUrl
    });
};

// Разбор целого числа из query-параметра; пустое или некорректное значение даёт null
const parseIntParam = (value, min, max) => {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) return null;
    return number;
};

// Экранирование символов, которые имеют особый смысл в LIKE
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

// GET /courses  (?search=...&teacherId=...&semester=...)
const getAllCourses = async (req, res, next) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const teacherId = parseIntParam(req.query.teacherId, 1, 2147483647);
        const semester = parseIntParam(req.query.semester, 1, 8);

        // Условия накапливаются в одном объекте: Sequelize объединяет их через AND
        const where = {};

        if (search) {
            where.title = { [Op.iLike]: `%${escapeLike(search)}%` };
        }
        if (teacherId !== null) {
            where.teacherId = teacherId;
        }
        if (semester !== null) {
            where.semester = semester;
        }

        const courses = await Course.findAll({
            where,
            include: Teacher,
            order: [['title', 'ASC']]
        });

        const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });

        res.render('courses/index', {
            title: 'Список курсов',
            courses,
            teachers,
            search,
            teacherId: teacherId !== null ? String(teacherId) : '',
            semester: semester !== null ? String(semester) : ''
        });
    } catch (err) {
        next(err);
    }
};

// GET /courses/:id
const getCourseById = async (req, res, next) => {
    try {
        const course = await Course.findByPk(Number(req.params.id), { include: Teacher });

        if (!course) {
            return renderNotFound(req, res);
        }

        res.render('courses/details', { title: course.title, course });
    } catch (err) {
        next(err);
    }
};

// GET /courses/new
const showCreateForm = async (req, res, next) => {
    try {
        const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });

        res.render('courses/create', {
            title: 'Добавление курса',
            course: { title: '', credits: '', semester: '', description: '', teacherId: '' },
            teachers,
            errors: []
        });
    } catch (err) {
        next(err);
    }
};

// POST /courses   (данные проверены в validateCourse)
const createCourse = async (req, res, next) => {
    try {
        await Course.create(req.validatedCourse);
        res.redirect('/courses');
    } catch (err) {
        next(err);
    }
};

// GET /courses/:id/edit
const showEditForm = async (req, res, next) => {
    try {
        const course = await Course.findByPk(Number(req.params.id));

        if (!course) {
            return renderNotFound(req, res);
        }

        const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });

        res.render('courses/edit', {
            title: 'Редактирование курса',
            course,
            teachers,
            errors: []
        });
    } catch (err) {
        next(err);
    }
};

// POST /courses/:id/edit
const updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findByPk(Number(req.params.id));

        if (!course) {
            return renderNotFound(req, res);
        }

        await course.update(req.validatedCourse);
        res.redirect(`/courses/${course.id}`);
    } catch (err) {
        next(err);
    }
};

// POST /courses/:id/delete
const deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findByPk(Number(req.params.id));

        if (!course) {
            return renderNotFound(req, res);
        }

        await course.destroy();
        res.redirect('/courses');
    } catch (err) {
        next(err);
    }
};

// GET /statistics
const getStatistics = async (req, res, next) => {
    try {
        const totalTeachers = await Teacher.count();
        const totalCourses = await Course.count();

        // Количество курсов в каждом семестре: SELECT semester, COUNT(id) ... GROUP BY semester
        const semesterRows = await Course.findAll({
            attributes: ['semester', [fn('COUNT', col('id')), 'count']],
            group: ['semester'],
            raw: true
        });

        // Семестры без курсов показываем с нулём
        const bySemester = [];
        for (let semester = 1; semester <= 8; semester++) {
            const row = semesterRows.find((item) => item.semester === semester);
            bySemester.push({ semester, count: row ? Number(row.count) : 0 });
        }

        // Количество курсов у каждого преподавателя (LEFT JOIN + COUNT + GROUP BY)
        const teacherRows = await Teacher.findAll({
            attributes: ['id', 'name', [fn('COUNT', col('Courses.id')), 'coursesCount']],
            include: [{ model: Course, attributes: [] }],
            group: ['Teacher.id'],
            order: [[fn('COUNT', col('Courses.id')), 'DESC'], ['name', 'ASC']],
            raw: true
        });

        const byTeacher = teacherRows.map((row) => ({
            id: row.id,
            name: row.name,
            count: Number(row.coursesCount)
        }));

        // Преподаватель(и) с наибольшим числом курсов (при равенстве показываем всех)
        const maxCount = byTeacher.length > 0 ? byTeacher[0].count : 0;
        const topTeachers =
            maxCount > 0 ? byTeacher.filter((teacher) => teacher.count === maxCount) : [];

        res.render('statistics', {
            title: 'Статистика',
            totalTeachers,
            totalCourses,
            bySemester,
            byTeacher,
            topTeachers,
            maxCount,
            maxSemesterCount: Math.max(...bySemester.map((item) => item.count), 1)
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    showCreateForm,
    createCourse,
    showEditForm,
    updateCourse,
    deleteCourse,
    getStatistics
};