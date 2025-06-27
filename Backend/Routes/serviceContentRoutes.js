import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    getAllServiceContents,
    getServiceContent,
    createServiceContent,
    updateServiceContent,
    deleteServiceContent
} from '../Controllers/serviceContentController.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/services/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all service contents and Create new service content
router.route('/')
    .get(getAllServiceContents)
    .post(upload.single('image'), createServiceContent);

// Get single service content, Update and Delete service content
router.route('/:id')
    .get(getServiceContent)
    .put(upload.single('image'), updateServiceContent)
    .delete(deleteServiceContent);

export default router; 