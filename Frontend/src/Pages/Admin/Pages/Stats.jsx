import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Stats.css';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const Stats = () => {
    const [stats, setStats] = useState({
        totalCourses: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        totalCourses: ''
    });
    const [updateStatus, setUpdateStatus] = useState('');

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchStats = async (retryAttempt = 0) => {
        try {
            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.STATS}`);
            if (response.data.success) {
                const totalCourses = response.data.data?.totalCourses || 0;
                setStats({ totalCourses });
                setFormData({
                    totalCourses: totalCourses || ''
                });
                setError(null);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching stats:', err);
            if (retryAttempt < MAX_RETRIES && err.response?.status === 503) {
                await sleep(RETRY_DELAY);
                return fetchStats(retryAttempt + 1);
            }
            setError('Failed to fetch stats. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setUpdateStatus('Updating stats...');
        
        const updateWithRetry = async (attempt = 0) => {
            try {
                const processedData = {
                    totalCourses: Number(formData.totalCourses) || 0
                };

                const response = await axios.put(`${API_BASE_URL}${ENDPOINTS.STATS}`, processedData);
                if (response.data.success) {
                    setSuccess('Stats updated successfully');
                    setError(null);
                    setUpdateStatus('');
                    setStats(processedData); // Update local state immediately
                }
                setLoading(false);
            } catch (err) {
                console.error('Update error:', err);
                if (attempt < MAX_RETRIES && err.response?.status === 503) {
                    await sleep(RETRY_DELAY);
                    return updateWithRetry(attempt + 1);
                }
                setError('Failed to update stats. Please try again.');
                setUpdateStatus('');
                setLoading(false);
            }
        };

        await updateWithRetry();
        setTimeout(() => {
            setSuccess(null);
            setError(null);
        }, 3000);
    };

    if (loading && !updateStatus) return <div className="stats-admin-loading">Loading...</div>;

    return (
        <div className="stats-admin-container">
            {error && <div className="stats-admin-error">{error}</div>}
            {success && <div className="stats-admin-success">{success}</div>}
            {updateStatus && (
                <div className="stats-admin-updating">
                    <div className="update-spinner"></div>
                    {updateStatus}
                </div>
            )}

            <div className="stats-admin-info">
                <h3>Current Stats</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <label>Total Courses</label>
                        <span>{stats.totalCourses || 0}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="stats-admin-form">
                <h3>Update Stats</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="totalCourses">Total Courses</label>
                        <input
                            type="number"
                            id="totalCourses"
                            name="totalCourses"
                            value={formData.totalCourses}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading}
                        />
                    </div>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Stats'}
                </button>
            </form>
        </div>
    );
};

export default Stats; 