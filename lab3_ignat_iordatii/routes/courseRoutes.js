const express = require('express');
const courseController = require('../controllers/courseController');
const validateCourse = require('../middleware/validateCourse');

const router = express.Router();

router.get('/', courseController.getAllCourses);
router.get('/new', courseController.showCreateForm); // до '/:id'
router.post('/', validateCourse, courseController.createCourse);

router.get('/:id', courseController.getCourseById);
router.get('/:id/edit', courseController.showEditForm);
router.post('/:id/edit', validateCourse, courseController.updateCourse);
router.post('/:id/delete', courseController.deleteCourse);

module.exports = router;