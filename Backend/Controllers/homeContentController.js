import HomeContent from '../models/HomeContent.js';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary.js';

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

// ✅ GET all content
export const getAllHomeContent = async (req, res) => {
    try {
        const data = await HomeContent.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch content', error: error.message });
    }
};

// ✅ GET one content
export const getHomeContent = async (req, res) => {
    try {
        const item = await HomeContent.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Content not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch content', error: error.message });
    }
};

// ✅ CREATE content
export const createHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { title } = req.body;
        if (!title || !req.file) {
            return res.status(400).json({ success: false, message: 'Title and image are required' });
        }

        try {
            // Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(req.file.buffer);
            
            const created = await HomeContent.create({ 
                title, 
                image: imageUrl 
            });
            
            res.status(201).json({ 
                success: true, 
                message: 'Content created', 
                data: created 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error saving content', 
                error: error.message 
            });
        }
    });
};

// ✅ UPDATE content
export const updateHomeContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        try {
            const content = await HomeContent.findById(req.params.id);
            if (!content) {
                return res.status(404).json({ success: false, message: 'Content not found' });
            }

            content.title = title;

            if (req.file) {
                // Upload new image to Cloudinary
                const imageUrl = await uploadToCloudinary(req.file.buffer);
                content.image = imageUrl;
            }

            await content.save();
            res.status(200).json({ 
                success: true, 
                message: 'Content updated', 
                data: content 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error updating content', 
                error: error.message 
            });
        }
    });
};

// ✅ DELETE content
export const deleteHomeContent = async (req, res) => {
    try {
        const content = await HomeContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ 
                success: false, 
                message: 'Content not found' 
            });
        }

        await content.deleteOne();
        
        res.status(200).json({ 
            success: true, 
            message: 'Content deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting content', 
            error: error.message 
        });
    }
};
