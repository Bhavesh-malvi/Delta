import express from 'express';
import {
    getAllHomeServices,
    createHomeService,
    updateHomeService,
    deleteHomeService
} from '../Controllers/homeServiceController.js';

const router = express.Router();

// GET /api/home-services - Get all services
router.get('/', getAllHomeServices);

// POST /api/home-services - Create new service
router.post('/', createHomeService);

// PUT /api/home-services/:id - Update service
router.put('/:id', updateHomeService);

// DELETE /api/home-services/:id - Delete service
router.delete('/:id', deleteHomeService);

export default router; 