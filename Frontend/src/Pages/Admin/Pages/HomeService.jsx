import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../../config/api';
import './HomeService.css';

const HomeService = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Fetch existing services
    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.HOME_SERVICE);
            setServices(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err.userMessage || 'Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

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
            image: null
        });
        setPreviewImage(null);
        setEditingId(null);
        setError(null);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    const handleEdit = (service) => {
        setEditingId(service._id);
        setFormData({
            title: service.title,
            description: service.description,
            image: null
        });
        setPreviewImage(`${UPLOAD_URLS.SERVICES}/${service.image}`);
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
            // Create FormData object
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingId) {
                // Update existing service
                await axiosInstance.put(
                    `${ENDPOINTS.HOME_SERVICE}/${editingId}`, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Service updated successfully!', type: 'success' });
            } else {
                // Create new service
                await axiosInstance.post(
                    ENDPOINTS.HOME_SERVICE, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Service added successfully!', type: 'success' });
            }

            // Reset form
            resetForm();
            
            // Refresh services list
            fetchServices();
        } catch (err) {
            console.error(editingId ? 'Error updating service:' : 'Error adding service:', err);
            setError(err.userMessage || (editingId ? 'Failed to update service' : 'Failed to add service'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.HOME_SERVICE}/${id}`);
            setError({ text: 'Service deleted successfully!', type: 'success' });
            fetchServices();
        } catch (err) {
            console.error('Error deleting service:', err);
            setError(err.userMessage || 'Failed to delete service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-service-container">
            <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            
            {error && (
                <div className={`message ${typeof error === 'object' ? error.type : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="home-service-form">
                <div className="form-group">
                    <label htmlFor="image">Upload Image {!editingId && <span className="required">*</span>}</label>
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
                    <label htmlFor="title">Service Title <span className="required">*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter service title"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Service Description <span className="required">*</span></label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter service description"
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
                            editingId ? 'Update Service' : 'Add Service'
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

            <div className="services-list">
                <h3>
                    Existing Services
                    <button 
                        className="refresh-btn"
                        onClick={fetchServices}
                        disabled={loading}
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    </button>
                </h3>

                {loading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading services...
                    </div>
                ) : services.length === 0 ? (
                    <div className="no-services">
                        <i className="fas fa-inbox"></i>
                        <p>No services available</p>
                    </div>
                ) : (
                    <div className="services-grid">
                        {services.map(service => (
                            <div key={service._id} className="service-card">
                                <div className="service-image">
                                    <img 
                                        src={`${UPLOAD_URLS.SERVICES}/${service.image}`}
                                        alt={service.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-service.jpg';
                                        }}
                                    />
                                </div>
                                <div className="service-content">
                                    <h4>{service.title}</h4>
                                    <p>{service.description}</p>
                                </div>
                                <div className="service-actions">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="edit-btn"
                                        disabled={loading}
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service._id)}
                                        className="delete-btn"
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

export default HomeService; 