import HomeService from '../models/HomeService.js';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary.js';
import mongoose from 'mongoose';

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

// Helper function to check MongoDB connection
const checkDbConnection = () => {
    const state = mongoose.connection.readyState;
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
        
        const homeServices = await HomeService.find().sort({ createdAt: -1 });
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
            console.log('Creating new home service...');
            console.log('Request body:', {
                title: req.body.title,
                description: req.body.description,
                hasFile: !!req.file
            });

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

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image'
                });
            }

            // Upload to Cloudinary
            let imageUrl;
            try {
                imageUrl = await uploadToCloudinary(req.file.buffer);
                console.log('Image uploaded successfully:', imageUrl);
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading image to cloud storage',
                    error: cloudinaryError.message
                });
            }

            const service = await HomeService.create({
                title: title.trim(),
                description: description.trim(),
                image: imageUrl
            });

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
    });
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