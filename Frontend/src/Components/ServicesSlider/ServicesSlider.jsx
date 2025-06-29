import React, { useState, useEffect } from 'react';
import './ServicesSlider.css';
import axiosInstance, { ENDPOINTS } from '../../config/api';
import logo1 from '../../assets/img/logo1.jpg';

function ServicesSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axiosInstance.get(ENDPOINTS.HOME_CONTENT);
                console.log('Fetched content:', response.data);
                if (response.data && Array.isArray(response.data)) {
                    setContent(response.data);
                } else if (response.data && Array.isArray(response.data.data)) {
                    setContent(response.data.data);
                } else {
                    console.error('Unexpected data format:', response.data);
                    setError('Invalid data format received');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching content:', err);
                setError('Failed to fetch content: ' + err.message);
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return logo1;
        
        // If it's already a full URL (including Cloudinary), use it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // If it's a relative path, assume it's from the current domain and needs to be fixed
        if (imagePath.startsWith('/')) {
            return `${process.env.REACT_APP_BACKEND_URL || 'https://delta-teal.vercel.app'}${imagePath}`;
        }
        
        // If it's just a filename, assume it's from the current domain and needs to be fixed
        return `${process.env.REACT_APP_BACKEND_URL || 'https://delta-teal.vercel.app'}/${imagePath}`;
    };

    useEffect(() => {
        let interval;
        if (autoPlay && !isHovered && content.length > 0) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % content.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [autoPlay, isHovered, content.length]);

    useEffect(() => {
        let timeout;
        if (!autoPlay) {
            timeout = setTimeout(() => {
                setAutoPlay(true);
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [autoPlay]);

    const nextSlide = () => {
        if (content.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % content.length);
            setAutoPlay(false);
        }
    };

    const prevSlide = () => {
        if (content.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + content.length) % content.length);
            setAutoPlay(false);
        }
    };

    const getSlideClass = (index) => {
        if (index === currentSlide) return 'active';
        if (index === (currentSlide - 1 + content.length) % content.length) return 'prev';
        if (index === (currentSlide + 1) % content.length) return 'next';
        return '';
    };

    if (loading) {
        return (
            <div className="services-slider-container">
                <div className="loading-state">Loading content...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="services-slider-container">
                <div className="error-state">{error}</div>
            </div>
        );
    }

    if (!content.length) {
        return (
            <div className="services-slider-container">
                <div className="empty-state">No content available</div>
            </div>
        );
    }

    return (
        <div className="services-slider-container">
            <h2 className="services-title">Services</h2>
            <div 
                className="services-slider"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <button 
                    className="nav-button prev-button" 
                    onClick={prevSlide}
                    disabled={content.length <= 1}
                >
                    <span>&lt;</span>
                </button>
                <div className="slides-container">
                    {content.map((slide, index) => (
                        <div
                            key={slide._id}
                            className={`slide ${getSlideClass(index)}`}
                        >
                            <div className="slide-content">
                                <img 
                                    src={getImageUrl(slide.image)} 
                                    alt={slide.title} 
                                    onError={(e) => {
                                        console.error('Image failed to load:', e.target.src);
                                        e.target.onerror = null;
                                        e.target.src = logo1;
                                    }}
                                />
                                <h3>{slide.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
                <button 
                    className="nav-button next-button" 
                    onClick={nextSlide}
                    disabled={content.length <= 1}
                >
                    <span>&gt;</span>
                </button>
            </div>
        </div>
    );
}

export default ServicesSlider; 