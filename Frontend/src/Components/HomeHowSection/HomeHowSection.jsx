import React from 'react';
import './HomeHowSection.css';

const HomeHowSection = () => {
    const steps = [
        {
            number: "1",
            title: "Application",
            description: "Fill out our quick and easy application form to get started."
        },
        {
            number: "2",
            title: "Review",
            description: "Our team will review your application and reach out."
        },
        {
            number: "3",
            title: "Begin",
            description: "Get ready to embark on a new learning adventure!"
        }
    ];

    return (
        <section className="how-section2">
            <div className="how-content2">
                <div className="how-left2">
                    <h2 className="how-title2">
                        <span>HOW</span>
                        <span>TO</span>
                        <span>APPLY</span>
                    </h2>
                    <p className="how-email2">info@deltawaresolution.com</p>
                </div>
                <div className="how-right2">
                    {steps.map((step, index) => (
                        <div 
                            className="course-card2" 
                            key={index}
                            data-aos="fade-left"
                            data-aos-delay={index * 100}
                        >
                            <div className="card-header2">
                                <div className="step-number2">{step.number}</div>
                                <h3 className="step-title2">{step.title}</h3>
                            </div>
                            <div className="step-description2">{step.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomeHowSection; 