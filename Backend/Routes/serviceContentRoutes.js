import express from 'express';
import multer from 'multer';
import {
    createServiceContent,
    getAllServiceContents,
    getServiceContent,
    updateServiceContent,
    deleteServiceContent
} from '../Controllers/serviceContentController.js';

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Routes
router.post('/', upload.single('image'), createServiceContent);
router.get('/', getAllServiceContents);
router.get('/:id', getServiceContent);
router.put('/:id', upload.single('image'), updateServiceContent);
router.delete('/:id', deleteServiceContent);

export default router; 