import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomeServiceSection.css';
import { API_BASE_URL } from '../../config/api';

const API_ENDPOINT = `${API_BASE_URL}/api/homeservices`;

const HomeServiceSection = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get(API_ENDPOINT);
                console.log('Fetched services:', response.data);
                if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    setServices(response.data.data);
                } else {
                    setError('Invalid data format received');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching services:', err);
                setError('Failed to fetch services: ' + err.message);
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
                                src={`http://localhost:5000/uploads/services/${service.image}`} 
                                alt={service.title} 
                                className="service-image" 
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