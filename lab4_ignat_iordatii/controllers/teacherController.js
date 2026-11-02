const { Teacher, Course } = require('../models');

const renderNotFound = (req, res) => {
    res.status(404).render('404', {
        title: 'Преподаватель не найден',
        url: req.originalUrl
    });
};

// GET /teachers
const getAllTeachers = async (req, res, next) => {
    try {
        const teachers = await Teacher.findAll({
            include: [{ model: Course, attributes: ['id'] }],
            order: [['name', 'ASC']]
        });

        res.render('teachers/index', { title: 'Преподаватели', teachers });
    } catch (err) {
        next(err);
    }
};

// GET /teachers/:id
const getTeacherById = async (req, res, next) => {
    try {
        const teacher = await Teacher.findByPk(Number(req.params.id), {
            include: Course,
            order: [[Course, 'title', 'ASC']]
        });

        if (!teacher) {
            return renderNotFound(req, res);
        }

        res.render('teachers/details', {
            title: teacher.name,
            teacher,
            courses: teacher.Courses,
            error: null
        });
    } catch (err) {
        next(err);
    }
};

// GET /teachers/new
const showCreateForm = (req, res) => {
    res.render('teachers/create', {
        title: 'Добавление преподавателя',
        teacher: { name: '', email: '', department: '', academicDegree: '' },
        errors: []
    });
};

// POST /teachers   (данные проверены в validateTeacher)
const createTeacher = async (req, res, next) => {
    try {
        await Teacher.create(req.validatedTeacher);
        res.redirect('/teachers');
    } catch (err) {
        next(err);
    }
};

// GET /teachers/:id/edit
const showEditForm = async (req, res, next) => {
    try {
        const teacher = await Teacher.findByPk(Number(req.params.id));

        if (!teacher) {
            return renderNotFound(req, res);
        }

        res.render('teachers/edit', {
            title: 'Редактирование преподавателя',
            teacher,
            errors: []
        });
    } catch (err) {
        next(err);
    }
};

// POST /teachers/:id/edit
const updateTeacher = async (req, res, next) => {
    try {
        const teacher = await Teacher.findByPk(Number(req.params.id));

        if (!teacher) {
            return renderNotFound(req, res);
        }

        await teacher.update(req.validatedTeacher);
        res.redirect(`/teachers/${teacher.id}`);
    } catch (err) {
        next(err);
    }
};

// POST /teachers/:id/delete
const deleteTeacher = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            return renderNotFound(req, res);
        }

        // Нельзя удалять преподавателя, у которого есть курсы
        const coursesCount = await Course.count({ where: { teacherId: id } });

        if (coursesCount > 0) {
            const courses = await teacher.getCourses({ order: [['title', 'ASC']] });

            return res.status(409).render('teachers/details', {
                title: teacher.name,
                teacher,
                courses,
                error: 'Невозможно удалить преподавателя, у которого есть курсы'
            });
        }

        await teacher.destroy();
        res.redirect('/teachers');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllTeachers,
    getTeacherById,
    showCreateForm,
    createTeacher,
    showEditForm,
    updateTeacher,
    deleteTeacher
};