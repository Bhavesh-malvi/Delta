import React, { useState, useEffect } from 'react';
import './HomeService.css';
import axios from 'axios';


const API_BASE_URL = 'http://localhost:5000/api/homeservices';
const UPLOADS_BASE_URL = 'http://localhost:5000/uploads/services';

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
            const response = await axios.get(API_BASE_URL);
            setServices(response.data.data);
        } catch (err) {
            setError('Failed to fetch services');
            console.error('Error fetching services:', err);
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
                alert('Please upload an image file');
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
        setPreviewImage(`${UPLOADS_BASE_URL}/${service.image}`);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingId && !formData.image) {
            alert('Please select an image');
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

            if (editingId) {
                // Update existing service
                await axios.put(`${API_BASE_URL}/${editingId}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Create new service
                await axios.post(API_BASE_URL, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            // Reset form
            resetForm();
            
            // Refresh services list
            fetchServices();
            
            alert(editingId ? 'Service updated successfully!' : 'Service added successfully!');
        } catch (err) {
            setError(editingId ? 'Failed to update service. Please try again.' : 'Failed to add service. Please try again.');
            console.error(editingId ? 'Error updating service:' : 'Error adding service:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            fetchServices();
        } catch (err) {
            setError('Failed to delete service');
            console.error('Error deleting service:', err);
        }
    };

    return (
        <div className="home-service-container">
            <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            {error && <div className="error-message">{error}</div>}
            
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
                    />
                </div>

                <div className="button-group">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <i className="fas fa-save"></i> {editingId ? 'Update Service' : 'Add Service'}
                            </>
                        )}
                    </button>
                    {editingId && (
                        <button type="button" className="cancel-btn" onClick={resetForm}>
                            <i className="fas fa-times"></i> Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="existing-services">
                <h3>Existing Services</h3>
                <div className="services-list">
                    {services.map((service) => (
                        <div key={service._id} className="service-item">
                            <div className="service-content">
                                <h4>{service.title}</h4>
                                {service.image && (
                                    <div className="service-image-container">
                                        <img 
                                            src={`${UPLOADS_BASE_URL}/${service.image}`}
                                            alt={service.title}
                                        />
                                    </div>
                                )}
                                <p>{service.description}</p>
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

export default HomeService; 