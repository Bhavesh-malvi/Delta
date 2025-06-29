import express from 'express';
import { getStats, incrementCustomerCount, updateStats } from '../Controllers/statsController.js';

const router = express.Router();

router.get('/', getStats);
router.post('/increment', incrementCustomerCount);
router.put('/update', updateStats);

export default router; 