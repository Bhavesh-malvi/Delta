import Career from '../models/Career.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer setup: Save images to local 'uploads/' folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
        }
    }
}).single('image');

// Get all careers
export const getAllCareers = async (req, res) => {
    try {
        const careers = await Career.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: careers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching careers', error: error.message });
    }
};

// Get single career
export const getCareer = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        if (!career) return res.status(404).json({ success: false, message: 'Career not found' });
        res.status(200).json({ success: true, data: career });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching career', error: error.message });
    }
};

// Create new career
export const createCareer = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        try {
            const { title, description } = req.body;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image',
                    details: 'Image file is required'
                });
            }

            if (!title || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const imagePath = `/uploads/${req.file.filename}`;

            const career = await Career.create({
                title,
                description,
                image: imagePath
            });

            res.status(201).json({
                success: true,
                message: 'Career created successfully',
                data: career
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error creating career', details: error.message });
        }
    });
};

// Update career
export const updateCareer = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        try {
            const { title, description } = req.body;
            const career = await Career.findById(req.params.id);

            if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

            if (!title || !description) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }

            // If image uploaded, update path
            if (req.file) {
                career.image = `/uploads/${req.file.filename}`;
            }

            career.title = title;
            career.description = description;
            await career.save();

            res.status(200).json({
                success: true,
                message: 'Career updated successfully',
                data: career
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating career', details: error.message });
        }
    });
};

// Delete career
export const deleteCareer = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

        await career.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Career deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting career', error: error.message });
    }
};
