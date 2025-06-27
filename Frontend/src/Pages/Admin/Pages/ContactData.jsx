import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import './ContactData.css';

const ContactData = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.CONTACT);
            setContacts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching contacts:', err);
            setError(err.userMessage || 'Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading contacts...</div>;
    }

    if (error) {
        return (
            <div className="error">
                {error}
                <button onClick={fetchContacts}>Retry</button>
            </div>
        );
    }

    return (
        <div className="contacts-container">
            <h2>Contact Inquiries</h2>
            <div className="contacts-grid">
                {contacts.map(contact => (
                    <div key={contact._id} className="contact-card">
                        <div className="contact-header">
                            <h3>{contact.name}</h3>
                            <span className="contact-date">
                                {new Date(contact.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="contact-info">
                            <p><strong>Email:</strong> {contact.email}</p>
                            <p><strong>Phone:</strong> {contact.phone}</p>
                            <p><strong>Message:</strong> {contact.message}</p>
                        </div>
                        <div className="contact-actions">
                            <button className="delete-btn">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContactData; 