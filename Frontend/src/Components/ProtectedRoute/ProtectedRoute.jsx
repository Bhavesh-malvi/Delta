import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('adminLoggedIn') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/deltaadmin/login" replace />;
    }

    return children;
};

export default ProtectedRoute; 