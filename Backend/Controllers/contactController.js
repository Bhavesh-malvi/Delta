import Contact from '../models/Contact.js';
import mongoose from 'mongoose';

// ✅ Create new contact
export const createContact = async (req, res) => {
    try {
        console.log('Contact creation request received:', req.body);
        
        const { name, email, phone, message } = req.body;

        // Basic validation
        if (!name || !email || !phone || !message) {
            console.log('Validation failed - missing fields:', { name, email, phone, message });
            return res.status(400).json({
                success: false,
                message: 'All fields are required: name, email, phone, and message'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Phone validation (basic)
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number (10-15 digits)'
            });
        }

        console.log('Creating contact with data:', { name, email, phone, message });
        
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            console.error('Database connection error. ReadyState:', mongoose.connection.readyState);
            return res.status(500).json({
                success: false,
                message: 'Database connection error. Please try again later.'
            });
        }

        const contact = new Contact({ name, email, phone, message });
        await contact.save();
        console.log('Contact saved successfully:', contact);

        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.',
            data: contact
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        console.error('Error stack:', error.stack);
        
        // Handle mongoose validation errors
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle other database errors
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            return res.status(500).json({
                success: false,
                message: 'Database error. Please try again later.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request. Please try again later.'
        });
    }
};

// ✅ Get all contacts
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts',
            error: error.message
        });
    }
};

// ✅ Delete contact by ID
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact',
            error: error.message
        });
    }
};
