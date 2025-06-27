import React from 'react';
import './AboutHeroSection.css';
import { Link } from 'react-router-dom';

function AboutHeroSection() {
    return (
        <section className="about-hero">
            <div className="about-hero-content">
                <h1>Welcome to Deltaware</h1>
                <div className="about-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/about">About</Link>
                </div>
            </div>
        </section>
    );
}

export default AboutHeroSection; 