import React, { useState } from 'react';
import axiosInstance, { ENDPOINTS } from '../../config/api';
import './EnrollForm.css';

const EnrollForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        course: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(ENDPOINTS.ENROLL, formData);
            if (response.data.success) {
                setStatus({ type: 'success', message: 'Enrollment submitted successfully!' });
                setFormData({ name: '', email: '', phone: '', course: '', message: '' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to submit enrollment. Please try again.' });
        }
    };

    return (
        <div className="enroll-form-container">
            <div className="enroll-form-content">
                <div className="enroll-form-left">
                    <h2>Please Share Some Details Here</h2>
                    <p>Welcome User!</p>
                    <p>Enter your personal details for enrollment</p>
                </div>
                
                <div className="enroll-form-right">
                    {status.message && (
                        <div className={`status-message ${status.type}`}>
                            {status.message}
                        </div>
                    )}
                    <form className="registration-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input 
                                type="text" 
                                name="name"
                                placeholder="Full Name" 
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Contact Number</label>
                            <input 
                                type="tel" 
                                name="phone"
                                placeholder="Mobile Number" 
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="Email" 
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Course</label>
                            <select 
                                name="course"
                                value={formData.course}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a Course</option>
                                <option value="Web Development">Web Development</option>
                                <option value="App Development">App Development</option>
                                <option value="Digital Marketing">Digital Marketing</option>
                                <option value="Data Science">Data Science</option>
                                <option value="UI/UX Design">UI/UX Design</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea 
                                name="message"
                                placeholder="Any specific requirements or questions?" 
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn">Submit Enrollment</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EnrollForm;