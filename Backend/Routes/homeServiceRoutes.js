import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
    getAllHomeServices,
    createHomeService,
    updateHomeService,
    deleteHomeService
} from '../Controllers/homeServiceController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/services');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for home service image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const finalName = uniqueName + path.extname(file.originalname);
        console.log('📁 Generated filename:', finalName);
        cb(null, finalName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        console.log('🔍 Checking file:', file.originalname, file.mimetype);
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            console.log('✅ File accepted');
            cb(null, true);
        } else {
            console.log('❌ File rejected');
            cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
        }
    }
}).single('image');

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: 'File upload error',
            error: err.message
        });
    }
    next(err);
};

// GET /api/homeService - Get all services
router.get('/', getAllHomeServices);

// POST /api/homeService - Create new service
router.post('/', (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: 'File upload failed',
                error: err.message
            });
        }
        createHomeService(req, res, next);
    });
});

// PUT /api/homeService/:id - Update service
router.put('/:id', (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: 'File upload failed',
                error: err.message
            });
        }
        updateHomeService(req, res, next);
    });
});

// DELETE /api/homeService/:id - Delete service
router.delete('/:id', deleteHomeService);

// Error handling middleware
router.use(handleMulterError);

export default router; 