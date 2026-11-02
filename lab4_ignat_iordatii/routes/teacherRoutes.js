const express = require('express');
const teacherController = require('../controllers/teacherController');
const { checkIdParam, validateTeacher } = require('../middleware/validateData');

const router = express.Router();

router.param('id', checkIdParam);

router.get('/', teacherController.getAllTeachers);
router.get('/new', teacherController.showCreateForm);
router.post('/', validateTeacher, teacherController.createTeacher);

router.get('/:id', teacherController.getTeacherById);
router.get('/:id/edit', teacherController.showEditForm);
router.post('/:id/edit', validateTeacher, teacherController.updateTeacher);
router.post('/:id/delete', teacherController.deleteTeacher);

module.exports = router;