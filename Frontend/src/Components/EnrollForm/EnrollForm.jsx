import React, { useState, useEffect } from 'react';
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
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '' });
    const [courseLoading, setCourseLoading] = useState(false);

    // Fetch courses on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.HOME_COURSE);
            if (response.data?.success) {
                const coursesData = response.data.data || [];
                setCourses(Array.isArray(coursesData) ? coursesData : []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setStatus({ type: 'error', message: 'Failed to load courses' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNewCourseChange = (e) => {
        const { name, value } = e.target;
        setNewCourse(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            setCourseLoading(true);
            const response = await axiosInstance.post(ENDPOINTS.HOME_COURSE, newCourse);
            if (response.data?.success) {
                setStatus({ type: 'success', message: 'Course added successfully!' });
                setNewCourse({ title: '', description: '' });
                setShowAddCourse(false);
                fetchCourses(); // Refresh the courses list
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to add course. Please try again.' });
        } finally {
            setCourseLoading(false);
        }
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
                            <div className="course-select-container">
                                <select 
                                    name="course"
                                    value={formData.course}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select a Course</option>
                                    {courses.map((course) => (
                                        <option key={course._id} value={course.title}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    className="add-course-btn"
                                    onClick={() => setShowAddCourse(true)}
                                    disabled={loading}
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
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

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Submit Enrollment'}
                        </button>
                    </form>

                    {/* Add Course Modal */}
                    {showAddCourse && (
                        <div className="add-course-modal">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3>Add New Course</h3>
                                    <button 
                                        className="close-btn"
                                        onClick={() => setShowAddCourse(false)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <form onSubmit={handleAddCourse}>
                                    <div className="form-group">
                                        <label>Course Title <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={newCourse.title}
                                            onChange={handleNewCourseChange}
                                            placeholder="Enter course title"
                                            required
                                            disabled={courseLoading}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Course Description <span className="required">*</span></label>
                                        <textarea
                                            name="description"
                                            value={newCourse.description}
                                            onChange={handleNewCourseChange}
                                            placeholder="Enter course description"
                                            required
                                            disabled={courseLoading}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="modal-buttons">
                                        <button 
                                            type="submit" 
                                            className="submit-btn" 
                                            disabled={courseLoading}
                                        >
                                            {courseLoading ? 'Adding...' : 'Add Course'}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => setShowAddCourse(false)}
                                            disabled={courseLoading}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnrollForm;