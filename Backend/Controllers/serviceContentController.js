import ServiceContent from '../models/ServiceContent.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for local file storage
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
}).single('image');

// Get all service contents
export const getAllServiceContents = async (req, res) => {
    try {
        const contents = await ServiceContent.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single content
export const getServiceContent = async (req, res) => {
    try {
        const content = await ServiceContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Service content not found' });
        }
        res.status(200).json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new content
export const createServiceContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        const { title, description } = req.body;
        const points = Object.keys(req.body)
            .filter(key => key.startsWith('points['))
            .sort()
            .map(key => req.body[key])
            .filter(point => point.trim() !== '');

        if (!req.file || !title || !description || points.length < 4) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: !req.file ? 'Image is required' :
                         !title ? 'Title is required' :
                         !description ? 'Description is required' :
                         'At least 4 non-empty points are required'
            });
        }

        try {
            const newContent = await ServiceContent.create({
                title,
                description,
                image: req.file.filename,
                points
            });
            res.status(201).json({ success: true, data: newContent });
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            res.status(500).json({ success: false, message: error.message });
        }
    });
};

// Update content
export const updateServiceContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        try {
            const content = await ServiceContent.findById(req.params.id);
            if (!content) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(404).json({ success: false, message: 'Service content not found' });
            }

            const { title, description } = req.body;
            const points = Object.keys(req.body)
                .filter(key => key.startsWith('points['))
                .sort()
                .map(key => req.body[key])
                .filter(point => point.trim() !== '');

            if (!title || !description || points.length < 4) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ 
                    success: false, 
                    message: !title ? 'Title is required' :
                             !description ? 'Description is required' :
                             'At least 4 non-empty points are required'
                });
            }

            if (req.file) {
                const oldImagePath = path.join('uploads/services', content.image);
                if (content.image && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                content.image = req.file.filename;
            }

            content.title = title;
            content.description = description;
            content.points = points;
            await content.save();

            res.status(200).json({ success: true, data: content });
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            res.status(500).json({ success: false, message: error.message });
        }
    });
};

// Delete content
export const deleteServiceContent = async (req, res) => {
    try {
        const content = await ServiceContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Service content not found' });
        }

        const imagePath = path.join('uploads/services', content.image);
        if (content.image && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await content.deleteOne();

        res.status(200).json({ success: true, message: 'Service content deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
