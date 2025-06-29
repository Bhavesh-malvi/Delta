import express from 'express';
import { getStats, updateStats } from '../Controllers/statsController.js';

const router = express.Router();

router.get('/', getStats);
router.put('/', updateStats);

export default router; 