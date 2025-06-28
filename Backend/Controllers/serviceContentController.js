import ServiceContent from '../models/ServiceContent.js';
import path from 'path';
import fs from 'fs';

// Create new content
export const createServiceContent = async (req, res) => {
    try {
        const { title, description, points } = req.body;
        let parsedPoints = [];
        
        // Handle points data
        if (typeof points === 'string') {
            try {
                parsedPoints = JSON.parse(points);
            } catch (error) {
                console.error('Points parsing error:', error);
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid points data format. Expected JSON array of strings.',
                    error: error.message 
                });
            }
        } else if (Array.isArray(points)) {
            parsedPoints = points;
        } else {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Points must be either a JSON string or an array' 
            });
        }

        // Validate required fields
        if (!title?.trim()) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Title is required' 
            });
        }

        if (!description?.trim()) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Description is required' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Image is required' 
            });
        }

        if (!Array.isArray(parsedPoints) || parsedPoints.length < 4) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'At least 4 points are required' 
            });
        }

        // Filter out empty points and trim whitespace
        parsedPoints = parsedPoints
            .map(point => point?.trim())
            .filter(point => point && point.length > 0);

        if (parsedPoints.length < 4) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'At least 4 non-empty points are required' 
            });
        }

        const newContent = await ServiceContent.create({
            title: title.trim(),
            description: description.trim(),
            image: req.file.filename,
            points: parsedPoints
        });

        console.log('Created new service content:', {
            id: newContent._id,
            title: newContent.title,
            pointsCount: newContent.points.length
        });

        res.status(201).json({ 
            success: true, 
            message: 'Service content created successfully',
            data: newContent 
        });
    } catch (error) {
        console.error('Service content creation error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating service content',
            error: error.message 
        });
    }
};

// Update content
export const updateServiceContent = async (req, res) => {
    try {
        const content = await ServiceContent.findById(req.params.id);
        if (!content) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ 
                success: false, 
                message: 'Service content not found' 
            });
        }

        const { title, description, points } = req.body;
        let parsedPoints = [];
        
        // Handle points data
        if (typeof points === 'string') {
            try {
                parsedPoints = JSON.parse(points);
            } catch (error) {
                console.error('Points parsing error:', error);
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid points data format. Expected JSON array of strings.',
                    error: error.message 
                });
            }
        } else if (Array.isArray(points)) {
            parsedPoints = points;
        } else {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Points must be either a JSON string or an array' 
            });
        }

        // Validate required fields
        if (!title?.trim()) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Title is required' 
            });
        }

        if (!description?.trim()) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'Description is required' 
            });
        }

        // Filter out empty points and trim whitespace
        parsedPoints = parsedPoints
            .map(point => point?.trim())
            .filter(point => point && point.length > 0);

        if (parsedPoints.length < 4) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: 'At least 4 non-empty points are required' 
            });
        }

        // Update image if new one is uploaded
        if (req.file) {
            const oldImagePath = path.join('uploads/services', content.image);
            if (content.image && fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            content.image = req.file.filename;
        }

        content.title = title.trim();
        content.description = description.trim();
        content.points = parsedPoints;
        await content.save();

        console.log('Updated service content:', {
            id: content._id,
            title: content.title,
            pointsCount: content.points.length
        });

        res.status(200).json({ 
            success: true, 
            message: 'Service content updated successfully',
            data: content 
        });
    } catch (error) {
        console.error('Service content update error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating service content',
            error: error.message 
        });
    }
};

// Get all service contents
export const getAllServiceContents = async (req, res) => {
    try {
        const contents = await ServiceContent.find().sort({ createdAt: -1 });
        res.status(200).json({ 
            success: true, 
            count: contents.length,
            data: contents 
        });
    } catch (error) {
        console.error('Error fetching service contents:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching service contents',
            error: error.message 
        });
    }
};

// Get single content
export const getServiceContent = async (req, res) => {
    try {
        const content = await ServiceContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ 
                success: false, 
                message: 'Service content not found' 
            });
        }
        res.status(200).json({ 
            success: true, 
            data: content 
        });
    } catch (error) {
        console.error('Error fetching service content:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching service content',
            error: error.message 
        });
    }
};

// Delete content
export const deleteServiceContent = async (req, res) => {
    try {
        const content = await ServiceContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ 
                success: false, 
                message: 'Service content not found' 
            });
        }

        const imagePath = path.join('uploads/services', content.image);
        if (content.image && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await content.deleteOne();

        console.log('Deleted service content:', {
            id: req.params.id
        });

        res.status(200).json({ 
            success: true, 
            message: 'Service content deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting service content:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting service content',
            error: error.message 
        });
    }
};
