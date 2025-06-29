import React, { useEffect, useRef, useState } from 'react';
import { homeContent2 } from "../../assets/assets.js";
import "./StatsSection.css";
import { FaProjectDiagram, FaSmile } from "react-icons/fa";
import axiosInstance, { ENDPOINTS } from '../../config/api';

const StatsSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [projectCount, setProjectCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [realCustomerCount, setRealCustomerCount] = useState(21);
    const sectionRef = useRef(null);
    const content = homeContent2[0];

    // Fetch stats from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get(ENDPOINTS.STATS);
                if (response.data && response.data.success) {
                    setRealCustomerCount(response.data.data.displayedCount);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
        // Fetch stats every 5 minutes
        const interval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const animateValue = (start, end, setter, duration) => {
        setter(start); // Reset to start value
        const startTime = Date.now();
        const timer = setInterval(() => {
            const timeElapsed = Date.now() - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (end - start) * easeOutQuart);
            
            setter(currentValue);
            
            if (progress === 1) {
                clearInterval(timer);
            }
        }, 16);

        return timer; // Return timer for cleanup
    };

    useEffect(() => {
        let animationTimers = [];

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Clear any existing animation timers
                animationTimers.forEach(timer => clearInterval(timer));
                animationTimers = [];

                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Reset counts and start new animations
                    setTimeout(() => {
                        const timer1 = animateValue(0, parseInt(content.totalProjects), setProjectCount, 2000);
                        const timer2 = animateValue(0, realCustomerCount, setCustomerCount, 2500);
                        animationTimers.push(timer1, timer2);
                    }, 500);
                } else {
                    setIsVisible(false);
                    setProjectCount(0);
                    setCustomerCount(0);
                }
            },
            {
                threshold: 0.2
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
            // Clear any running animations on cleanup
            animationTimers.forEach(timer => clearInterval(timer));
        };
    }, [content.totalProjects, realCustomerCount]);

    return (
        <section className="stats-section" ref={sectionRef}>
            <div className={`stats-container ${isVisible ? 'visible' : ''}`}>
                <div className="content-side">
                    <h2 className="animate-up">{content.title}</h2>
                    <p className="animate-up delay-1">{content.description1}</p>
                    <p className="animate-up delay-2">{content.description2}</p>
                </div>
                <div className="stats-side">
                    <div className="stat-box animate-in delay-1">
                        <div className="stat-number">{projectCount}</div>
                        <div className="stat-label">Total Projects</div>
                        <FaProjectDiagram className="stat-icon" />
                    </div>
                    <div className="stat-box animate-in delay-2">
                        <div className="stat-number">{customerCount}</div>
                        <div className="stat-label">Happy Customers</div>
                        <FaSmile className="stat-icon" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection; 