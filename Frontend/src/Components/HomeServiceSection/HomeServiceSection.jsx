import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, API_BASE_URL } from '../../config/api';
import './HomeServiceSection.css';
import fallbackImage from '../../assets/img/s1.png'; // Import a local fallback image

const HomeServiceSection = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                console.log('Fetching services from:', ENDPOINTS.HOME_SERVICE);
                const response = await axiosInstance.get(ENDPOINTS.HOME_SERVICE);
                console.log('Response:', response.data);
                
                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    setServices(response.data.data);
                } else if (response.data && Array.isArray(response.data)) {
                    setServices(response.data);
                } else {
                    console.error('Invalid data format:', response.data);
                    throw new Error('Invalid data format received');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching services:', err);
                console.error('Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError(err.message || 'Failed to fetch services');
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const getImageUrl = (image) => {
        if (!image) return fallbackImage;
        
        // If it's a Cloudinary URL or any other full URL, use it as is
        if (image.startsWith('http')) {
            return image;
        }
        
        // For legacy images that might still be using the old path format
        return `${API_BASE_URL}/uploads/services/${image}`;
    };

    if (loading) {
        return (
            <section className="service-section">
                <div className="loading-state">Loading services...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="service-section">
                <div className="error-state">Error: {error}</div>
            </section>
        );
    }

    if (!services.length) {
        return (
            <section className="service-section">
                <div className="empty-state">No services available</div>
            </section>
        );
    }

    return (
        <section className="service-section">
            <h2 className="service-title">OUR-SERVICES</h2>
            <div className="services-container">
                {services.map((service) => (
                    <div className="service-card" key={service._id}>
                        <div className="service-image-container">
                            <img 
                                src={getImageUrl(service.image)}
                                alt={service.title} 
                                className="service-image"
                                onError={(e) => {
                                    console.error('Image failed to load:', e.target.src);
                                    e.target.onerror = null;
                                    e.target.src = fallbackImage;
                                }}
                                loading="lazy"
                            />
                            <div className="image-overlay"></div>
                        </div>
                        <h3 className="service-card-title">{service.title}</h3>
                        <p className="service-description">{service.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HomeServiceSection; 