const EnrollCourse = require('../models/EnrollCourse');

// Get all enrollment courses
exports.getAllEnrollCourses = async (req, res) => {
    try {
        const courses = await EnrollCourse.find({ isActive: true });
        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new enrollment course
exports.createEnrollCourse = async (req, res) => {
    try {
        const { courseName } = req.body;
        
        if (!courseName) {
            return res.status(400).json({
                success: false,
                message: 'Course name is required'
            });
        }

        const course = await EnrollCourse.create({
            courseName,
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update enrollment course
exports.updateEnrollCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseName, isActive } = req.body;

        const course = await EnrollCourse.findByIdAndUpdate(
            id,
            { courseName, isActive },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete enrollment course
exports.deleteEnrollCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await EnrollCourse.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 