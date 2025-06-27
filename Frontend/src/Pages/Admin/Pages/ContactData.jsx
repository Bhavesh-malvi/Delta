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
            const contactsData = response.data?.data || response.data || [];
            setContacts(Array.isArray(contactsData) ? contactsData : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching contacts:', err);
            setError(err.userMessage || 'Failed to fetch contacts');
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.CONTACT}/${id}`);
            setError({ text: 'Contact deleted successfully!', type: 'success' });
            fetchContacts();
        } catch (err) {
            console.error('Error deleting contact:', err);
            setError(err.userMessage || 'Failed to delete contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-data-container">
            <h2>Contact Inquiries</h2>

            {error && (
                <div className={`message ${typeof error === 'object' ? error.type : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                    {typeof error !== 'object' && (
                        <button onClick={fetchContacts} className="retry-btn">
                            <i className="fas fa-sync-alt"></i>
                            Retry
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    Loading contacts...
                </div>
            ) : contacts.length === 0 ? (
                <div className="no-contacts">
                    <i className="fas fa-inbox"></i>
                    <p>No contact inquiries available</p>
                </div>
            ) : (
                <div className="contacts-list">
                    {contacts.map(contact => (
                        <div key={contact._id} className="contact-item">
                            <div className="contact-content">
                                <div className="contact-header">
                                    <h4>{contact.name}</h4>
                                    <span className="contact-date">
                                        {new Date(contact.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="contact-info">
                                    <p>
                                        <i className="fas fa-envelope"></i>
                                        <strong>Email:</strong> {contact.email}
                                    </p>
                                    <p>
                                        <i className="fas fa-phone"></i>
                                        <strong>Phone:</strong> {contact.phone}
                                    </p>
                                    <p>
                                        <i className="fas fa-comment"></i>
                                        <strong>Message:</strong> {contact.message}
                                    </p>
                                </div>
                            </div>
                            <div className="contact-actions">
                                <button
                                    onClick={() => handleDelete(contact._id)}
                                    className="delete-btn"
                                    title="Delete"
                                    disabled={loading}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactData; 