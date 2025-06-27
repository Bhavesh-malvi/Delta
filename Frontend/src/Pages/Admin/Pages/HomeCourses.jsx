import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import './HomeCourses.css';

const HomeCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.HOME_COURSE);
            setCourses(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.userMessage || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading courses...</div>;
    }

    if (error) {
        return (
            <div className="error">
                {error}
                <button onClick={fetchCourses}>Retry</button>
            </div>
        );
    }

    return (
        <div className="courses-container">
            <h2>Home Courses</h2>
            <div className="courses-grid">
                {courses.map(course => (
                    <div key={course._id} className="course-card">
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        <div className="course-actions">
                            <button className="edit-btn">Edit</button>
                            <button className="delete-btn">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeCourses; 