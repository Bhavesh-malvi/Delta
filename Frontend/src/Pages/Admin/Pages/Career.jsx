import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import './Career.css';

const Career = () => {
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.CAREER);
            setCareers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching careers:', err);
            setError(err.userMessage || 'Failed to fetch careers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading careers...</div>;
    }

    if (error) {
        return (
            <div className="error">
                {error}
                <button onClick={fetchCareers}>Retry</button>
            </div>
        );
    }

    return (
        <div className="careers-container">
            <h2>Career Opportunities</h2>
            <div className="careers-grid">
                {careers.map(career => (
                    <div key={career._id} className="career-card">
                        <h3>{career.title}</h3>
                        <p>{career.description}</p>
                        <div className="career-details">
                            <span>Experience: {career.experience}</span>
                            <span>Location: {career.location}</span>
                        </div>
                        <div className="career-actions">
                            <button className="edit-btn">Edit</button>
                            <button className="delete-btn">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Career; 