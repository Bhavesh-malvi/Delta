import HomeContent from '../models/HomeContent.js';
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
const checkDbConnection = async () => {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(`MongoDB connection state: ${states[state]}`);
    
    if (state === 2) { // connecting
        // Wait for connection to establish
        await new Promise((resolve) => {
            const checkConnection = setInterval(() => {
                const currentState = mongoose.connection.readyState;
                if (currentState === 1) {
                    clearInterval(checkConnection);
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkConnection);
                resolve();
            }, 5000);
        });
    }
    
    if (mongoose.connection.readyState !== 1) {
        throw new Error(`Database connection is not ready. Current state: ${states[state]}`);
    }
};

// Helper function to handle errors
const handleError = (error, res, operation) => {
    console.error(`Error in ${operation}:`, error);
    console.error('Stack trace:', error.stack);
    console.error('MongoDB connection state:', mongoose.connection.readyState);
    
    // Check for specific error types
    if (error.name === 'MongoServerSelectionError' || error.message.includes('Database connection is not ready')) {
        return res.status(503).json({
            success: false,
            message: 'Database connection error',
            error: 'Service temporarily unavailable. Please try again later.',
            dbState: mongoose.connection.readyState
        });
    }
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: Object.values(error.errors).map(err => err.message).join(', '),
            dbState: mongoose.connection.readyState
        });
    }
    
    return res.status(500).json({
        success: false,
        message: `Failed to ${operation}`,
        error: error.message,
        dbState: mongoose.connection.readyState
    });
};

// ✅ GET all content
export const getAllHomeContent = async (req, res) => {
    try {
        console.log('Attempting to fetch all home content...');
        await checkDbConnection();
        
        const data = await HomeContent.find().sort({ createdAt: -1 });
        console.log(`Successfully found ${data.length} home content items`);
        
        res.status(200).json({ 
            success: true, 
            count: data.length,
            data 
        });
    } catch (error) {
        handleError(error, res, 'fetch content');
    }
};

// ✅ GET one content
export const getHomeContent = async (req, res) => {
    try {
        checkDbConnection();
        console.log(`Fetching home content with ID: ${req.params.id}`);
        
        const item = await HomeContent.findById(req.params.id);
        if (!item) {
            console.log(`No content found with ID: ${req.params.id}`);
            return res.status(404).json({ success: false, message: 'Content not found' });
        }
        
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        handleError(error, res, 'fetch content');
    }
};

// ✅ CREATE content
export const createHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            checkDbConnection();
            console.log('Creating new home content...');

        const { title } = req.body;
        if (!title || !req.file) {
            return res.status(400).json({ success: false, message: 'Title and image are required' });
        }

            // Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(req.file.buffer);
            console.log('Image uploaded to Cloudinary:', imageUrl);
            
            const created = await HomeContent.create({ 
                title, 
                image: imageUrl 
            });
            
            console.log('Home content created successfully:', created._id);
            res.status(201).json({ 
                success: true, 
                message: 'Content created', 
                data: created 
            });
        } catch (error) {
            handleError(error, res, 'save content');
        }
    });
};

// ✅ UPDATE content
export const updateHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            checkDbConnection();
            console.log(`Updating home content with ID: ${req.params.id}`);

        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

            const content = await HomeContent.findById(req.params.id);
            if (!content) {
                console.log(`No content found with ID: ${req.params.id}`);
                return res.status(404).json({ success: false, message: 'Content not found' });
            }

            content.title = title;

            if (req.file) {
                // Upload new image to Cloudinary
                const imageUrl = await uploadToCloudinary(req.file.buffer);
                console.log('New image uploaded to Cloudinary:', imageUrl);
                content.image = imageUrl;
            }

            await content.save();
            console.log('Home content updated successfully');
            
            res.status(200).json({ 
                success: true, 
                message: 'Content updated', 
                data: content 
            });
        } catch (error) {
            handleError(error, res, 'update content');
        }
    });
};

// ✅ DELETE content
export const deleteHomeContent = async (req, res) => {
    try {
        checkDbConnection();
        console.log(`Deleting home content with ID: ${req.params.id}`);

        const content = await HomeContent.findById(req.params.id);
        if (!content) {
            console.log(`No content found with ID: ${req.params.id}`);
            return res.status(404).json({ 
                success: false, 
                message: 'Content not found' 
            });
        }

        await content.deleteOne();
        console.log('Home content deleted successfully');
        
        res.status(200).json({ 
            success: true, 
            message: 'Content deleted successfully' 
        });
    } catch (error) {
        handleError(error, res, 'delete content');
    }
};
