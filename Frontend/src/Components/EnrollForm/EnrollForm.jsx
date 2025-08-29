import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../config/api';
import './EnrollForm.css';
import { Link } from 'react-router-dom';

const EnrollForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        course: '',
        message: ''
    });

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axiosInstance.get(ENDPOINTS.ENROLL_COURSE);
            if (response.data && Array.isArray(response.data.data)) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses. Please try again later.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error and success messages when user starts typing
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Validate form data
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.course || !formData.message.trim()) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.post(ENDPOINTS.ENROLL, formData);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                course: '',
                message: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enroll-form-container">
            <div className="enroll-form-content">
                <div className="enroll-form-left">
                    <h2>Enroll Now</h2>
                    <p>Join our courses and enhance your skills</p>
                    <p>Fill out the form and we'll get back to you soon</p>
                </div>
                
                <div className="enroll-form-right">
                    {error && (
                        <div className="status-message error">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="status-message success">
                            Enrollment submitted successfully! We'll contact you soon.
                        </div>
                    )}

                    <form className="registration-form" onSubmit={handleSubmit}>
                        <div className="form-group1">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="form-group1">
                            <label>Email <span className="required">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group1">
                            <label>Phone <span className="required">*</span></label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div className="form-group1">
                            <label>Course <span className="required">*</span></label>
                            <div className="course-select-container">
                                <select
                                    name="course"
                                    value={formData.course}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course.courseName}>
                                            {course.courseName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group1">
                            <label>Message <span className="required">*</span></label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Tell us about your learning goals..."
                                required
                                rows={4}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Enrollment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EnrollForm;