import React from 'react';
import './ServicesCourse.css';
import { motion } from 'framer-motion';

const ServicesCourse = () => {
    const clients = [
        {
            title: "E-Commerce Companies",
            icon: "/src/assets/img/who.webp"
        },
        {
            title: "Healthcare Startups",
            icon: "/src/assets/img/who2.webp"
        },
        {
            title: "Students",
            icon: "/src/assets/img/who3.webp"
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
                            <img src={client.icon} alt={client.title} />
                        </div>
                        <h3>{client.title}</h3>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default ServicesCourse; 