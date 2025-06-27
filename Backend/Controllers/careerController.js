import Career from '../models/Career.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer setup: Save images to local 'uploads/careers/' folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/careers/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
        
        // Transform legacy data to new format
        const transformedCareers = careers.map(career => {
            const careerObj = career.toObject();
            
            // If career has points array, use it
            if (careerObj.points && Array.isArray(careerObj.points)) {
                return careerObj;
            }
            
            // Handle legacy Point1-Point7 fields
            const legacyPoints = [];
            for (let i = 1; i <= 7; i++) {
                if (careerObj[`Point${i}`]) {
                    legacyPoints.push(careerObj[`Point${i}`]);
                }
            }
            
            // Remove legacy fields and add points array
            const { Point1, Point2, Point3, Point4, Point5, Point6, Point7, ...cleanCareer } = careerObj;
            return {
                ...cleanCareer,
                points: legacyPoints
            };
        });
        
        res.status(200).json({ success: true, data: transformedCareers });
    } catch (error) {
        console.error('Error fetching careers:', error);
        res.status(500).json({ success: false, message: 'Error fetching careers', error: error.message });
    }
};

// Get single career
export const getCareer = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        if (!career) return res.status(404).json({ success: false, message: 'Career not found' });
        
        const careerObj = career.toObject();
        
        // If career has points array, use it
        if (careerObj.points && Array.isArray(careerObj.points)) {
            return res.status(200).json({ success: true, data: careerObj });
        }
        
        // Handle legacy Point1-Point7 fields
        const legacyPoints = [];
        for (let i = 1; i <= 7; i++) {
            if (careerObj[`Point${i}`]) {
                legacyPoints.push(careerObj[`Point${i}`]);
            }
        }
        
        // Remove legacy fields and add points array
        const { Point1, Point2, Point3, Point4, Point5, Point6, Point7, ...cleanCareer } = careerObj;
        const transformedCareer = {
            ...cleanCareer,
            points: legacyPoints
        };
        
        res.status(200).json({ success: true, data: transformedCareer });
    } catch (error) {
        console.error('Error fetching career:', error);
        res.status(500).json({ success: false, message: 'Error fetching career', error: error.message });
    }
};

// Create new career
export const createCareer = async (req, res) => {
    console.log('=== CAREER CREATE REQUEST START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request files:', req.files);
    console.log('=== CAREER CREATE REQUEST END ===');
    
    console.log('createCareer called with body:', req.body);
    console.log('createCareer called with file:', req.file);
    
    // Check if database is connected
    if (!req.app.locals.dbConnected) {
        console.log('Database not connected');
        return res.status(503).json({ 
            success: false, 
            message: 'Database not available. Please try again later.' 
        });
    }
    
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            const { title, description, points } = req.body;
            console.log('Extracted fields:', { title, description, points });

            if (!req.file) {
                console.log('No file uploaded');
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image',
                    details: 'Image file is required'
                });
            }

            if (!title || !description) {
                console.log('Missing required fields:', { title, description });
                return res.status(400).json({
                    success: false,
                    message: 'Title and description are required'
                });
            }

            // Parse points from JSON string
            let parsedPoints = [];
            if (points) {
                try {
                    parsedPoints = JSON.parse(points);
                    console.log('Parsed points:', parsedPoints);
                    if (!Array.isArray(parsedPoints)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Points must be an array'
                        });
                    }
                } catch (parseError) {
                    console.error('Points parsing error:', parseError);
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid points format'
                    });
                }
            }

            const imagePath = `/uploads/careers/${req.file.filename}`;
            console.log('Image path:', imagePath);

            const careerData = {
                title,
                description,
                points: parsedPoints,
                image: imagePath
            };
            console.log('Creating career with data:', careerData);

            const career = await Career.create(careerData);
            console.log('Career created successfully:', career);

            res.status(201).json({
                success: true,
                message: 'Career created successfully',
                data: career
            });
        } catch (error) {
            console.error('Career creation error:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({ success: false, message: 'Error creating career', details: error.message });
        }
    });
};

// Update career
export const updateCareer = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });

        try {
            const { title, description, points } = req.body;
            const career = await Career.findById(req.params.id);

            if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

            if (!title || !description) {
                return res.status(400).json({ success: false, message: 'Title and description are required' });
            }

            // Parse points from JSON string
            let parsedPoints = [];
            if (points) {
                try {
                    parsedPoints = JSON.parse(points);
                    if (!Array.isArray(parsedPoints)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Points must be an array'
                        });
                    }
                } catch (parseError) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid points format'
                    });
                }
            }

            // If image uploaded, update path
            if (req.file) {
                career.image = `/uploads/careers/${req.file.filename}`;
            }

            career.title = title;
            career.description = description;
            career.points = parsedPoints;
            await career.save();

            res.status(200).json({
                success: true,
                message: 'Career updated successfully',
                data: career
            });
        } catch (error) {
            console.error('Career update error:', error);
            res.status(500).json({ success: false, message: 'Error updating career', details: error.message });
        }
    });
};

// Delete career
export const deleteCareer = async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        if (!career) return res.status(404).json({ success: false, message: 'Career not found' });

        await career.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Career deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting career', error: error.message });
    }
};
