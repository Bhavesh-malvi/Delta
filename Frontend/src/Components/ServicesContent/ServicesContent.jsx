import React, { useState, useEffect } from 'react';
import './ServicesContent.css';
import { motion } from 'framer-motion';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../config/api';

const ServicesContent = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axiosInstance.get(ENDPOINTS.SERVICE_CONTENT);
                console.log('Fetched service content:', response.data);
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
                console.error('Error fetching service content:', err);
                setError('Failed to fetch content: ' + err.message);
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=Service+Image';
        
        // If the image path already contains the full URL, use it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Remove any leading slashes from the image path
        const cleanImagePath = imagePath.replace(/^\/+/, '');
        
        // If the path already includes 'uploads/services', don't add it again
        if (cleanImagePath.startsWith('uploads/services/')) {
            return `${UPLOAD_URLS.SERVICES}/${cleanImagePath}`;
        }
        
        // Otherwise, construct the full URL with the services path
        return `${UPLOAD_URLS.SERVICES}/${cleanImagePath}`;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    if (loading) {
        return (
            <div className="services-content-container">
                <div className="loading-state">Loading services...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="services-content-container">
                <div className="error-state">{error}</div>
            </div>
        );
    }

    if (!content.length) {
        return (
            <div className="services-content-container">
                <div className="empty-state">No services available</div>
            </div>
        );
    }

    return (
        <div className="services-content-container">
            <motion.div 
                className="services-content-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {content.map((service) => (
                    <motion.div 
                        key={service._id}
                        className="service-card"
                        variants={itemVariants}
                    >
                        <div className="service-image-container">
                            <img 
                                src={getImageUrl(service.image)} 
                                alt={service.title} 
                                className="service-image"
                                onError={(e) => {
                                    console.error('Image failed to load:', e.target.src);
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/400x300?text=Service+Image';
                                }}
                            />
                        </div>
                        <div className="service-info">
                            <h2 className="service-title">{service.title}</h2>
                            <p className="service-description">{service.description}</p>
                            <ul className="service-points">
                                {service.points && service.points.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default ServicesContent;