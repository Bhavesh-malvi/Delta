import React, { useState, useEffect } from 'react';
import './CareerCoursesSection.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/careers';

function CareerCoursesSection() {
    const [expandedCards, setExpandedCards] = useState({});
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            console.log('Fetched careers:', response.data);
            if (response.data && Array.isArray(response.data)) {
                setCareers(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setCareers(response.data.data);
            } else {
                console.error('Unexpected data format:', response.data);
                setError('Invalid data format received');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch careers: ' + err.message);
            setLoading(false);
            console.error('Error fetching careers:', err);
        }
    };

    const toggleDescription = (index) => {
        setExpandedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const truncateText = (text, maxLength = 200) => {
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, maxLength).trim() + '...';
    };

    if (loading) return <div className="loading">Loading careers...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!careers.length) return <div className="no-data">No career opportunities available</div>;

    return (
        <section className="career-courses">
            <h2>CAREERS</h2>
            
            <p className="career-intro">
                Don't miss out on the opportunity to become a skilled person. Sign up for one of our courses today and start your journey toward a rewarding career in technology.
            </p>

            <div className="courses-grid">
                {careers.map((career, index) => (
                    <div className="course-card" key={career._id}>
                        <div className="course-content">
                            <div className="career-image">
                                <img 
                                    src={`http://localhost:5000/uploads/careers/${career.image}`} 
                                    alt={career.title}
                                />
                            </div>
                            <h3>{career.title}</h3>
                            <div className="description-container">
                                <p>
                                    {expandedCards[index] 
                                        ? career.description 
                                        : truncateText(career.description)}
                                    {career.description && career.description.length > 200 && (
                                        <button 
                                            className="read-more-btn"
                                            onClick={() => toggleDescription(index)}
                                        >
                                            {expandedCards[index] ? 'Read Less' : 'Read More'}
                                        </button>
                                    )}
                                </p>
                            </div>
                            {career.points && career.points.length > 0 && (
                                <div className="career-points">
                                    <ul>
                                        {career.points.map((point, pointIndex) => (
                                            <li key={pointIndex}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default CareerCoursesSection; 