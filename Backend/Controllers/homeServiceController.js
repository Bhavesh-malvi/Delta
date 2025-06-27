import HomeService from '../models/HomeService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/services';
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

// Get all home services
export const getAllHomeServices = async (req, res) => {
    try {
        const homeServices = await HomeService.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: homeServices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching home services',
            error: error.message
        });
    }
};

// Get single home service
export const getHomeService = async (req, res) => {
    try {
        const homeService = await HomeService.findById(req.params.id);
        if (!homeService) {
            return res.status(404).json({
                success: false,
                message: 'Home service not found'
            });
        }
        res.status(200).json({
            success: true,
            data: homeService
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching home service',
            error: error.message
        });
    }
};

// Create new home service
export const createHomeService = async (req, res) => {
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

            const { title, description } = req.body;
            
            if (!title || !description) {
                // Delete uploaded file if validation fails
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: 'Title and description are required'
                });
            }

            const service = await HomeService.create({
                title,
                description,
                image: req.file.filename
            });

            res.status(201).json({
                success: true,
                data: service
            });
        } catch (error) {
            // Delete uploaded file if service creation fails
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

// Update service
export const updateHomeService = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        try {
            const service = await HomeService.findById(req.params.id);
            
            if (!service) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            const { title, description } = req.body;
            
            if (!title || !description) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Title and description are required'
                });
            }

            // If new image is uploaded, delete old image
            if (req.file) {
                const oldImagePath = path.join('uploads/services', service.image);
                if (service.image && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                service.image = req.file.filename;
            }

            service.title = title;
            service.description = description;
            await service.save();

            res.status(200).json({
                success: true,
                data: service
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

// Delete home service
export const deleteHomeService = async (req, res) => {
    try {
        const homeService = await HomeService.findById(req.params.id);
        
        if (!homeService) {
            return res.status(404).json({
                success: false,
                message: 'Home service not found'
            });
        }

        // Delete image file
        if (homeService.image) {
            const imagePath = path.join('uploads/services', homeService.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await homeService.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Home service deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting home service',
            error: error.message
        });
    }
}; 