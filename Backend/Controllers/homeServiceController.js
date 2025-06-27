import HomeService from '../models/HomeService.js';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
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
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        try {
            console.log('Request body:', req.body);
            console.log('Request file:', req.file);

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image'
                });
            }

            const { title, description } = req.body;
            
            if (!title || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and description are required'
                });
            }

            // Upload to Cloudinary
            let imageUrl;
            try {
                imageUrl = await uploadToCloudinary(req.file.buffer);
                console.log('Cloudinary upload successful:', imageUrl);
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading image to cloud storage',
                    error: cloudinaryError.message
                });
            }

            const service = await HomeService.create({
                title,
                description,
                image: imageUrl
            });

            console.log('Service created successfully:', service);

            res.status(201).json({
                success: true,
                data: service
            });
        } catch (error) {
            console.error('Service creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating service',
                error: error.message
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
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            const { title, description } = req.body;
            
            if (!title || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and description are required'
                });
            }

            // If new image is uploaded, update it
            if (req.file) {
                const imageUrl = await uploadToCloudinary(req.file.buffer);
                service.image = imageUrl;
            }

            service.title = title;
            service.description = description;
            await service.save();

            res.status(200).json({
                success: true,
                data: service
            });
        } catch (error) {
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
        const service = await HomeService.findById(req.params.id);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        await service.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 