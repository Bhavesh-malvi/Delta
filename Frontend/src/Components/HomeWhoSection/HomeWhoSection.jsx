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
        <section className="who-section2">
            <div className="who-content2">
                <div className="who-left2">
                    <h2 className="who-title2">
                        <span>Who</span>
                        <span>Can</span>
                        <span>JOIN</span>
                    </h2>
                    <p className="who-email2">info@deltawaresolution.com</p>
                    {loading && <div className="loading-state2">Loading courses...</div>}
                    {error && <div className="error-state2">{error}</div>}
                </div>
                <div className="who-right2">
                    {!loading && !error && courses.length > 0 && courses.map((course, index) => (
                        <div 
                            className="course-card2" 
                            key={course._id}
                            data-aos="fade-left"
                            data-aos-delay={index * 100}
                        >
                            <div className="course-title-wrapper2">
                                <div className="course-title-slide2">
                                    <h3 className="course-title2">{course.title}</h3>
                                    <h3 className="course-title2 course-description2">{course.description}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!loading && !error && courses.length === 0 && (
                        <div className="empty-state2">No courses available</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HomeWhoSection; 