import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    getAllCareers,
    getCareer,
    createCareer,
    updateCareer,
    deleteCareer
} from '../Controllers/careerController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for career image uploads using memory storage
const upload = multer({
    storage: multer.memoryStorage(),
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
});

// Get all careers and Create new career
router.route('/')
    .get(getAllCareers)
    .post(upload.single('image'), createCareer);

// Get single career, Update and Delete career
router.route('/:id')
    .get(getCareer)
    .put(upload.single('image'), updateCareer)
    .delete(deleteCareer);

export default router; 