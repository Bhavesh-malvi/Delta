import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, API_BASE_URL } from '../../config/api';
import './HomeServiceSection.css';
import fallbackImage from '../../assets/img/s1.png'; // Import a local fallback image

const HomeServiceSection = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        let retryTimeout;

        const fetchServices = async () => {
            try {
                console.log('Fetching services from:', ENDPOINTS.HOME_SERVICE);
                const response = await axiosInstance.get(ENDPOINTS.HOME_SERVICE);
                console.log('Response:', response.data);
                
                if (!isMounted) return;

                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    setServices(response.data.data);
                    setError(null);
                } else if (response.data && Array.isArray(response.data)) {
                    setServices(response.data);
                    setError(null);
                } else {
                    console.error('Invalid data format:', response.data);
                    throw new Error('Invalid data format received');
                }
            } catch (err) {
                console.error('Error fetching services:', err);
                console.error('Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });

                if (!isMounted) return;

                setError(err.message || 'Failed to fetch services');
                
                // If it's a 500 error and we haven't retried too many times, retry
                if ((err.response?.status === 500 || !err.response) && retryCount < 2) {
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                    console.log(`Retrying in ${delay}ms... (Attempt ${retryCount + 1})`);
                    retryTimeout = setTimeout(() => {
                        if (isMounted) {
                            setRetryCount(prev => prev + 1);
                            setError('Retrying connection...');
                        }
                    }, delay);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchServices();

        return () => {
            isMounted = false;
            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }
        };
    }, [retryCount]); // Add retryCount as dependency to trigger retries

    const getImageUrl = (image) => {
        if (!image) return fallbackImage;
        
        // If it's a Cloudinary URL or any other full URL, use it as is
        if (image.startsWith('http')) {
            return image;
        }
        
        // For legacy images that might still be using the old path format
        return `${API_BASE_URL}/uploads/services/${image}`;
    };

    const handleImageError = (e, title) => {
        console.error(`Image failed to load for ${title}:`, e.target.src);
        e.target.onerror = null;
        e.target.src = fallbackImage;
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading services...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-state">
                    <p>{error}</p>
                    {retryCount < 2 && (
                        <button 
                            className="retry-button"
                            onClick={() => setRetryCount(prev => prev + 1)}
                        >
                            Retry
                        </button>
                    )}
                </div>
            );
        }

        if (!services.length) {
            return <div className="empty-state">No services available</div>;
        }

        return (
            <>
                <h2 className="service-title">OUR-SERVICES</h2>
                <div className="services-container">
                    {services.map((service) => (
                        <div 
                            className="service-card" 
                            key={service._id}
                            data-aos="fade-up"
                            data-aos-delay={200}
                        >
                            <div className="service-image-container">
                                <img 
                                    src={getImageUrl(service.image)}
                                    alt={service.title} 
                                    className="service-image"
                                    onError={(e) => handleImageError(e, service.title)}
                                    loading="lazy"
                                />
                                <div className="image-overlay"></div>
                            </div>
                            <h3 className="service-card-title">{service.title}</h3>
                            <p className="service-description">{service.description}</p>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <section className="service-section">
            {renderContent()}
        </section>
    );
};

export default HomeServiceSection; 