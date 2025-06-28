import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        navigate('/deltaadmin/login');
    };

    return (
        <header className="admin-header">
            <div className="admin-search"></div>
            <div className="admin-profile">
                <span>Admin</span>
                <button className="logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header; 