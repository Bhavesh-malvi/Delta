import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomeWhoSection.css';
import { API_BASE_URL } from '../../config/api';

const API_ENDPOINT = `${API_BASE_URL}/api/homecourses`;

const HomeWhoSection = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(API_ENDPOINT);
                console.log('Fetched courses:', response.data);
                if (response.data && Array.isArray(response.data)) {
                    setCourses(response.data);
                } else if (response.data && Array.isArray(response.data.data)) {
                    setCourses(response.data.data);
                } else {
                    console.error('Unexpected data format:', response.data);
                    setError('Invalid data format received');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to fetch courses: ' + err.message);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <section className="who-section">
            <div className="who-content">
                <div className="who-left">
                    <h2 className="who-title">
                        <span>Who</span>
                        <span>Can</span>
                        <span>JOIN</span>
                    </h2>
                    <p className="who-email">info@deltawaresolution.com</p>
                    {loading && <div className="loading-state">Loading courses...</div>}
                    {error && <div className="error-state">{error}</div>}
                </div>
                <div className="who-right">
                    {!loading && !error && courses.length > 0 && courses.map((course, index) => (
                        <div 
                            className="course-card" 
                            key={course._id}
                            data-aos="fade-left"
                            data-aos-delay={index * 100}
                        >
                            <div className="course-title-wrapper">
                                <div className="course-title-slide">
                                    <h3 className="course-title">{course.title}</h3>
                                    <h3 className="course-title course-description">{course.description}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!loading && !error && courses.length === 0 && (
                        <div className="empty-state">No courses available</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HomeWhoSection; 