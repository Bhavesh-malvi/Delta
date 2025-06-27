import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EnrollData.css';

const EnrollData = () => {
    const [enrolls, setEnrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch enrollments
    const fetchEnrolls = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/enrolls');
            setEnrolls(response.data.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching enrollments');
            setLoading(false);
        }
    };

    // Delete enrollment
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/enrolls/${id}`);
            setEnrolls(enrolls.filter(enroll => enroll._id !== id));
        } catch (error) {
            setError('Error deleting enrollment');
        }
    };

    useEffect(() => {
        fetchEnrolls();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="enroll-data">
            <h2>Enrollment Submissions</h2>
            <div className="enroll-list">
                {enrolls.length === 0 ? (
                    <div className="no-data">No enrollment submissions found</div>
                ) : (
                    enrolls.map(enroll => (
                        <div key={enroll._id} className="enroll-card">
                            <div className="enroll-info">
                                <h3>{enroll.name}</h3>
                                <p><strong>Email:</strong> {enroll.email}</p>
                                <p><strong>Phone:</strong> {enroll.phone}</p>
                                <p><strong>Course:</strong> {enroll.course}</p>
                                <p><strong>Message:</strong> {enroll.message}</p>
                                <p><strong>Date:</strong> {new Date(enroll.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(enroll._id)}
                                title="Delete"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EnrollData; 