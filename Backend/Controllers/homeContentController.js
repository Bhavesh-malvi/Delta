import HomeContent from '../models/HomeContent.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import debug from 'debug';

const log = debug('app:homeContentController');

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer Disk Storage config (images saved to /uploads/content)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/content/');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowed = /jpeg|jpg|png|gif/;
        const extname = allowed.test(file.originalname.toLowerCase());
        const mimetype = allowed.test(file.mimetype);
        if (extname && mimetype) cb(null, true);
        else cb(new Error('Only image files are allowed!'));
    }
}).single('image');

// ✅ GET all content
export const getAllHomeContent = async (req, res) => {
    try {
        const data = await HomeContent.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch content', error: error.message });
    }
};

// ✅ GET one content
export const getHomeContent = async (req, res) => {
    try {
        const item = await HomeContent.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Content not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch content', error: error.message });
    }
};

// ✅ CREATE content
export const createHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { title } = req.body;
        if (!title || !req.file) {
            return res.status(400).json({ success: false, message: 'Title and image are required' });
        }

        try {
            const imagePath = `/uploads/content/${req.file.filename}`;
            const created = await HomeContent.create({ title, image: imagePath });
            res.status(201).json({ success: true, message: 'Content created', data: created });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error saving content', error: error.message });
        }
    });
};

// ✅ UPDATE content
export const updateHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        try {
            const content = await HomeContent.findById(req.params.id);
            if (!content) {
                return res.status(404).json({ success: false, message: 'Content not found' });
            }

            content.title = title;

            if (req.file) {
                content.image = `/uploads/content/${req.file.filename}`;
            }

            await content.save();
            res.status(200).json({ success: true, message: 'Content updated', data: content });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating content', error: error.message });
        }
    });
};

// ✅ DELETE content
export const deleteHomeContent = async (req, res) => {
    try {
        const content = await HomeContent.findById(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

        // Optionally delete image file from uploads folder
        const imagePath = path.join(__dirname, '..', content.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await content.deleteOne();
        res.status(200).json({ success: true, message: 'Content deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting content', error: error.message });
    }
};
