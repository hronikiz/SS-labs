const express = require('express');
const courseController = require('../controllers/courseController');
const { isAdmin } = require('../middleware/auth');
const { checkIdParam, courseRules, checkCourse } = require('../middleware/validation');

const router = express.Router();

router.param('id', checkIdParam);

// Доступно всем (в том числе гостям)
router.get('/', courseController.getAllCourses);

// Только администратор. isAdmin стоит ПЕРВЫМ: проверка прав раньше валидации
router.get('/new', isAdmin, courseController.showCreateForm);
router.post('/', isAdmin, courseRules, checkCourse, courseController.createCourse);

router.get('/:id', courseController.getCourseById);

router.get('/:id/edit', isAdmin, courseController.showEditForm);
router.post('/:id/edit', isAdmin, courseRules, checkCourse, courseController.updateCourse);
router.post('/:id/delete', isAdmin, courseController.deleteCourse);

module.exports = router;
