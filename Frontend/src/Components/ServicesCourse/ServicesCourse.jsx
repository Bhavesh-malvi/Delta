import React from 'react';
import './ServicesCourse.css';
import { motion } from 'framer-motion';
import whoImg from '../../assets/img/who.webp';
import who2Img from '../../assets/img/who2.webp';
import who3Img from '../../assets/img/who3.webp';

const ServicesCourse = () => {
    const clients = [
        {
            title: "E-Commerce Companies",
            icon: whoImg
        },
        {
            title: "Healthcare Startups",
            icon: who2Img
        },
        {
            title: "Students",
            icon: who3Img
        }
    ];

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

    return (
        <div className="services-course-container">
            <motion.div 
                className="services-course-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {clients.map((client, index) => (
                    <motion.div 
                        key={index} 
                        className="client-card"
                        variants={itemVariants}
                    >
                        <div className="client-icon-wrapper">
                            <img 
                                src={client.icon} 
                                alt={client.title}
                                onError={(e) => {
                                    console.error('Image failed to load:', e.target.src);
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/400x300?text=Client+Image';
                                }}
                            />
                        </div>
                        <h3>{client.title}</h3>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default ServicesCourse; 