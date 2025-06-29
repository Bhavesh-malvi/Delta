import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Stats.css';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';

const Stats = () => {
    const [stats, setStats] = useState({
        totalProjects: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        totalProjects: ''
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.STATS}`);
            setStats(response.data);
            setFormData({
                totalProjects: response.data.totalProjects || ''
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch stats');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_BASE_URL}${ENDPOINTS.STATS}`, formData);
            setSuccess('Stats updated successfully');
            fetchStats();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to update stats');
            setTimeout(() => setError(null), 3000);
        }
    };

    if (loading) return <div className="stats-admin-loading">Loading...</div>;

    return (
        <div className="stats-admin-container">
            {error && <div className="stats-admin-error">{error}</div>}
            {success && <div className="stats-admin-success">{success}</div>}

            <div className="stats-admin-info">
                <h2>Current Stats</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <label>Total Projects</label>
                        <span>{stats.totalProjects || 0}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="stats-admin-form">
                <h2>Update Stats</h2>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="totalProjects">Total Projects</label>
                        <input
                            type="number"
                            id="totalProjects"
                            name="totalProjects"
                            value={formData.totalProjects}
                            onChange={handleInputChange}
                            min="0"
                        />
                    </div>
                </div>
                <button type="submit">Update Stats</button>
            </form>
        </div>
    );
};

export default Stats; 