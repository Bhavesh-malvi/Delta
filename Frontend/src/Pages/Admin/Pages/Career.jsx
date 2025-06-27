import React, { useState, useEffect } from 'react';
import './Career.css';
import axios from 'axios';


const API_BASE_URL = 'http://localhost:5000/api/careers';
const UPLOADS_BASE_URL = 'http://localhost:5000/uploads/careers';

const Career = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
        points: ['', '', '', '']
    });
    const [careers, setCareers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [pointCount, setPointCount] = useState(4);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            setCareers(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching careers:', error);
            setMessage({ text: 'Failed to fetch careers', type: 'error' });
            setCareers([]); // Set empty array on error
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePointChange = (index, value) => {
        setFormData(prev => {
            const newPoints = [...prev.points];
            newPoints[index] = value;
            return {
                ...prev,
                points: newPoints
            };
        });
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
                setMessage({ text: 'Please upload an image file', type: 'error' });
                e.target.value = '';
            }
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            image: null
        }));
        setPreviewImage(null);
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    const addPoint = () => {
        setPointCount(prev => prev + 1);
        setFormData(prev => ({
            ...prev,
            points: [...prev.points, '']
        }));
    };

    const removePoint = (index) => {
        setFormData(prev => ({
            ...prev,
            points: prev.points.filter((_, i) => i !== index)
        }));
        setPointCount(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
        const filteredPoints = formData.points.filter(point => point.trim() !== '');
            
            if (filteredPoints.length < 4) {
                setMessage({ text: 'Please provide at least 4 non-empty points', type: 'error' });
                setLoading(false);
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }
            filteredPoints.forEach((point, index) => {
                formDataToSend.append(`points[${index}]`, point);
            });

            if (editingId) {
                await axios.put(`${API_BASE_URL}/${editingId}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setMessage({ text: 'Career course updated successfully', type: 'success' });
            } else {
                await axios.post(API_BASE_URL, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setMessage({ text: 'Career course added successfully', type: 'success' });
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                image: null,
                points: ['', '', '', '']
            });
            setPreviewImage(null);
            setEditingId(null);
            setPointCount(4);
            fetchCareers();
        } catch (error) {
            console.error('Error saving career course:', error);
            setMessage({ 
                text: error.response?.data?.message || 'Failed to save career course', 
                type: 'error' 
            });
        }
        
        setLoading(false);
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleEdit = (career) => {
        setFormData({
            title: career.title,
            description: career.description,
            image: null,
            points: [...career.points, ...Array(Math.max(0, 4 - career.points.length)).fill('')]
        });
        setPreviewImage(`${UPLOADS_BASE_URL}/${career.image}`);
        setPointCount(Math.max(4, career.points.length));
        setEditingId(career._id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            setMessage({ text: 'Career course deleted successfully', type: 'success' });
            fetchCareers();
        } catch (error) {
            console.error('Error deleting career course:', error);
            setMessage({ text: 'Failed to delete career course', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    return (
        <div className="career-container">
            <h2>{editingId ? 'Edit Career Course' : 'Add Career Course'}</h2>
            
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="career-form">
                <div className="form-group">
                    <label htmlFor="image">Course Image</label>
                    <div className="image-upload-container">
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="image-input"
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
                                    {formData.image?.name || 'Current Image'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="title">Course Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter course title"
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

                <div className="form-group points-section">
                    <label>Course Points (minimum 4 required)</label>
                    {formData.points.map((point, index) => (
                        <div key={index} className="point-input-container">
                            <input
                                type="text"
                                value={point}
                                onChange={(e) => handlePointChange(index, e.target.value)}
                                placeholder={`Point ${index + 1}`}
                                required={index < 4}
                            />
                            {index >= 4 && (
                                <button
                                    type="button"
                                    className="remove-point-btn"
                                    onClick={() => removePoint(index)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        className="add-point-btn"
                        onClick={addPoint}
                    >
                        <i className="fas fa-plus"></i> Add Point
                    </button>
                </div>

                <div className="form-buttons">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (editingId ? 'Update Career Course' : 'Add Career Course')}
                    </button>

                    {editingId && (
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    title: '',
                                    description: '',
                                    image: null,
                                    points: ['', '', '', '']
                                });
                                setPreviewImage(null);
                                setPointCount(4);
                            }}
                        >
                            Cancel
                </button>
                    )}
                </div>
            </form>

            <div className="existing-careers">
                <h3>Existing Career Courses</h3>
                <div className="careers-list">
                    {careers.map(career => (
                        <div key={career._id} className="career-item">
                            <div className="career-content">
                                <h4>{career.title}</h4>
                                {career.image && (
                                    <div className="career-image-container">
                                        <img 
                                            src={`${UPLOADS_BASE_URL}/${career.image}`} 
                                            alt={career.title} 
                                            className="career-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = placeholderImg;
                                            }}
                                        />
                                    </div>
                                )}
                                <p>{career.description}</p>
                                <ul>
                                    {career.points.map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="career-actions">
                                <button 
                                    onClick={() => handleEdit(career)}
                                    className="edit-btn"
                                    title="Edit"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    onClick={() => handleDelete(career._id)}
                                    className="delete-btn"
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

export default Career; 