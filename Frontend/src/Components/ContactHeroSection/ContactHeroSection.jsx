import React from 'react';
import { Link } from 'react-router-dom';
import './ContactHeroSection.css';


const ContactHeroSection = () => {
    return (
        <div className="contact-hero-section">
            <div className="contact-hero-overlay"></div>
            <div className="contact-hero-content">
                <h1>Welcome to Deltaware</h1>
                <div className="contact-hero-links">
                    <Link to="/" className="hero-link">Home</Link>
                    <span> / </span>
                    <Link to="/contact" className="hero-link">Contact</Link>
                </div>
            </div>
        </div>
    );
};

export default ContactHeroSection; 