import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import './Stats.css';

const Stats = () => {
    const [stats, setStats] = useState(null);
    const [newCount, setNewCount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.STATS);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await axiosInstance.put(`${ENDPOINTS.STATS}/update`, {
                displayedCount: parseInt(newCount)
            });
            if (response.data.success) {
                setStats(response.data.data);
                setNewCount('');
                setSuccessMessage('Stats updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error("Error updating stats:", error);
            setError(error.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    if (loading && !stats) {
        return <div className="stats-admin-loading">Loading...</div>;
    }

    return (
        <div className="stats-admin-container">
            <h2>Manage Statistics</h2>
            
            {error && <div className="stats-admin-error">{error}</div>}
            {successMessage && <div className="stats-admin-success">{successMessage}</div>}
            
            <div className="stats-admin-info">
                <h3>Current Stats</h3>
                <p>Total Customer Count: {stats?.customerCount || 0}</p>
                <p>Displayed Count: {stats?.displayedCount || 21}</p>
                <p>Last Updated: {stats?.lastManualUpdate ? new Date(stats.lastManualUpdate).toLocaleString() : 'Never'}</p>
            </div>

            <form onSubmit={handleUpdate} className="stats-admin-form">
                <h3>Update Customer Count</h3>
                <div className="form-group">
                    <label htmlFor="customerCount">New Customer Count:</label>
                    <input
                        type="number"
                        id="customerCount"
                        value={newCount}
                        onChange={(e) => setNewCount(e.target.value)}
                        min="0"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Count'}
                </button>
            </form>
        </div>
    );
};

export default Stats; 