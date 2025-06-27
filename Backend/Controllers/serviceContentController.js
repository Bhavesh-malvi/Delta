import ServiceContent from '../models/ServiceContent.js';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
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

// Get all service contents
export const getAllServiceContents = async (req, res) => {
    try {
        const serviceContents = await ServiceContent.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: serviceContents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching service contents',
            error: error.message
        });
    }
};

// Get single service content
export const getServiceContent = async (req, res) => {
    try {
        const serviceContent = await ServiceContent.findById(req.params.id);
        if (!serviceContent) {
            return res.status(404).json({
                success: false,
                message: 'Service content not found'
            });
        }
        res.status(200).json({
            success: true,
            data: serviceContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching service content',
            error: error.message
        });
    }
};

// Create new service content
export const createServiceContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                details: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file',
                details: 'There was a problem processing your upload'
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image',
                    details: 'Image file is required'
                });
            }

            const { title, description } = req.body;
            
            if (!title || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required',
                    details: 'Please provide title and description'
                });
            }

            // Upload image to Cloudinary
            const imageUrl = await uploadToCloudinary(req.file);
            if (!imageUrl) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image to cloud storage',
                    details: 'Please try again'
                });
            }

            const serviceContent = await ServiceContent.create({
                title,
                description,
                image: imageUrl
            });

            res.status(201).json({
                success: true,
                message: 'Service content created successfully',
                data: serviceContent
            });
        } catch (error) {
            console.error('Service content creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating service content',
                details: error.message
            });
        }
    });
};

// Update service content
export const updateServiceContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                details: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file',
                details: 'There was a problem processing your upload'
            });
        }

        try {
            const serviceContent = await ServiceContent.findById(req.params.id);
            
            if (!serviceContent) {
                return res.status(404).json({
                    success: false,
                    message: 'Service content not found'
                });
            }

            const { title, description } = req.body;
            
            if (!title || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required',
                    details: 'Please provide title and description'
                });
            }

            // If new image is uploaded, update the image
            if (req.file) {
                const imageUrl = await uploadToCloudinary(req.file);
                if (!imageUrl) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image to cloud storage',
                        details: 'Please try again'
                    });
                }
                serviceContent.image = imageUrl;
            }

            serviceContent.title = title;
            serviceContent.description = description;
            await serviceContent.save();

            res.status(200).json({
                success: true,
                message: 'Service content updated successfully',
                data: serviceContent
            });
        } catch (error) {
            console.error('Service content update error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating service content',
                details: error.message
            });
        }
    });
};

// Delete service content
export const deleteServiceContent = async (req, res) => {
    try {
        const serviceContent = await ServiceContent.findById(req.params.id);
        
        if (!serviceContent) {
            return res.status(404).json({
                success: false,
                message: 'Service content not found'
            });
        }

        await serviceContent.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Service content deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting service content',
            error: error.message
        });
    }
}; 