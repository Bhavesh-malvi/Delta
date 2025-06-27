import ServiceContent from '../models/ServiceContent.js';
import path from 'path';
import fs from 'fs';

// Create new content
export const createServiceContent = async (req, res) => {
    try {
        const { title, description, points: pointsString } = req.body;
        let points = [];
        
        try {
            points = JSON.parse(pointsString);
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Invalid points data' });
        }

        if (!req.file || !title || !description || !points || points.length < 4) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: !req.file ? 'Image is required' :
                         !title ? 'Title is required' :
                         !description ? 'Description is required' :
                         'At least 4 non-empty points are required'
            });
        }

        const newContent = await ServiceContent.create({
            title,
            description,
            image: req.file.filename,
            points
        });
        res.status(201).json({ success: true, data: newContent });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update content
export const updateServiceContent = async (req, res) => {
    try {
        const content = await ServiceContent.findById(req.params.id);
        if (!content) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Service content not found' });
        }

        const { title, description, points: pointsString } = req.body;
        let points = [];
        
        try {
            points = JSON.parse(pointsString);
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Invalid points data' });
        }

        if (!title || !description || !points || points.length < 4) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: !title ? 'Title is required' :
                         !description ? 'Description is required' :
                         'At least 4 non-empty points are required'
            });
        }

        if (req.file) {
            const oldImagePath = path.join('uploads/services', content.image);
            if (content.image && fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            content.image = req.file.filename;
        }

        content.title = title;
        content.description = description;
        content.points = points;
        await content.save();

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all service contents
export const getAllServiceContents = async (req, res) => {
    try {
        const contents = await ServiceContent.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single content
export const getServiceContent = async (req, res) => {
    try {
        const content = await ServiceContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Service content not found' });
        }
        res.status(200).json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete content
export const deleteServiceContent = async (req, res) => {
    try {
        const content = await ServiceContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Service content not found' });
        }

        const imagePath = path.join('uploads/services', content.image);
        if (content.image && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await content.deleteOne();

        res.status(200).json({ success: true, message: 'Service content deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
