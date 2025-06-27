import React, { useState, useEffect } from 'react';
import './ServiceContent.css';
import axios from 'axios';
import { API_BASE_URL, UPLOADS_BASE_URL } from '../../../config/api';

const API_ENDPOINT = `${API_BASE_URL}/api/servicecontent`;
const UPLOADS_ENDPOINT = `${UPLOADS_BASE_URL}/services`;

const ServiceContent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
        points: ['', '', '', '']
    });

    const [services, setServices] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get(API_ENDPOINT);
            setServices(response.data.data);
        } catch (error) {
            console.error('Error fetching services:', error);
            setMessage({ text: 'Failed to fetch services', type: 'error' });
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
        setFormData(prev => ({
            ...prev,
            points: prev.points.map((point, i) => i === index ? value : point)
        }));
    };

    const addPoint = () => {
        setFormData(prev => ({
            ...prev,
            points: [...prev.points, '']
        }));
    };

    const removePoint = (index) => {
        if (formData.points.length > 4) {
            setFormData(prev => ({
                ...prev,
                points: prev.points.filter((_, i) => i !== index)
            }));
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
        // Filter out empty points
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
                await axios.put(`${API_ENDPOINT}/${editingId}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setMessage({ text: 'Service content updated successfully', type: 'success' });
            } else {
                await axios.post(API_ENDPOINT, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setMessage({ text: 'Service content added successfully', type: 'success' });
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
            fetchServices();
        } catch (error) {
            console.error('Error saving service content:', error);
            setMessage({ 
                text: error.response?.data?.message || 'Failed to save service content', 
                type: 'error' 
            });
        }

        setLoading(false);
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleEdit = (service) => {
        setFormData({
            title: service.title,
            description: service.description,
            image: null,
            points: [...service.points, ...Array(Math.max(0, 4 - service.points.length)).fill('')]
        });
        setPreviewImage(`${UPLOADS_ENDPOINT}/${service.image}`);
        setEditingId(service._id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_ENDPOINT}/${id}`);
            setMessage({ text: 'Service content deleted successfully', type: 'success' });
            fetchServices();
        } catch (error) {
            console.error('Error deleting service content:', error);
            setMessage({ text: 'Failed to delete service content', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    return (
        <div className="service-content-container">
            <h2>{editingId ? 'Edit Service Content' : 'Add Service Content'}</h2>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="service-content-form">
                <div className="form-group">
                    <label htmlFor="image">Service Image</label>
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
                    <label htmlFor="title">Service Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter service title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Service Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter service description"
                        required
                    />
                </div>

                <div className="form-group points-section">
                    <label>Service Points (minimum 4 required)</label>
                    {formData.points.map((point, index) => (
                        <div key={index} className="point-input-container">
                            <input
                                type="text"
                                value={point}
                                onChange={(e) => handlePointChange(index, e.target.value)}
                                placeholder={`Point ${index + 1}${index < 4 ? ' (required)' : ' (optional)'}`}
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
                        {loading ? 'Processing...' : (editingId ? 'Update Service' : 'Add Service')}
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
                            }}
                        >
                            Cancel
                </button>
                    )}
                </div>
            </form>

            <div className="existing-services">
                <h3>Existing Services</h3>
                <div className="services-list">
                    {services.map(service => (
                        <div key={service._id} className="service-item">
                        <div className="service-content">
                                <h4>{service.title}</h4>
                                {service.image && (
                                    <div className="service-image-container">
                                        <img 
                                            src={`${UPLOADS_ENDPOINT}/${service.image}`}
                                            alt={service.title}
                                        />
                                    </div>
                                )}
                                <p>{service.description}</p>
                                <ul>
                                    {service.points.map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                            </ul>
                        <div className="service-actions">
                                    <button 
                                        onClick={() => handleEdit(service)}
                                        className="edit-btn"
                                        title="Edit"
                                    >
                                <i className="fas fa-edit"></i>
                            </button>
                                    <button 
                                        onClick={() => handleDelete(service._id)}
                                        className="delete-btn"
                                        title="Delete"
                                    >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceContent; 