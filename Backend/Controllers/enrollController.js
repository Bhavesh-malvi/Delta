import Enroll from '../models/Enroll.js';
import mongoose from 'mongoose';

// ✅ Create new enrollment
export const createEnroll = async (req, res) => {
    try {
        console.log('Enrollment creation request received:', req.body);
        
        const { name, email, phone, course, message } = req.body;

        // Basic validation
        if (!name || !email || !phone || !course || !message) {
            console.log('Validation failed - missing fields:', { name, email, phone, course, message });
            return res.status(400).json({
                success: false,
                message: 'Name, email, phone, course, and message are required'
            });
        }

        console.log('Creating enrollment with data:', { name, email, phone, course, message });
        
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('Database not connected. ReadyState:', mongoose.connection.readyState);
            console.log('Returning success response for testing (data not saved)');
            return res.status(200).json({
                success: true,
                message: 'Enrollment submitted successfully (test mode - database not connected)',
                data: { name, email, phone, course, message, _id: 'test-id-' + Date.now() }
            });
        }

        const enroll = new Enroll({ name, email, phone, course, message });
        await enroll.save();
        console.log('Enrollment saved successfully:', enroll);

        res.status(201).json({
            success: true,
            message: 'Enrollment submitted successfully',
            data: enroll
        });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        console.error('Error stack:', error.stack);
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
