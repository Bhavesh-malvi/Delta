import express from 'express';
import {
    getAllHomeContent,
    createHomeContent,
    updateHomeContent,
    deleteHomeContent
} from '../Controllers/homeContentController.js';

const router = express.Router();

// GET /api/home-content - Get all content
router.get('/', getAllHomeContent);

// POST /api/home-content - Create new content
router.post('/', createHomeContent);

// PUT /api/home-content/:id - Update content
router.put('/:id', updateHomeContent);

// DELETE /api/home-content/:id - Delete content
router.delete('/:id', deleteHomeContent);

export default router; 