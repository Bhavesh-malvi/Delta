import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import ScrollToTop from '../../Components/ScrollToTop/ScrollToTop';

const Admin = () => {
    return (
        <div className="admin-container">
            <ScrollToTop />
            <Sidebar />
            <div className="admin-main">
                <Header />
                <div className="admin-content">
                    <Routes>
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/home-content" element={<HomeContent />} />
                        <Route path="/home-courses" element={<HomeCourses />} />
                        <Route path="/home-service" element={<HomeService />} />
                        <Route path="/service-content" element={<ServiceContent />} />
                        <Route path="/career" element={<Career />} />
                        <Route path="/contact-data" element={<ContactData />} />
                        <Route path="/enroll-data" element={<EnrollData />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Admin; 