import React from 'react';
import './CareerHeroSection.css';
import { Link } from 'react-router-dom';

function CareerHeroSection() {
    return (
        <section className="career-hero">
            <div className="career-hero-content">
                <h1>Welcome to Deltaware</h1>
                <div className="career-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/career">Career</Link>
                </div>
            </div>
        </section>
    );
}

export default CareerHeroSection; 