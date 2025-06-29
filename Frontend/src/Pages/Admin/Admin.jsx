import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './Admin.css';
import Header from './Components/Header/Header';
import Sidebar from './Components/Sidebar/Sidebar';
import LoginForm from './Components/LoginForm/LoginForm';
import HomeContent from './Pages/HomeContent';
import HomeCourses from './Pages/HomeCourses';
import HomeService from './Pages/HomeService';
import ServiceContent from './Pages/ServiceContent';
import Career from './Pages/Career';
import ContactData from './Pages/ContactData';
import EnrollData from './Pages/EnrollData';
import Courses from './Pages/Courses';
import Stats from './Pages/Stats';
import ScrollToTop from '../../Components/ScrollToTop/ScrollToTop';

const Admin = () => {
    const location = useLocation();
    console.log('🔐 Admin Component - Current Path:', location.pathname);
    console.log('🔐 Admin Component - Full URL:', window.location.href);

    return (
        <div className="admin-container">
            <ScrollToTop />
            <Sidebar />
            <div className="admin-main">
                <Header />
                <div className="admin-content">
                    <Routes>
                        <Route index element={<Navigate to="/deltaadmin/home-content" replace />} />
                        <Route path="dashboard" element={<Navigate to="/deltaadmin/home-content" replace />} />
                        <Route path="home-services" element={<HomeService />} />
                        <Route path="home-content" element={<HomeContent />} />
                        <Route path="home-courses" element={<HomeCourses />} />
                        <Route path="service-content" element={<ServiceContent />} />
                        <Route path="career" element={<Career />} />
                        <Route path="contact-data" element={<ContactData />} />
                        <Route path="enroll-data" element={<EnrollData />} />
                        <Route path="courses" element={<Courses />} />
                        <Route path="stats" element={<Stats />} />
                        <Route path="*" element={<Navigate to="/deltaadmin/home-content" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Admin; 