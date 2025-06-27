import Enroll from '../models/Enroll.js';

// ✅ Create new enrollment
export const createEnroll = async (req, res) => {
    try {
        const { name, email, course } = req.body;

        // Basic validation
        if (!name || !email || !course) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and course are required'
            });
        }

        const enroll = new Enroll({ name, email, course });
        await enroll.save();

        res.status(201).json({
            success: true,
            message: 'Enrollment submitted successfully',
            data: enroll
        });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create enrollment',
            error: error.message
        });
    }
};

// ✅ Get all enrollments
export const getAllEnrolls = async (req, res) => {
    try {
        const enrolls = await Enroll.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: enrolls
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enrollments',
            error: error.message
        });
    }
};

// ✅ Delete enrollment by ID
export const deleteEnroll = async (req, res) => {
    try {
        const enroll = await Enroll.findByIdAndDelete(req.params.id);

        if (!enroll) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Enrollment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete enrollment',
            error: error.message
        });
    }
};
