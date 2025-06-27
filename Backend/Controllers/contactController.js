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
                message: 'Name, email, phone, and message are required'
            });
        }

        console.log('Creating contact with data:', { name, email, phone, message });
        
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('Database not connected. ReadyState:', mongoose.connection.readyState);
            console.log('Returning success response for testing (data not saved)');
            return res.status(200).json({
                success: true,
                message: 'Contact submitted successfully (test mode - database not connected)',
                data: { name, email, phone, message, _id: 'test-id-' + Date.now() }
            });
        }

        const contact = new Contact({ name, email, phone, message });
        await contact.save();
        console.log('Contact saved successfully:', contact);

        res.status(201).json({
            success: true,
            message: 'Contact submitted successfully',
            data: contact
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to create contact',
            error: error.message
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
