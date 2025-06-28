import Career from '../models/Career.js';

// Get all careers
export const getAllCareers = async (req, res) => {
    try {
        const careers = await Career.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: careers });
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
        res.status(200).json({ success: true, data: career });
    } catch (error) {
        console.error('Error fetching career:', error);
        res.status(500).json({ success: false, message: 'Error fetching career', error: error.message });
    }
};

// Create new career
export const createCareer = async (req, res) => {
    console.log('🔥 createCareer function called!');
    console.log('🔥 req.file:', req.file);
    console.log('🔥 req.body:', req.body);
    
    try {
        const { title, description, points } = req.body;
        
        if (!title || !description) {
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

        // Create career data object
        const careerData = {
            title,
            description,
            points: parsedPoints
        };

        // Add image path if file was uploaded
        if (req.file) {
            console.log('🖼️ Image file received:', req.file);
            console.log('📁 Image filename:', req.file.filename);
            careerData.image = `careers/${req.file.filename}`;
            console.log('✅ Image path added to careerData:', careerData.image);
        } else {
            console.log('❌ No image file received in request');
        }

        console.log('📊 Final careerData to save:', careerData);

        const career = await Career.create(careerData);
        console.log('🎉 Career created successfully:', career);

        res.status(201).json({
            success: true,
            message: 'Career created successfully',
            data: career
        });
    } catch (error) {
        console.error('Career creation error:', error);
        res.status(500).json({ success: false, message: 'Error creating career', details: error.message });
    }
};

// Update career
export const updateCareer = async (req, res) => {
    console.log('🔥 updateCareer function called!');
    console.log('🔥 req.file:', req.file);
    console.log('🔥 req.body:', req.body);
    
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
            console.log('🖼️ New image file received:', req.file);
            career.image = `careers/${req.file.filename}`;
            console.log('✅ Image path updated:', career.image);
        }

        career.title = title;
        career.description = description;
        career.points = parsedPoints;
        
        await career.save();
        console.log('🎉 Career updated successfully');

        res.status(200).json({
            success: true,
            message: 'Career updated successfully',
            data: career
        });
    } catch (error) {
        console.error('Career update error:', error);
        res.status(500).json({ success: false, message: 'Error updating career', details: error.message });
    }
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
