import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isBlurring, setIsBlurring] = useState(false);

    useEffect(() => {
        // Start blur animation after 3.5 seconds
        const blurTimer = setTimeout(() => {
            setIsBlurring(true);
        }, 3500);

        // Hide component after 4 seconds
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
            onComplete();
        }, 4000);

        return () => {
            clearTimeout(blurTimer);
            clearTimeout(hideTimer);
        };
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className={`landing-page ${isBlurring ? 'blur-out' : ''}`}>
            <div className="landing-content">
                <div className="welcome-text">
                    <h1 className="main-title">Welcome to</h1>
                    <h1 className="company-name">
                        <span className="delta-text">Delta</span>
                        <span className="ware-text">ware</span>
                        <span className="delta-text">&nbsp;Solution</span>
                    </h1>
                    <p className="subtitle">Where Innovation Meets Excellence</p>
                </div>
                
                <div className="loading-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage; 