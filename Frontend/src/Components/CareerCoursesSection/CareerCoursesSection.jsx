import React, { useState, useEffect } from 'react';
import './CareerCoursesSection.css';
import axiosInstance, { ENDPOINTS, API_BASE_URL } from '../../config/api';
import logo1 from '../../assets/img/logo1.jpg';

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
            const response = await axiosInstance.get(ENDPOINTS.CAREER);
            console.log('🎯 Fetched careers response:', response);
            console.log('📊 Response data:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                console.log('✅ Using response.data (array)');
                setCareers(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                console.log('✅ Using response.data.data (array)');
                setCareers(response.data.data);
            } else {
                console.error('❌ Unexpected data format:', response.data);
                setError('Invalid data format received');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch careers: ' + err.message);
            setLoading(false);
            console.error('❌ Error fetching careers:', err);
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

    const getImageUrl = (imagePath) => {
        console.log('🔍 Processing image path:', imagePath);
        
        if (!imagePath) {
            console.log('❌ No image path provided, using fallback');
            return logo1;
        }
        
        // If it's already a full URL (including our API base URL), return as is
        if (imagePath.startsWith('http')) {
            console.log('✅ Full URL detected:', imagePath);
            return imagePath;
        }
        
        // Remove any leading slashes
        const cleanPath = imagePath.replace(/^\/+/, '');
        
        // If path already includes 'uploads' or 'careers', don't add them again
        if (cleanPath.includes('uploads/') || cleanPath.includes('careers/')) {
            const fullUrl = `${API_BASE_URL}/${cleanPath}`;
            console.log('🔗 Constructed URL from clean path:', fullUrl);
            return fullUrl;
        }
        
        // Otherwise, construct the full path
        const fullUrl = `${API_BASE_URL}/uploads/careers/${cleanPath}`;
        console.log('🔗 Constructed URL with full path:', fullUrl);
        return fullUrl;
    };

    if (loading) return <div className="loading1">Loading careers...</div>;
    if (error) return <div className="error1">{error}</div>;
    if (!careers.length) return <div className="no-data1">No career opportunities available</div>;

    return (
        <section className="career-courses1">
            <h2>CAREERS</h2>
            
            <p className="career-intro1">
                Don't miss out on the opportunity to become a skilled person. Sign up for one of our courses today and start your journey toward a rewarding career in technology.
            </p>

            <div className="courses-grid1">
                {careers.map((career, index) => {
                    console.log(`🎨 Rendering career ${index}:`, career);
                    console.log(`🖼️ Career ${index} image:`, career.image);
                    
                    return (
                        <div className="course-card1" key={career._id}>
                            <div className="course-content1">
                                <div className="career-image1">
                                    <img 
                                        src={getImageUrl(career.image)} 
                                        alt={career.title}
                                        onError={(e) => {
                                            console.error('❌ Image failed to load:', e.target.src);
                                            e.target.onerror = null;
                                            e.target.src = logo1;
                                        }}
                                        onLoad={(e) => {
                                            console.log('✅ Image loaded successfully:', e.target.src);
                                        }}
                                    />
                                </div>
                                <h3 className="career-title1">{career.title}</h3>
                                <div className="description-container1">
                                    <p>
                                        {expandedCards[index] 
                                            ? career.description 
                                            : truncateText(career.description)}
                                        {career.description && career.description.length > 200 && (
                                            <button 
                                                className="read-more-btn1"
                                                onClick={() => toggleDescription(index)}
                                            >
                                                {expandedCards[index] ? 'Read Less' : 'Read More'}
                                            </button>
                                        )}
                                    </p>
                                </div>
                                {career.points && career.points.length > 0 && (
                                    <div className="career-points1">
                                        <ul>
                                            {career.points.map((point, pointIndex) => (
                                                <li key={pointIndex}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default CareerCoursesSection; 