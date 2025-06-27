import Career from '../models/Career.js';
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

            const career = await Career.create({
                title,
                description,
                image: imageUrl
            });

            res.status(201).json({
                success: true,
                message: 'Career created successfully',
                data: career
            });
        } catch (error) {
            console.error('Career creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating career',
                details: error.message
            });
        }
    });
};

// Update career
export const updateCareer = async (req, res) => {
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
            const career = await Career.findById(req.params.id);
            
            if (!career) {
                return res.status(404).json({
                    success: false,
                    message: 'Career not found'
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
                career.image = imageUrl;
            }

            career.title = title;
            career.description = description;
            await career.save();

            res.status(200).json({
                success: true,
                message: 'Career updated successfully',
                data: career
            });
        } catch (error) {
            console.error('Career update error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating career',
                details: error.message
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