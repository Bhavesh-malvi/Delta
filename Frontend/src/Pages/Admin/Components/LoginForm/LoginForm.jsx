import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const userId = "admin@deltatech.com"; // Static user ID
        
        // Here you can add your password validation logic
        if (password === "33402033delta") { // This is just an example, replace with your actual validation
            // Store login state
            localStorage.setItem('adminLoggedIn', 'true');
            navigate('/deltaadmin/courses');
        } else {
            setError('Invalid password. Please try again.');
            setPassword('');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-form">
                <div className="login-header">
                    <h2>Admin Login</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>User ID</label>
                        <input 
                            type="text" 
                            value="admin@deltatech.com"
                            disabled
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm; 