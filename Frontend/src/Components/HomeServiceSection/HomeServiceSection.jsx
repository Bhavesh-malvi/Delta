import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, API_BASE_URL } from '../../config/api';
import './HomeServiceSection.css';

const HomeServiceSection = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axiosInstance.get(ENDPOINTS.HOME_SERVICE);
                console.log('Fetched services:', response.data);
                if (response.data && Array.isArray(response.data)) {
                    setServices(response.data);
                } else if (response.data && Array.isArray(response.data.data)) {
                    setServices(response.data.data);
                } else {
                    setError('Invalid data format received');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching services:', err);
                setError(err.userMessage || 'Failed to fetch services');
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

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
                <div className="error-state">{error}</div>
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
                                src={`${API_BASE_URL}/uploads/services/${service.image}`}
                                alt={service.title} 
                                className="service-image"
                                onError={(e) => {
                                    console.error('Image failed to load:', e.target.src);
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-service.jpg';
                                }}
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