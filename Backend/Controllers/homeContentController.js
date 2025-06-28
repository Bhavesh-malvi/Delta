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
const checkDbConnection = () => {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
        throw new Error('Database connection is not ready. Current state: ' + state);
    }
};

// ✅ GET all content
export const getAllHomeContent = async (req, res) => {
    try {
        checkDbConnection();
        console.log('Fetching all home content...');
        
        const data = await HomeContent.find().sort({ createdAt: -1 });
        console.log(`Found ${data.length} home content items`);
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error in getAllHomeContent:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch content', 
            error: error.message,
            dbState: mongoose.connection.readyState
        });
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
        console.error('Error in getHomeContent:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch content', 
            error: error.message,
            dbState: mongoose.connection.readyState
        });
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
            console.error('Error in createHomeContent:', error);
            console.error('Stack trace:', error.stack);
            
            res.status(500).json({ 
                success: false, 
                message: 'Error saving content', 
                error: error.message,
                dbState: mongoose.connection.readyState
            });
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
            console.error('Error in updateHomeContent:', error);
            console.error('Stack trace:', error.stack);
            
            res.status(500).json({ 
                success: false, 
                message: 'Error updating content', 
                error: error.message,
                dbState: mongoose.connection.readyState
            });
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
        console.error('Error in deleteHomeContent:', error);
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting content', 
            error: error.message,
            dbState: mongoose.connection.readyState
        });
    }
};
