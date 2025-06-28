import HomeService from '../models/HomeService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { uploadToCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        console.log('🔍 Checking file:', file.originalname, file.mimetype);
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            console.log('✅ File accepted');
            cb(null, true);
        } else {
            console.log('❌ File rejected');
            cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
        }
    }
});

// Helper function to check MongoDB connection
const checkDbConnection = () => {
    const state = mongoose.connection.readyState;
    console.log('MongoDB connection state:', state);
    if (state !== 1) {
        throw new Error('Database connection is not ready. Current state: ' + state);
    }
};

// Helper function to validate service data
const validateServiceData = (title, description) => {
    const errors = [];
    
    if (!title || title.trim().length === 0) {
        errors.push('Title is required');
    }
    if (!description || description.trim().length === 0) {
        errors.push('Description is required');
    }
    if (title && title.trim().length > 100) {
        errors.push('Title must be less than 100 characters');
    }
    if (description && description.trim().length > 500) {
        errors.push('Description must be less than 500 characters');
    }
    
    return errors;
};

// Get all home services
export const getAllHomeServices = async (req, res) => {
    try {
        checkDbConnection();
        console.log('Fetching all home services...');
        
        const homeServices = await HomeService.find().sort({ position: 1, createdAt: -1 });
        console.log(`Found ${homeServices.length} home services`);
        
        res.status(200).json({
            success: true,
            count: homeServices.length,
            data: homeServices
        });
    } catch (error) {
        console.error('Error in getAllHomeServices:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error fetching home services',
            error: error.message,
            dbState: mongoose.connection.readyState
        });
    }
};

// Get single home service
export const getHomeService = async (req, res) => {
    try {
        checkDbConnection();
        console.log(`Fetching home service with ID: ${req.params.id}`);
        
        const homeService = await HomeService.findById(req.params.id);
        if (!homeService) {
            console.log(`No service found with ID: ${req.params.id}`);
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
        console.error('Error in getHomeService:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error fetching home service',
            error: error.message,
            dbState: mongoose.connection.readyState
        });
    }
};

// Create new home service
export const createHomeService = async (req, res) => {
    console.log('🔥 createHomeService function called!');
    console.log('🔥 req.file:', req.file);
    console.log('🔥 req.body:', req.body);
    
    try {
        checkDbConnection();
        console.log('Creating new home service...');

        const { title, description, position } = req.body;
        
        // Validate service data
        const validationErrors = validateServiceData(title, description);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        // Upload image to Cloudinary
        const imageUrl = await uploadToCloudinary(req.file.buffer);
        console.log('Image uploaded to Cloudinary:', imageUrl);

        // Create service data object
        const serviceData = {
            title: title.trim(),
            description: description.trim(),
            image: imageUrl,
            position: position ? parseInt(position) : 0
        };

        const service = await HomeService.create(serviceData);

        console.log('Service created successfully:', service._id);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });
    } catch (error) {
        console.error('Error in createHomeService:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error creating service',
            error: error.message,
            dbState: mongoose.connection.readyState
        });
    }
};

// Update home service
export const updateHomeService = async (req, res) => {
    try {
        checkDbConnection();
        console.log(`Updating home service with ID: ${req.params.id}`);
        
        const { title, description, position } = req.body;
        
        // Validate service data
        const validationErrors = validateServiceData(title, description);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        let updateData = {
            title: title.trim(),
            description: description.trim(),
            position: position ? parseInt(position) : 0
        };

        // If a new image is uploaded, update it
        if (req.file) {
            const imageUrl = await uploadToCloudinary(req.file.buffer);
            console.log('New image uploaded to Cloudinary:', imageUrl);
            updateData.image = imageUrl;
        }

        const service = await HomeService.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Home service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });
    } catch (error) {
        console.error('Error in updateHomeService:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message,
            dbState: mongoose.connection.readyState
        });
    }
};

// Delete home service
export const deleteHomeService = async (req, res) => {
    try {
        checkDbConnection();
        console.log(`Deleting home service with ID: ${req.params.id}`);
        
        const service = await HomeService.findByIdAndDelete(req.params.id);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Home service not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteHomeService:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error: error.message,
            dbState: mongoose.connection.readyState
        });
    }
};

export { upload }; 