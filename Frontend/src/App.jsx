import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './Pages/Home/Home';
import About from './Pages/About/About';
import Services from './Pages/Services/Services';
import Career from './Pages/Career/Career';
import Contact from './Pages/Contact/Contact';
import Enroll from './Pages/Enroll/Enroll';
import Admin from './Pages/Admin/Admin';
import LoginForm from './Pages/Admin/Components/LoginForm/LoginForm';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop';
import LandingPage from './Components/LandingPage/LandingPage';
import { API_BASE_URL } from './config/api';
import './index.css';

// Component to handle conditional rendering of Navbar and Footer
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.toLowerCase().includes('/deltaadmin');
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Handle direct navigation to admin routes
    if (location.pathname.toLowerCase() === '/deltaadmin') {
      window.location.href = '/deltaadmin/login';
    }
  }, [location.pathname]);

  const handleLandingComplete = () => {
    setShowLanding(false);
  };

  // Debug logging
  console.log('📍 Current pathname:', location.pathname);
  console.log('🔐 Is admin route:', isAdminRoute);

  return (
    <>
      {showLanding && <LandingPage onComplete={handleLandingComplete} />}
      <ScrollToTop />
      {!isAdminRoute && !showLanding && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/career" element={<Career />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/enroll" element={<Enroll />} />
        
        {/* Admin Routes */}
        <Route path="/deltaadmin" element={<Navigate to="/deltaadmin/login" replace />} />
        <Route path="/deltaadmin/login" element={<LoginForm />} />
        
        {/* Protected Admin Routes */}
        <Route path="/deltaadmin/dashboard" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/deltaadmin/home-content" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/deltaadmin/home-courses" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/deltaadmin/home-services" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/deltaadmin/service-content" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/deltaadmin/career" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/deltaadmin/contact-data" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/deltaadmin/enroll-data" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdminRoute && !showLanding && <Footer />}
    </>
  );
};

function App() {
  // Log the API configuration for verification
  console.log('🚀 Frontend deployed to: https://deltawaresolution.com');
  console.log('🔗 Backend API URL: ', API_BASE_URL);
  console.log('✅ API Configuration loaded successfully');

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
