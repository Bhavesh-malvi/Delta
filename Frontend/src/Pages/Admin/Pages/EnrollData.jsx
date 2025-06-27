import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import './EnrollData.css';

const EnrollData = () => {
    const [enrolls, setEnrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch enrollments
    const fetchEnrolls = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.ENROLL);
            const enrollsData = response.data?.data || response.data || [];
            setEnrolls(Array.isArray(enrollsData) ? enrollsData : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching enrollments:', err);
            setError(err.userMessage || 'Failed to fetch enrollments');
            setEnrolls([]);
        } finally {
            setLoading(false);
        }
    };

    // Delete enrollment
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enrollment?')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.ENROLL}/${id}`);
            setError({ text: 'Enrollment deleted successfully!', type: 'success' });
            fetchEnrolls();
        } catch (err) {
            console.error('Error deleting enrollment:', err);
            setError(err.userMessage || 'Failed to delete enrollment');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrolls();
    }, []);

    return (
        <div className="enroll-data-container">
            <h2>Enrollment Submissions</h2>

            {error && (
                <div className={`message ${typeof error === 'object' ? error.type : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                    {typeof error !== 'object' && (
                        <button onClick={fetchEnrolls} className="retry-btn">
                            <i className="fas fa-sync-alt"></i>
                            Retry
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    Loading enrollments...
                </div>
            ) : enrolls.length === 0 ? (
                <div className="no-enrolls">
                    <i className="fas fa-inbox"></i>
                    <p>No enrollment submissions found</p>
                </div>
                ) : (
                <div className="enrolls-list">
                    {enrolls.map(enroll => (
                        <div key={enroll._id} className="enroll-item">
                            <div className="enroll-content">
                                <div className="enroll-header">
                                    <h4>{enroll.name}</h4>
                                    <span className="enroll-date">
                                        {new Date(enroll.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            <div className="enroll-info">
                                    <p>
                                        <i className="fas fa-envelope"></i>
                                        <strong>Email:</strong> {enroll.email}
                                    </p>
                                    <p>
                                        <i className="fas fa-phone"></i>
                                        <strong>Phone:</strong> {enroll.phone}
                                    </p>
                                    <p>
                                        <i className="fas fa-book"></i>
                                        <strong>Course:</strong> {enroll.course}
                                    </p>
                                    <p>
                                        <i className="fas fa-comment"></i>
                                        <strong>Message:</strong> {enroll.message}
                                    </p>
                                </div>
                            </div>
                            <div className="enroll-actions">
                            <button 
                                    onClick={() => handleDelete(enroll._id)}
                                className="delete-btn"
                                title="Delete"
                                    disabled={loading}
                            >
                                    <i className="fas fa-trash"></i>
                            </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
        </div>
    );
};

export default EnrollData; 