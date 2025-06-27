import React from 'react';
import './AboutMissionSection.css';

function AboutMissionSection() {
    return (
        <section className="mission-section">
            <h2 className="mission-title">Our Mission</h2>
            
            <div className="mission-intro">
                <p>Welcome to Deltaware Solution Pvt Ltd, a leading name in cybersecurity and web development. Founded by Anuj Kumar Dwivedi, a seasoned cybersecurity expert with 4+ years of experience and co-founded by Ashutosh Dwivedi. Our company is committed to delivering cutting-edge cybersecurity solutions and web development services to businesses worldwide</p>
            </div>

            <div className="services-section">
                <h3 className="services-heading">At Deltaware Solution Pvt Ltd, we provide services:</h3>
                
                <div className="services-content">
                    <p><span className="service-title">Cybersecurity Expertise:</span> Advanced penetration testing, vulnerability assessments, and bug hunting to secure digital assets.</p>
                    <p><span className="service-title">Web Application Security:</span> Protecting web platforms from cyber threats with proactive security measures.</p>
                    <p><span className="service-title">Web Development:</span> Crafting high-performance websites and applications tailored to business needs.</p>
                </div>
            </div>

            <div className="mission-cards">
                <div className="mission-card">
                    <h3>Get in Touch</h3>
                    <p>Our mission is to fortify the digital landscape by providing top-tier security solutions and innovative web services.</p>
                    <p>We believe in Integrity, Innovation and Excellence, ensuring that our clients receive the highest level of protection and functionality for their online presence.</p>
                    <p>With a team of highly skilled professionals, we strive to stay ahead in the cybersecurity domain, helping organizations mitigate risks and strengthen their security posture.</p>
                </div>

                <div className="mission-card">
                    <h3>Get in Touch</h3>
                    <p>Join us on our mission to build a safer and more secure digital world.</p>
                    <div className="contact-info">
                        <p>
                            <span>Email:</span>
                            <a href="mailto:info@deltawaresolution.com">info@deltawaresolution.com</a>
                        </p>
                        <p>
                            <span>Phone:</span>
                            <a href="tel:+919250534906">+91 9250534906</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutMissionSection; 