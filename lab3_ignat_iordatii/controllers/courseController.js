const courseModel = require('../models/courseModel');

const renderNotFound = (req, res) => {
    res.status(404).render('404', {
        title: 'Курс не найден',
        url: req.originalUrl
    });
};

// GET /courses  (+ ?search=...&semester=...)
const getAllCourses = (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const semester = typeof req.query.semester === 'string' ? req.query.semester : '';

    const courses = courseModel.findAll({ search, semester });

    res.render('courses/index', {
        title: 'Список курсов',
        courses,
        search,
        semester
    });
};

// GET /courses/:id
const getCourseById = (req, res) => {
    const course = courseModel.getById(Number(req.params.id));

    if (!course) {
        return renderNotFound(req, res);
    }

    res.render('courses/details', { title: course.title, course });
};

// GET /courses/new
const showCreateForm = (req, res) => {
    res.render('courses/create', {
        title: 'Добавление курса',
        course: { title: '', teacher: '', credits: '', semester: '', description: '' },
        errors: []
    });
};

// POST /courses   (данные уже проверены в validateCourse)
const createCourse = (req, res) => {
    courseModel.create(req.validatedCourse);
    res.redirect('/courses');
};

// GET /courses/:id/edit
const showEditForm = (req, res) => {
    const course = courseModel.getById(Number(req.params.id));

    if (!course) {
        return renderNotFound(req, res);
    }

    res.render('courses/edit', {
        title: 'Редактирование курса',
        course,
        errors: []
    });
};

// POST /courses/:id/edit   (данные уже проверены в validateCourse)
const updateCourse = (req, res) => {
    const id = Number(req.params.id);

    if (!courseModel.getById(id)) {
        return renderNotFound(req, res);
    }

    courseModel.update(id, req.validatedCourse);
    res.redirect(`/courses/${id}`);
};

// POST /courses/:id/delete
const deleteCourse = (req, res) => {
    const removed = courseModel.remove(Number(req.params.id));

    if (!removed) {
        return renderNotFound(req, res);
    }

    res.redirect('/courses');
};

module.exports = {
    getAllCourses,
    getCourseById,
    showCreateForm,
    createCourse,
    showEditForm,
    updateCourse,
    deleteCourse
};