import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import './Courses.css';
import { FaTrash } from 'react-icons/fa';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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
            setError('Failed to load courses');
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!newCourse.trim()) {
            setError('Course title is required');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const courseData = {
                courseName: newCourse.trim()
            };
            
            const response = await axiosInstance.post(ENDPOINTS.ENROLL_COURSE, courseData);
            
            // Add the new course to the list
            const addedCourse = response.data.data;
            setCourses(prev => [...prev, addedCourse]);
            
            // Reset form
            setNewCourse('');
            setSuccess('Course added successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (error) {
            console.error('Error adding course:', error);
            setError('Failed to add course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            await axiosInstance.delete(`${ENDPOINTS.ENROLL_COURSE}/${courseId}`);
            setCourses(prev => prev.filter(course => course._id !== courseId));
            setSuccess('Course deleted successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error deleting course:', error);
            setError('Failed to delete course');
        }
    };

    return (
        <div className="courses-admin">
            <div className="courses-header">
                <h2>Manage Courses</h2>
                <p>Add and manage available courses for enrollment</p>
            </div>

            {/* Add Course Form */}
            <div className="add-course-section">
                <h3>Add New Course</h3>
                <form onSubmit={handleAddCourse} className="add-course-form">
                    <div className="form-group">
                        <input
                            type="text"
                            value={newCourse}
                            onChange={(e) => setNewCourse(e.target.value)}
                            placeholder="Enter course title"
                            className="course-input"
                            disabled={loading}
                        />
                        <button 
                            type="submit" 
                            className="add-btn"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Course'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Courses List */}
            <div className="courses-list-section">
                <h3>Available Courses ({courses.length})</h3>
                <div className="courses-grid">
                    {courses.map((course) => (
                        <div key={course._id} className="course-card">
                            <div className="course-info">
                                <h4>{course.courseName}</h4>
                            </div>
                            <button
                                onClick={() => handleDeleteCourse(course._id)}
                                className="delete-btn"
                                title="Delete Course"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
                {courses.length === 0 && (
                    <div className="no-courses">
                        <p>No courses available. Add your first course above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses; 