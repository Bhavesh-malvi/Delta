import Career from '../models/Career.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/careers');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
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
}).single('image');

// Get all careers
export const getAllCareers = async (req, res) => {
    try {
        const careers = await Career.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: careers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching careers',
            error: error.message
        });
    }
};

// Get single career
export const getCareer = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        if (!career) {
            return res.status(404).json({
                success: false,
                message: 'Career not found'
            });
        }
        res.status(200).json({
            success: true,
            data: career
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching career',
            error: error.message
        });
    }
};

// Create new career
export const createCareer = async (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'Error uploading file',
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            const { title, description } = req.body;
            let points = req.body.points;

            // Basic validation
            if (!title || !description || !points) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide title, description, and points'
                });
            }

            // Parse points if it's sent as form data
            if (typeof points === 'string') {
                try {
                    points = JSON.parse(points);
                } catch (e) {
                    // If it's a single point as string
                    points = [points];
                }
            }

            // Handle points sent as form-data array
            if (typeof points === 'object' && !Array.isArray(points)) {
                points = Object.values(points);
            }

            // Filter out empty points
            const filteredPoints = points.filter(point => point && point.trim() !== '');

            if (filteredPoints.length < 4) {
                // If file was uploaded, delete it since we're not creating the career
                if (req.file) {
                    fs.unlink(req.file.path, () => {});
                }
                return res.status(400).json({
                    success: false,
                    message: 'Please provide at least 4 non-empty points'
                });
            }

            const career = await Career.create({
                title,
                description,
                points,
                image: req.file.filename
            });

            res.status(201).json({
                success: true,
                data: career
            });
        } catch (error) {
            // Delete uploaded file if career creation fails
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

// Update career
export const updateCareer = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        try {
            const career = await Career.findById(req.params.id);
            
            if (!career) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: 'Career not found'
                });
            }

            const { title, description, points } = req.body;
            
            if (!title || !description || !points) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            // If new image is uploaded, delete old image
            if (req.file) {
                const oldImagePath = path.join('uploads/careers', career.image);
                if (career.image && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                career.image = req.file.filename;
            }

            await career.save();

            res.status(200).json({
                success: true,
                message: 'Career updated successfully',
                data: career
            });
        } catch (error) {
            // If error occurs, delete uploaded file
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
            res.status(500).json({
                success: false,
                message: 'Error updating career',
                error: error.message
            });
        }
    });
};

// Delete career
export const deleteCareer = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);

        if (!career) {
            return res.status(404).json({
                success: false,
                message: 'Career not found'
            });
        }

        // Delete associated image if exists
        if (career.image) {
            const imagePath = path.join(__dirname, '..', career.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, () => {});
            }
        }

        await career.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Career deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting career',
            error: error.message
        });
    }
}; 