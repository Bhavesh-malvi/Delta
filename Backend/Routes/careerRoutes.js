import express from 'express';
import {
    getAllCareers,
    getCareer,
    createCareer,
    updateCareer,
    deleteCareer
} from '../Controllers/careerController.js';

const router = express.Router();

// Get all careers and Create new career
router.route('/')
    .get(getAllCareers)
    .post(createCareer);

// Get single career, Update and Delete career
router.route('/:id')
    .get(getCareer)
    .put(updateCareer)
    .delete(deleteCareer);

export default router; 