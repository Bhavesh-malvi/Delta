import Enroll from '../models/Enroll.js';
import mongoose from 'mongoose';
import Stats from '../models/Stats.js';

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

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Phone number validation (basic)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.replace(/[^\d]/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit phone number'
            });
        }

        console.log('Creating enrollment with data:', { name, email, phone, course, message });
        
        try {
            const newEnroll = new Enroll({ name, email, phone, course, message });
            await newEnroll.save();
            console.log('Enrollment saved successfully:', newEnroll);

            // Increment customer count in stats
            let stats = await Stats.findOne();
            if (!stats) {
                stats = await Stats.create({});
            }
            stats.customerCount += 1;
            await stats.save();

            res.status(201).json({
                success: true,
                message: 'Enrollment submitted successfully',
                data: newEnroll
            });
        } catch (dbError) {
            console.error('Database error while saving enrollment:', dbError);
            if (dbError.name === 'MongooseError' || dbError.name === 'MongoError') {
                return res.status(500).json({
                    success: false,
                    message: 'Database connection error. Please try again.',
                    error: 'database_error'
                });
            }
            throw dbError;
        }
    } catch (error) {
        console.error('Error creating enrollment:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to create enrollment. Please try again.',
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

export const getEnrollCount = async (req, res) => {
    try {
        const count = await Enroll.countDocuments();
        res.json({ success: true, count });
    } catch (error) {
        console.error('Error getting enroll count:', error);
        res.status(500).json({ success: false, message: 'Error getting enroll count' });
    }
};
