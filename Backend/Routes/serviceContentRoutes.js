import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    getAllServiceContents,
    getServiceContent,
    createServiceContent,
    updateServiceContent,
    deleteServiceContent
} from '../Controllers/serviceContentController.js';

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/services';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) cb(null, true);
        else cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
    }
});

router.get('/', getAllServiceContents);
router.get('/:id', getServiceContent);
router.post('/', upload.single('image'), createServiceContent);
router.put('/:id', upload.single('image'), updateServiceContent);
router.delete('/:id', deleteServiceContent);

export default router; 