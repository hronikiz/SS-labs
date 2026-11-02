const express = require('express');
const courseController = require('../controllers/courseController');
const { checkIdParam, validateCourse } = require('../middleware/validateData');

const router = express.Router();

router.param('id', checkIdParam);

router.get('/', courseController.getAllCourses);
router.get('/new', courseController.showCreateForm); // до '/:id'
router.post('/', validateCourse, courseController.createCourse);

router.get('/:id', courseController.getCourseById);
router.get('/:id/edit', courseController.showEditForm);
router.post('/:id/edit', validateCourse, courseController.updateCourse);
router.post('/:id/delete', courseController.deleteCourse);

module.exports = router;