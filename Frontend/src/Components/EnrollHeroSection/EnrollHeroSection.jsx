import React from 'react';
import { Link } from 'react-router-dom';
import './EnrollHeroSection.css';

const EnrollHeroSection = () => {
    return (
        <div className="enroll-hero-section">
            <div className="enroll-hero-overlay"></div>
            <div className="enroll-hero-content">
                <h1>Welcome to Deltaware</h1>
                <div className="enroll-hero-links">
                    <Link to="/" className="hero-link">Home</Link>
                    <span className="hero-link-separator">/</span>
                    <Link to="/enroll" className="hero-link">Enroll</Link>
                </div>
            </div>
        </div>
    );
};

export default EnrollHeroSection; 