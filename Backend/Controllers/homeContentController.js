import HomeContent from '../models/HomeContent.js';
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

            const { title } = req.body;
            
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Title is required',
                    details: 'Please provide a title for the content'
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

            const homeContent = await HomeContent.create({
                title,
                image: imageUrl
            });

            res.status(201).json({
                success: true,
                message: 'Home content created successfully',
                data: homeContent
            });
        } catch (error) {
            console.error('Content creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating content',
                details: error.message
            });
        }
    });
};

// Update home content
export const updateHomeContent = async (req, res) => {
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
            const homeContent = await HomeContent.findById(req.params.id);
            
            if (!homeContent) {
                return res.status(404).json({
                    success: false,
                    message: 'Home content not found'
                });
            }

            const { title } = req.body;
            
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Title is required',
                    details: 'Please provide a title for the content'
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
                homeContent.image = imageUrl;
            }

            homeContent.title = title;
            await homeContent.save();

            res.status(200).json({
                success: true,
                message: 'Home content updated successfully',
                data: homeContent
            });
        } catch (error) {
            console.error('Content update error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating content',
                details: error.message
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

        await homeContent.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Home content deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting home content',
            error: error.message
        });
    }
}; 