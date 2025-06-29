import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

const NavigationBar = () => {
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);

    // Close navbar when route changes
    useEffect(() => {
        setExpanded(false);
    }, [location]);

    // Function to check if the link is active
    const isActive = (path) => location.pathname === path;

    return (
        <Navbar expand="lg" className="custom-navbar" fixed="top" expanded={expanded} onToggle={setExpanded}>
            <Container>
                <Navbar.Brand as={Link} to="/" className="brand">
                    <img src="/assets/img/logo1.jpg" alt="Logo" className="brand-logo"/>
                    <p>Delta<span>ware</span></p>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link 
                            as={Link} 
                            to="/" 
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Home
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/about" 
                            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                        >
                            About
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/career" 
                            className={`nav-link ${isActive('/career') ? 'active' : ''}`}
                        >
                            Careers
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/services" 
                            className={`nav-link ${isActive('/services') ? 'active' : ''}`}
                        >
                            Services
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/contact" 
                            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                        >
                            Contact
                        </Nav.Link>
                        <Nav.Link 
                            as={Link} 
                            to="/enroll" 
                            className={`nav-link ${isActive('/enroll') ? 'active' : ''}`}
                        >
                            Enroll
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;