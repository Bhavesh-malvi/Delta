import HomeService from '../models/HomeService.js';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype) {
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
                return res.status(400).json({
                    success: false,
                    message: 'Title and description are required'
                });
            }

            // Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(req.file.buffer);

            const service = await HomeService.create({
                title,
                description,
                image: imageUrl
            });

            res.status(201).json({
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