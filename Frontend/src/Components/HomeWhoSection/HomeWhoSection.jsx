import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../config/api';
import './HomeWhoSection.css';

const HomeWhoSection = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axiosInstance.get(ENDPOINTS.HOME_COURSE);
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
        <section className="who-section3">
            <div className="who-content3">
                <div className="who-left3">
                    <h2 className="who-title3">
                        <span>Who</span>
                        <span>Can</span>
                        <span>JOIN</span>
                    </h2>
                    <p className="who-email3">info@deltawaresolution.com</p>
                    {loading && <div className="loading-state3">Loading courses...</div>}
                    {error && <div className="error-state3">{error}</div>}
                </div>
                <div className="who-right3">
                    {!loading && !error && courses.length > 0 && courses.map((course, index) => (
                        <div 
                            className="course-card3" 
                            key={course._id}
                            data-aos="fade-left"
                            data-aos-delay={index * 100}
                        >
                            <div className="course-title-wrapper3">
                                <div className="course-title-slide3">
                                    <h3 className="course-title3">{course.title}</h3>
                                    <h3 className="course-title3 course-description3">{course.description}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!loading && !error && courses.length === 0 && (
                        <div className="empty-state3">No courses available</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HomeWhoSection; 