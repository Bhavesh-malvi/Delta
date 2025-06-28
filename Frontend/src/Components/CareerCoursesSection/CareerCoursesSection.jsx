import React, { useState, useEffect } from 'react';
import './CareerCoursesSection.css';
import axiosInstance, { ENDPOINTS, API_BASE_URL } from '../../config/api';

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
        console.log('🔍 getImageUrl called with:', imagePath);
        
        if (!imagePath) {
            console.log('❌ No image path provided, using placeholder');
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
        }
        
        // If the image path already contains the full URL, use it as is
        if (imagePath.startsWith('http')) {
            console.log('✅ Full URL detected:', imagePath);
            return imagePath;
        }
        
        // If the path already starts with 'careers/', don't add it again
        if (imagePath.startsWith('careers/')) {
            const fullUrl = `${API_BASE_URL}/uploads/${imagePath}`;
            console.log('🔗 Constructed URL (careers/):', fullUrl);
            return fullUrl;
        }
        
        // Construct the full URL using API_BASE_URL
        const fullUrl = `${API_BASE_URL}/uploads/careers/${imagePath}`;
        console.log('🔗 Constructed URL:', fullUrl);
        return fullUrl;
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
                {careers.map((career, index) => {
                    console.log(`🎨 Rendering career ${index}:`, career);
                    console.log(`🖼️ Career ${index} image:`, career.image);
                    
                    return (
                        <div className="course-card" key={career._id}>
                            <div className="course-content">
                                <div className="career-image">
                                    <img 
                                        src={getImageUrl(career.image)} 
                                        alt={career.title}
                                        onError={(e) => {
                                            console.error('❌ Image failed to load:', e.target.src);
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                                        }}
                                        onLoad={(e) => {
                                            console.log('✅ Image loaded successfully:', e.target.src);
                                        }}
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
                    );
                })}
            </div>
        </section>
    );
}

export default CareerCoursesSection; 