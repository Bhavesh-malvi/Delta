import express from 'express';
import {
    createHomeCourse,
    getHomeCourses,
    updateHomeCourse,
    deleteHomeCourse
} from '../Controllers/homeCourseController.js';

const router = express.Router();

// Routes
router.post('/', createHomeCourse);
router.get('/', getHomeCourses);
router.put('/:id', updateHomeCourse);
router.delete('/:id', deleteHomeCourse);

export default router; 