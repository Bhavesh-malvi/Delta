import express from 'express';
import {
    getAllEnrollCourses,
    createEnrollCourse,
    updateEnrollCourse,
    deleteEnrollCourse
} from '../Controllers/enrollCourseController.js';

const router = express.Router();

// Routes
router.get('/', getAllEnrollCourses);
router.post('/', createEnrollCourse);
router.put('/:id', updateEnrollCourse);
router.delete('/:id', deleteEnrollCourse);

export default router; 