import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/api';
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
            const response = await axiosInstance.get('/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            setError('Failed to fetch stats');
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStats = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axiosInstance.put('/stats/update', {
                customerCount: parseInt(newCount)
            });
            
            if (response.data.success) {
                setStats(response.data.data);
                setSuccessMessage('Stats updated successfully!');
                setNewCount('');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            setError('Failed to update stats');
            console.error('Error updating stats:', error);
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
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

            <form onSubmit={handleUpdateStats} className="stats-admin-form">
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