import HomeContent from '../models/HomeContent.js';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary.js';
import debug from 'debug';

const log = debug('app:homeContentController');

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
        log('Fetching all content');
        const homeContents = await HomeContent.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: homeContents
        });
    } catch (error) {
        log('Error in getAllHomeContent:', error);
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
        log('Fetching single content');
        const homeContent = await HomeContent.findById(req.params.id);
        if (!homeContent) {
            log('Content not found');
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
        log('Error in getHomeContent:', error);
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
            log('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                details: err.message
            });
        } else if (err) {
            log('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file',
                details: 'There was a problem processing your upload'
            });
        }

        try {
            log('Processing upload request');
            
            if (!req.file) {
                log('No file provided');
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image',
                    details: 'Image file is required'
                });
            }

            const { title } = req.body;
            
            if (!title) {
                log('No title provided');
                return res.status(400).json({
                    success: false,
                    message: 'Title is required',
                    details: 'Please provide a title for the content'
                });
            }

            log('Uploading to Cloudinary');
            // Upload image to Cloudinary
            const imageUrl = await uploadToCloudinary(req.file);
            if (!imageUrl) {
                log('Cloudinary upload failed');
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image to cloud storage',
                    details: 'Please try again'
                });
            }
            log('Cloudinary upload successful:', imageUrl);

            // Create content in database
            log('Creating content in database');
            const homeContent = await HomeContent.create({
                title,
                image: imageUrl
            });
            log('Content created successfully');

            res.status(201).json({
                success: true,
                message: 'Home content created successfully',
                data: homeContent
            });
        } catch (error) {
            log('Error in createHomeContent:', error);
            console.error('Content creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating content',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });
};

// Update home content
export const updateHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            log('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                details: err.message
            });
        } else if (err) {
            log('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file',
                details: 'There was a problem processing your upload'
            });
        }

        try {
            log('Processing update request');
            const homeContent = await HomeContent.findById(req.params.id);
            
            if (!homeContent) {
                log('Content not found');
                return res.status(404).json({
                    success: false,
                    message: 'Home content not found'
                });
            }

            const { title } = req.body;
            
            if (!title) {
                log('No title provided');
                return res.status(400).json({
                    success: false,
                    message: 'Title is required',
                    details: 'Please provide a title for the content'
                });
            }

            // If new image is uploaded, update the image
            if (req.file) {
                log('Uploading new image to Cloudinary');
                const imageUrl = await uploadToCloudinary(req.file);
                if (!imageUrl) {
                    log('Cloudinary upload failed');
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image to cloud storage',
                        details: 'Please try again'
                    });
                }
                log('Cloudinary upload successful:', imageUrl);
                homeContent.image = imageUrl;
            }

            homeContent.title = title;
            await homeContent.save();
            log('Content updated successfully');

            res.status(200).json({
                success: true,
                message: 'Home content updated successfully',
                data: homeContent
            });
        } catch (error) {
            log('Error in updateHomeContent:', error);
            console.error('Content update error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating content',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });
};

// Delete home content
export const deleteHomeContent = async (req, res) => {
    try {
        log('Processing delete request');
        const homeContent = await HomeContent.findById(req.params.id);
        
        if (!homeContent) {
            log('Content not found');
            return res.status(404).json({
                success: false,
                message: 'Home content not found'
            });
        }

        await homeContent.deleteOne();
        log('Content deleted successfully');

        res.status(200).json({
            success: true,
            message: 'Home content deleted successfully'
        });
    } catch (error) {
        log('Error in deleteHomeContent:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting home content',
            error: error.message
        });
    }
}; 