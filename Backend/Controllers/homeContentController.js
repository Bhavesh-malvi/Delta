import HomeContent from '../models/HomeContent.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/content';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
}).single('image');

// Get all home content items
export const getAllHomeContent = async (req, res) => {
    try {
        const homeContents = await HomeContent.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: homeContents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching home content',
            error: error.message
        });
    }
};

// Get single home content item
export const getHomeContent = async (req, res) => {
    try {
        const homeContent = await HomeContent.findById(req.params.id);
        if (!homeContent) {
            return res.status(404).json({
                success: false,
                message: 'Home content not found'
            });
        }
        res.status(200).json({
            success: true,
            data: homeContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching home content',
            error: error.message
        });
    }
};

// Create new home content
export const createHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image'
                });
            }

            const { title } = req.body;
            
            if (!title) {
                // Delete uploaded file if validation fails
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: 'Title is required'
                });
            }

            const homeContent = await HomeContent.create({
                title,
                image: req.file.filename
            });

            res.status(201).json({
                success: true,
                message: 'Home content created successfully',
                data: homeContent
            });
        } catch (error) {
            // Delete uploaded file if content creation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });
};

// Update home content
export const updateHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        try {
            const homeContent = await HomeContent.findById(req.params.id);
            
            if (!homeContent) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: 'Home content not found'
                });
            }

            const { title } = req.body;
            
            if (!title) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Title is required'
                });
            }

            // If new image is uploaded, delete old image
            if (req.file) {
                const oldImagePath = path.join('uploads/content', homeContent.image);
                if (homeContent.image && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                homeContent.image = req.file.filename;
            }

            homeContent.title = title;
            await homeContent.save();

            res.status(200).json({
                success: true,
                message: 'Home content updated successfully',
                data: homeContent
            });
        } catch (error) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });
};

// Delete home content
export const deleteHomeContent = async (req, res) => {
    try {
        const homeContent = await HomeContent.findById(req.params.id);
        
        if (!homeContent) {
            return res.status(404).json({
                success: false,
                message: 'Home content not found'
            });
        }

        // Delete image file
        if (homeContent.image && fs.existsSync(homeContent.image)) {
            fs.unlinkSync(homeContent.image);
        }

        await homeContent.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Home content deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 