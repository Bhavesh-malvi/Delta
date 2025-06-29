import React, { useState } from 'react';
import axiosInstance, { ENDPOINTS } from '../../config/api';
import './ContactContent.css';

const ContactContent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axiosInstance.post(ENDPOINTS.CONTACT, formData);
            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: 'Message sent successfully!'
                });
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    message: ''
                });
            } else {
                throw new Error(response.data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || error.message || 'Failed to send message. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-content">
            <div className="contact-header">
                <h2>CONTACT US</h2>
                <p>Get in Touch, We Cherish all Interactions</p>
            </div>
            
            <div className="contact-info-container">
                <div className="contact-card">
                    <h3>CONTACT NUMBER</h3>
                    <p>+91 9250534906</p>
                </div>
                
                <div className="contact-card">
                    <h3>EMAIL</h3>
                    <p>info@deltawaresolution.com</p>
                </div>
            </div>

            <div className="contact-form-section">
                <h3>Please Share Some Information here</h3>
                {status.message && (
                    <div className={`status-message ${status.type}`}>
                        {status.message}
                    </div>
                )}
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <input 
                            type="text" 
                            name="name"
                            placeholder="Name" 
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input 
                            type="tel" 
                            name="phone"
                            placeholder="Phone" 
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <textarea 
                            name="message"
                            placeholder="Message" 
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>

            <div className="map-container">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.803873681905!2d80.33901617554618!3d25.47822362026047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399ccf0021770815%3A0x3175f81a7a21b86c!2sDeltaware%20solution%20Private%20limited!5e0!3m2!1sen!2sin!4v1749805373716!5m2!1sen!2sin"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Deltaware Map"
                    className="google-map"
                ></iframe>
            </div>
        </div>
    );
};

export default ContactContent; 