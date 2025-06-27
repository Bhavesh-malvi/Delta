import React from 'react';
import './HomeHowSection.css';

const HomeHowSection = () => {
    const steps = [
        {
            number: "1",
            description: "Fill out our quick and easy application form to get started."
        },
        {
            number: "2",
            description: "Our team will review your application and reach out."
        },
        {
            number: "3",
            description: "Get ready to embark on a new learning adventure!"
        }
    ];

    return (
        <section className="how-section">
            <div className="how-content">
                <div className="how-left">
                    <h2 className="how-title">
                        <span>HOW</span>
                        <span>TO</span>
                        <span>APPLY</span>
                    </h2>
                    <p className="how-email">info@deltawaresolution.com</p>
                </div>
                <div className="how-right">
                    {steps.map((step, index) => (
                        <div 
                            className="step-card" 
                            key={index}
                            data-aos="fade-left"
                            data-aos-delay={index * 100}
                        >
                            <div className="step-number">{step.number}</div>
                            <div className="step-description">{step.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomeHowSection; 