import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../../config/api';
import './HomeCourses.css';

const HomeCourses = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        price: '',
        image: null
    });

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.HOME_COURSE);
            const coursesData = response.data?.data || response.data || [];
            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.userMessage || 'Failed to fetch courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setFormData(prev => ({
                    ...prev,
                    image: file
                }));
                // Create preview URL
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setError('Please upload an image file');
                e.target.value = '';
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            duration: '',
            price: '',
            image: null
        });
        setPreviewImage(null);
        setEditingId(null);
        setError(null);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    const handleEdit = (course) => {
        setEditingId(course._id);
        setFormData({
            title: course.title,
            description: course.description,
            duration: course.duration,
            price: course.price,
            image: null
        });
        setPreviewImage(`${UPLOAD_URLS.CONTENT}/${course.image}`);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingId && !formData.image) {
            setError('Please select an image');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('duration', formData.duration);
            formDataToSend.append('price', formData.price);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingId) {
                await axiosInstance.put(
                    `${ENDPOINTS.HOME_COURSE}/${editingId}`, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Course updated successfully!', type: 'success' });
            } else {
                await axiosInstance.post(
                    ENDPOINTS.HOME_COURSE, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Course added successfully!', type: 'success' });
            }

            resetForm();
            fetchCourses();
        } catch (err) {
            console.error(editingId ? 'Error updating course:' : 'Error adding course:', err);
            setError(err.userMessage || (editingId ? 'Failed to update course' : 'Failed to add course'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.HOME_COURSE}/${id}`);
            setError({ text: 'Course deleted successfully!', type: 'success' });
            fetchCourses();
        } catch (err) {
            console.error('Error deleting course:', err);
            setError(err.userMessage || 'Failed to delete course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-course-container">
            <h2>{editingId ? 'Edit Course' : 'Add New Course'}</h2>

            {error && (
                <div className={`message ${typeof error === 'object' ? error.type : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="home-course-form">
                <div className="form-group">
                    <label htmlFor="image">Course Image {!editingId && <span className="required">*</span>}</label>
                    <div className="image-upload-container">
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="image-input"
                            disabled={loading}
                        />
                        {!previewImage ? (
                            <div className="upload-label">
                                <i className="fas fa-cloud-upload-alt"></i>
                                <span>Choose an image or drag it here</span>
                            </div>
                        ) : (
                            <div className="image-preview-container">
                                <div className="image-preview">
                                    <img src={previewImage} alt="Preview" />
                                </div>
                                <span className="file-name">
                                    {formData.image ? formData.image.name : 'Current Image'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="title">Course Title <span className="required">*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter course title"
                        required
                        disabled={loading}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Course Description <span className="required">*</span></label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter course description"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="duration">Course Duration <span className="required">*</span></label>
                    <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="Enter course duration"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Course Price <span className="required">*</span></label>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter course price"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Processing...
                            </>
                        ) : (
                            editingId ? 'Update Course' : 'Add Course'
                        )}
                    </button>
                    
                    {editingId && (
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={resetForm}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="existing-courses">
                <h3>Existing Courses</h3>
                {loading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading courses...
                    </div>
                ) : courses.length === 0 ? (
                    <div className="no-courses">
                        <i className="fas fa-inbox"></i>
                        <p>No courses available</p>
                    </div>
                ) : (
                    <div className="courses-list">
                        {courses.map(course => (
                        <div key={course._id} className="course-item">
                            <div className="course-content">
                                <h4>{course.title}</h4>
                                    {course.image && (
                                        <div className="course-image-container">
                                            <img 
                                                src={`${UPLOAD_URLS.CONTENT}/${course.image}`}
                                                alt={course.title}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder-course.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                <p>{course.description}</p>
                                    <div className="course-details">
                                        <span>Duration: {course.duration}</span>
                                        <span>Price: {course.price}</span>
                                    </div>
                            </div>
                            <div className="course-actions">
                                <button
                                    onClick={() => handleEdit(course)}
                                        className="edit-btn"
                                    title="Edit"
                                        disabled={loading}
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    onClick={() => handleDelete(course._id)}
                                        className="delete-btn"
                                    title="Delete"
                                        disabled={loading}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
};

export default HomeCourses; 