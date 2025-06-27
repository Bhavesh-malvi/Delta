import ServiceContent from '../models/ServiceContent.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    try {
        const { title, description, points } = req.body;

        // Basic validation
        if (!title || !description || !req.file || !points) {
            // If there's an uploaded file but other validations failed, delete it
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, image and points'
            });
        }

        // Filter out empty points
        const filteredPoints = Array.isArray(points) ? points.filter(point => point.trim() !== '') : 
                             typeof points === 'string' ? [points] : [];

        if (filteredPoints.length < 4) {
            // Delete the uploaded file if points validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Please provide at least 4 non-empty points'
            });
        }

        const serviceContent = await ServiceContent.create({
            title,
            description,
            points,
            image: req.file.filename
        });

        res.status(201).json({
            success: true,
            message: 'Service content created successfully',
            data: serviceContent
        });
    } catch (error) {
        // Delete uploaded file if service creation fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update service content
export const updateServiceContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }

        try {
            const serviceContent = await ServiceContent.findById(req.params.id);
            
            if (!serviceContent) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: 'Service content not found'
                });
            }

            const { title, description, points } = req.body;
            
            if (!title || !description || !points) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            // If new image is uploaded, delete old image
            if (req.file) {
                const oldImagePath = path.join('uploads/services', serviceContent.image);
                if (serviceContent.image && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                serviceContent.image = req.file.filename;
            }

            // If points are provided, validate them
            const filteredPoints = Array.isArray(points) ? points.filter(point => point.trim() !== '') : 
                                 typeof points === 'string' ? [points] : [];
            if (filteredPoints.length < 4) {
                // Delete the uploaded file if points validation fails
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Please provide at least 4 non-empty points'
                });
            }
            serviceContent.points = filteredPoints;

            // Update other fields if provided
            if (title) serviceContent.title = title;
            if (description) serviceContent.description = description;
            
            await serviceContent.save();

            res.status(200).json({
                success: true,
                message: 'Service content updated successfully',
                data: serviceContent
            });
        } catch (error) {
            // Delete the uploaded file if there's an error
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({
                success: false,
                message: 'Error updating service content',
                error: error.message
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

        // Delete the image file if it exists
        if (serviceContent.image) {
            const imagePath = path.join(__dirname, '..', serviceContent.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
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