import React, { useEffect, useRef, useState } from 'react';
import { homeContent2 } from "../../assets/assets.js";
import "./StatsSection.css";
import { FaGraduationCap, FaSmile } from "react-icons/fa";
import axiosInstance from '../../config/api';
import { ENDPOINTS } from '../../config/api';

const StatsSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [coursesCount, setCoursesCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const sectionRef = useRef(null);
    const content = homeContent2[0];
    const [stats, setStats] = useState({
        totalEnrollments: 21, // Default value
        totalCourses: 0
    });

    useEffect(() => {
        let isMounted = true;

        const fetchStats = async () => {
            try {
                // Fetch stats for total courses
                const statsResponse = await axiosInstance.get(ENDPOINTS.STATS);
                console.log('Stats API Response:', statsResponse.data);

                if (!isMounted) return;

                if (statsResponse.data.success && statsResponse.data.data) {
                    const totalCourses = statsResponse.data.data.totalCourses || 0;
                    console.log('Total Courses:', totalCourses);

                    setStats(prev => ({
                        ...prev,
                        totalCourses
                    }));
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                if (error.response) {
                    console.error('Error Response:', error.response.data);
                }
            }
        };

        // Initial fetch
        fetchStats();

        // Set up polling every 30 seconds
        const pollInterval = setInterval(fetchStats, 30000);

        // Cleanup
        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, []);

    const animateValue = (start, end, setter, duration) => {
        if (typeof end !== 'number') {
            console.warn('Invalid end value for animation:', end);
            end = 0;
        }

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
                        console.log('Starting animation with totalCourses:', stats.totalCourses);
                        const timer1 = animateValue(0, stats.totalCourses, setCoursesCount, 2000);
                        const timer2 = animateValue(0, stats.totalEnrollments, setCustomerCount, 2500);
                        animationTimers.push(timer1, timer2);
                    }, 500);
                } else {
                    setIsVisible(false);
                    setCoursesCount(0);
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
    }, [stats.totalCourses, stats.totalEnrollments]);

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
                        <div className="stat-number">{coursesCount}</div>
                        <div className="stat-label">Total Projects</div>
                        <FaGraduationCap className="stat-icon" />
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