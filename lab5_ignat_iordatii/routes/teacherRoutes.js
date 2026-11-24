const express = require('express');
const teacherController = require('../controllers/teacherController');
const { isAdmin } = require('../middleware/auth');
const { checkIdParam, teacherRules, checkTeacher } = require('../middleware/validation');

const router = express.Router();

router.param('id', checkIdParam);

// Доступно всем (в том числе гостям)
router.get('/', teacherController.getAllTeachers);

// Только администратор
router.get('/new', isAdmin, teacherController.showCreateForm);
router.post('/', isAdmin, teacherRules, checkTeacher, teacherController.createTeacher);

router.get('/:id', teacherController.getTeacherById);

router.get('/:id/edit', isAdmin, teacherController.showEditForm);
router.post('/:id/edit', isAdmin, teacherRules, checkTeacher, teacherController.updateTeacher);
router.post('/:id/delete', isAdmin, teacherController.deleteTeacher);

module.exports = router;
