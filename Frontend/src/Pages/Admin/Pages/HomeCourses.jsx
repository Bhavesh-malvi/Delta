import React, { useState, useEffect } from 'react';
import './HomeCourses.css';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const API_ENDPOINT = `${API_BASE_URL}/api/homecourses`;

const HomeCourses = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [courses, setCourses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(API_ENDPOINT);
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setMessage({ text: 'Failed to fetch courses', type: 'error' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await axios.put(`${API_ENDPOINT}/${editingId}`, formData);
                setMessage({ text: 'Course updated successfully', type: 'success' });
            } else {
                await axios.post(API_ENDPOINT, formData);
                setMessage({ text: 'Course added successfully', type: 'success' });
            }

            // Reset form
            setFormData({
                title: '',
                description: ''
            });
            setEditingId(null);
            fetchCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            setMessage({ 
                text: error.response?.data?.message || 'Failed to save course', 
                type: 'error' 
            });
        }

        setLoading(false);
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleEdit = (course) => {
        setFormData({
            title: course.title,
            description: course.description
        });
        setEditingId(course._id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_ENDPOINT}/${id}`);
            setMessage({ text: 'Course deleted successfully', type: 'success' });
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            setMessage({ text: 'Failed to delete course', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    return (
        <div className="home-courses-container">
            <h2>{editingId ? 'Edit Course' : 'Add New Course'}</h2>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                    <label htmlFor="title">Course Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter course title (e.g., Web Development, Data Science)"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Course Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter detailed course description"
                        required
                    />
                </div>

                <div className="form-buttons">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        <i className={`fas ${editingId ? 'fa-save' : 'fa-plus'}`}></i>
                        {loading ? 'Processing...' : (editingId ? 'Update Course' : 'Add Course')}
                    </button>
                    
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    title: '',
                                    description: ''
                                });
                                setMessage({ text: '', type: '' });
                            }}
                            className="cancel-btn"
                        >
                            <i className="fas fa-times"></i>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="courses-list">
                <h3>Existing Courses</h3>
                <div className="courses-grid">
                    {courses && courses.length > 0 && courses.map((course) => (
                        <div key={course._id} className="course-item">
                            <div className="course-content">
                                <h4>{course.title}</h4>
                                <p>{course.description}</p>
                            </div>
                            <div className="course-actions">
                                <button
                                    onClick={() => handleEdit(course)}
                                    className="action-btn edit"
                                    title="Edit"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    onClick={() => handleDelete(course._id)}
                                    className="action-btn delete"
                                    title="Delete"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeCourses; 