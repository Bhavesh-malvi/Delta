import express from 'express';
import { createEnroll, getAllEnrolls, deleteEnroll, getEnrollCount } from '../Controllers/enrollController.js';

const router = express.Router();

router.post('/', createEnroll);
router.get('/', getAllEnrolls);
router.delete('/:id', deleteEnroll);
router.get('/count', getEnrollCount);

export default router; 