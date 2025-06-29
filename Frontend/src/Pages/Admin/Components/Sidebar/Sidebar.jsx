import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { FaGraduationCap, FaChartLine } from 'react-icons/fa';

function Sidebar() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        {
            path: '/deltaadmin/enroll-courses',
            name: 'Enroll Courses',
            icon: <FaGraduationCap />
        },
        {
            title: 'Stats',
            path: '/deltaadmin/stats',
            icon: <FaChartLine />
        },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <h2>{isMobile ? 'A' : 'Admin'}</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/deltaadmin/home-content" end>
                            <i className="fas fa-home"></i>
                            <span>Home Content</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/deltaadmin/home-services">
                            <i className="fas fa-cogs"></i>
                            <span>Home Service</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/deltaadmin/home-courses">
                            <i className="fas fa-graduation-cap"></i>
                            <span>Home Courses</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/deltaadmin/career">
                            <i className="fas fa-briefcase"></i>
                            <span>Career</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/deltaadmin/service-content">
                            <i className="fas fa-cogs"></i>
                            <span>Service Content</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/deltaadmin/contact-data">
                            <i className="fas fa-address-book"></i>
                            <span>Contact Data</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/deltaadmin/enroll-data">
                            <i className="fas fa-user-graduate"></i>
                            <span>Enroll Data</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/deltaadmin/courses">
                            <i className="fas fa-book"></i>
                            <span>Courses</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/deltaadmin/stats">
                            <i className="fas fa-chart-line"></i>
                            <span>Stats</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
