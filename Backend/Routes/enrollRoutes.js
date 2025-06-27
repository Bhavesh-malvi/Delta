import express from 'express';
import { createEnroll, getAllEnrolls, deleteEnroll } from '../Controllers/enrollController.js';

const router = express.Router();

router.post('/', createEnroll);
router.get('/', getAllEnrolls);
router.delete('/:id', deleteEnroll);

export default router; 