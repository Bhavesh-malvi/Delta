import HomeService from '../models/HomeService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/services');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for home service image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const finalName = uniqueName + path.extname(file.originalname);
        console.log('📁 Generated filename:', finalName);
        cb(null, finalName);
    }
});

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

        // Create service data object
        const serviceData = {
            title: title.trim(),
            description: description.trim(),
            image: `services/${req.file.filename}`,
            position: position ? parseInt(position) : 0
        };

        console.log('🖼️ Image file received:', req.file);
        console.log('📁 Image filename:', req.file.filename);
        console.log('✅ Image path added to serviceData:', serviceData.image);

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

// Update service
export const updateHomeService = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        try {
            checkDbConnection();
            console.log(`Updating home service with ID: ${req.params.id}`);
            
            const service = await HomeService.findById(req.params.id);
            if (!service) {
                console.log(`No service found with ID: ${req.params.id}`);
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            const { title, description } = req.body;
            
            // Validate service data
            const validationErrors = validateServiceData(title, description);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            // If new image is uploaded, update it
            if (req.file) {
                try {
                    const imageUrl = await uploadToCloudinary(req.file.buffer);
                    console.log('New image uploaded successfully:', imageUrl);
                    service.image = imageUrl;
                } catch (cloudinaryError) {
                    console.error('Cloudinary upload error:', cloudinaryError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error uploading new image',
                        error: cloudinaryError.message
                    });
                }
            }

            service.title = title.trim();
            service.description = description.trim();
            await service.save();

            console.log('Service updated successfully');

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
    });
};

// Delete home service
export const deleteHomeService = async (req, res) => {
    try {
        checkDbConnection();
        console.log(`Deleting home service with ID: ${req.params.id}`);
        
        const service = await HomeService.findById(req.params.id);
        if (!service) {
            console.log(`No service found with ID: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        await service.deleteOne();
        console.log('Service deleted successfully');

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