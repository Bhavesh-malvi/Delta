import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactData.css';

const ContactData = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch contacts
    const fetchContacts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/contacts');
            setContacts(response.data.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching contacts');
            setLoading(false);
        }
    };

    // Delete contact
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/contacts/${id}`);
            setContacts(contacts.filter(contact => contact._id !== id));
        } catch (error) {
            setError('Error deleting contact');
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="contact-data">
            <h2>Contact Submissions</h2>
            <div className="contact-list">
                {contacts.length === 0 ? (
                    <div className="no-data">No contact submissions found</div>
                ) : (
                    contacts.map(contact => (
                        <div key={contact._id} className="contact-card">
                            <div className="contact-info">
                                <h3>{contact.name}</h3>
                                <p><strong>Email:</strong> {contact.email}</p>
                                <p><strong>Phone:</strong> {contact.phone}</p>
                                <p><strong>Message:</strong> {contact.message}</p>
                                <p><strong>Date:</strong> {new Date(contact.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(contact._id)}
                                title="Delete"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ContactData; 