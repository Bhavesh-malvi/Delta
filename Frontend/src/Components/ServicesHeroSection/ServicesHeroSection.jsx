import React from 'react';
import './ServicesHeroSection.css';
import { Link } from 'react-router-dom';

function ServicesHeroSection() {
    return (
        <div className="services-hero-section">
            <div className="services-hero-content">
                <h1>We Provide Service's <span>Web Development</span>, <span>Cybersecurity</span>, <span>AI/ML</span>, <span>Cloud Computing</span></h1>
                <div className="services-nav">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/services">Services</Link>
                </div>
            </div>
        </div>
    );
}

export default ServicesHeroSection; 