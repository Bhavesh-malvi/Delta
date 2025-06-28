import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from '../../assets/img/logo1.jpg';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <div className="footer-brand">
                        <img src={logo} alt="DeltaWare Logo" className="footer-logo" />
                        <h2 className="footer-title">
                            DELTA<span>WARE</span>
                        </h2>
                    </div>
                    <p className="footer-tagline">
                        <span className="highlight">From Coding to Security</span>, 
                        Supporting You at Every Step.
                    </p>
                </div>

                <div className="footer-center">
                    <h3>Quick Links</h3>
                    <nav className="footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/services">Services</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Contact Us</Link>
                    </nav>
                </div>

                <div className="footer-right">
                    <h3>Reach Us</h3>
                    <div className="contact-info">
                        <p className="contact-item1">
                            <i className="fas fa-envelope"></i>
                            info@deltawaresolution.com
                        </p>
                        <p className="contact-item1">
                            <i className="fas fa-map-marker-alt"></i>
                            Kalu kuwan, Infront of natraj gali, Banda, Uttar Pradesh 210001
                        </p>
                        <p className="contact-item1">
                            <i className="fas fa-phone"></i>
                            +91 9250534906
                        </p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>deltawaresolution © 2025</p>
                <Link to="/enroll" className="enroll-btn">ENROLL</Link>
            </div>
        </footer>
    );
};

export default Footer;