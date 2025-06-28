import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import './EnrollData.css';

const EnrollData = () => {
    const [enrolls, setEnrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEnrolls();
    }, []);

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

    const handleDelete = async (id) => {
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

    return (
        <div className="enroll-data-container">
            <h2>Enrollment Requests</h2>

            {error && (
                <div className={`message ${typeof error === 'object' ? error.type : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}

            {loading ? (
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading enrollments...</p>
                </div>
            ) : enrolls.length === 0 ? (
                <div className="no-enrolls">
                    <i className="fas fa-inbox"></i>
                    <p>No enrollment requests available</p>
                </div>
                ) : (
                <div className="enrolls-list">
                    {enrolls.map(enroll => (
                        <div key={enroll._id} className="enroll-item">
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
                                    <i className="fas fa-graduation-cap"></i>
                                        <strong>Course:</strong> {enroll.course}
                                    </p>
                                {enroll.message && (
                                    <p>
                                        <i className="fas fa-comment"></i>
                                        <strong>Message:</strong> {enroll.message}
                                    </p>
                                )}
                            </div>
                            <div className="enroll-actions">
                            <button 
                                    onClick={() => handleDelete(enroll._id)}
                                    className="action-btn delete"
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