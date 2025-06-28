const express = require('express');
const router = express.Router();
const {
    getAllEnrollCourses,
    createEnrollCourse,
    updateEnrollCourse,
    deleteEnrollCourse
} = require('../Controllers/enrollCourseController');

// Routes
router.get('/', getAllEnrollCourses);
router.post('/', createEnrollCourse);
router.put('/:id', updateEnrollCourse);
router.delete('/:id', deleteEnrollCourse);

module.exports = router; 