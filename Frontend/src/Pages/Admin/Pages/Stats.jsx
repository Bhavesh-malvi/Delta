import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Stats.css';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const Stats = () => {
    const [stats, setStats] = useState({
        totalEnrollments: 0,
        totalCourses: 0,
        totalServices: 0,
        totalCareers: 0,
        totalContacts: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        totalEnrollments: '',
        totalCourses: '',
        totalServices: '',
        totalCareers: '',
        totalContacts: ''
    });
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async (retryAttempt = 0) => {
        try {
            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.STATS}`);
            if (response.data.success) {
                setStats(response.data.data);
                setFormData({
                    totalEnrollments: response.data.data.totalEnrollments || '',
                    totalCourses: response.data.data.totalCourses || '',
                    totalServices: response.data.data.totalServices || '',
                    totalCareers: response.data.data.totalCareers || '',
                    totalContacts: response.data.data.totalContacts || ''
                });
                setError(null);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching stats:', err);
            if (retryAttempt < MAX_RETRIES && err.response?.status === 503) {
                setIsRetrying(true);
                setError(`Service temporarily unavailable. Retrying... (${retryAttempt + 1}/${MAX_RETRIES})`);
                await sleep(RETRY_DELAY);
                return fetchStats(retryAttempt + 1);
            }
            setError('Failed to fetch stats. Please try again later.');
            setLoading(false);
            setIsRetrying(false);
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
        setLoading(true);
        setRetryCount(0);
        
        const updateWithRetry = async (attempt = 0) => {
            try {
                // Convert form values to numbers and handle empty strings
                const processedData = {
                    totalEnrollments: Number(formData.totalEnrollments) || 0,
                    totalCourses: Number(formData.totalCourses) || 0,
                    totalServices: Number(formData.totalServices) || 0,
                    totalCareers: Number(formData.totalCareers) || 0,
                    totalContacts: Number(formData.totalContacts) || 0
                };

                const response = await axios.put(`${API_BASE_URL}${ENDPOINTS.STATS}`, processedData);
                if (response.data.success) {
                    setSuccess('Stats updated successfully');
                    setError(null);
                    await fetchStats();
                }
                setLoading(false);
                setIsRetrying(false);
            } catch (err) {
                console.error('Error updating stats:', err);
                if (attempt < MAX_RETRIES && err.response?.status === 503) {
                    setIsRetrying(true);
                    setRetryCount(attempt + 1);
                    setError(`Update failed. Retrying... (${attempt + 1}/${MAX_RETRIES})`);
                    await sleep(RETRY_DELAY);
                    return updateWithRetry(attempt + 1);
                }
                setError(err.response?.data?.message || 'Failed to update stats. Please try again.');
                setLoading(false);
                setIsRetrying(false);
            }
        };

        await updateWithRetry();
        setTimeout(() => {
            setSuccess(null);
            setError(null);
        }, 3000);
    };

    if (loading && !isRetrying) return <div className="stats-admin-loading">Loading...</div>;

    return (
        <div className="stats-admin-container">
            {error && <div className="stats-admin-error">{error}</div>}
            {success && <div className="stats-admin-success">{success}</div>}
            {isRetrying && (
                <div className="stats-admin-retrying">
                    Retrying... Attempt {retryCount} of {MAX_RETRIES}
                </div>
            )}

            <div className="stats-admin-info">
                <h2>Current Stats</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <label>Total Enrollments</label>
                        <span>{stats.totalEnrollments || 0}</span>
                    </div>
                    <div className="stat-item">
                        <label>Total Courses</label>
                        <span>{stats.totalCourses || 0}</span>
                    </div>
                    <div className="stat-item">
                        <label>Total Services</label>
                        <span>{stats.totalServices || 0}</span>
                    </div>
                    <div className="stat-item">
                        <label>Total Careers</label>
                        <span>{stats.totalCareers || 0}</span>
                    </div>
                    <div className="stat-item">
                        <label>Total Contacts</label>
                        <span>{stats.totalContacts || 0}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="stats-admin-form">
                <h2>Update Stats</h2>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="totalEnrollments">Total Enrollments</label>
                        <input
                            type="number"
                            id="totalEnrollments"
                            name="totalEnrollments"
                            value={formData.totalEnrollments}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading || isRetrying}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="totalCourses">Total Courses</label>
                        <input
                            type="number"
                            id="totalCourses"
                            name="totalCourses"
                            value={formData.totalCourses}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading || isRetrying}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="totalServices">Total Services</label>
                        <input
                            type="number"
                            id="totalServices"
                            name="totalServices"
                            value={formData.totalServices}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading || isRetrying}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="totalCareers">Total Careers</label>
                        <input
                            type="number"
                            id="totalCareers"
                            name="totalCareers"
                            value={formData.totalCareers}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading || isRetrying}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="totalContacts">Total Contacts</label>
                        <input
                            type="number"
                            id="totalContacts"
                            name="totalContacts"
                            value={formData.totalContacts}
                            onChange={handleInputChange}
                            min="0"
                            disabled={loading || isRetrying}
                        />
                    </div>
                </div>
                <button type="submit" disabled={loading || isRetrying}>
                    {loading || isRetrying ? 'Updating...' : 'Update Stats'}
                </button>
            </form>
        </div>
    );
};

export default Stats; 