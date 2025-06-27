import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../../config/api';
import './ServiceContent.css';

const ServiceContent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Fetch existing contents
    const fetchContents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.SERVICE_CONTENT);
            setContents(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching contents:', err);
            setError(err.userMessage || 'Failed to fetch contents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
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

    const handleEdit = (content) => {
        setEditingId(content._id);
        setFormData({
            title: content.title,
            description: content.description,
            image: null
        });
        setPreviewImage(`${UPLOAD_URLS.SERVICES}/${content.image}`);
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
                // Update existing content
                await axiosInstance.put(
                    `${ENDPOINTS.SERVICE_CONTENT}/${editingId}`, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Content updated successfully!', type: 'success' });
            } else {
                // Create new content
                await axiosInstance.post(
                    ENDPOINTS.SERVICE_CONTENT, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Content added successfully!', type: 'success' });
            }

            // Reset form
            resetForm();
            
            // Refresh contents list
            fetchContents();
        } catch (err) {
            console.error(editingId ? 'Error updating content:' : 'Error adding content:', err);
            setError(err.userMessage || (editingId ? 'Failed to update content' : 'Failed to add content'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this content?')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.SERVICE_CONTENT}/${id}`);
            setError({ text: 'Content deleted successfully!', type: 'success' });
            fetchContents();
        } catch (err) {
            console.error('Error deleting content:', err);
            setError(err.userMessage || 'Failed to delete content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="service-content-container">
            <h2>{editingId ? 'Edit Content' : 'Add New Content'}</h2>

            {error && (
                <div className={`message ${typeof error === 'object' ? error.type : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="service-content-form">
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
                    <label htmlFor="title">Content Title <span className="required">*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter content title"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Content Description <span className="required">*</span></label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter content description"
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
                            editingId ? 'Update Content' : 'Add Content'
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

            <div className="contents-list">
                <h3>
                    Existing Contents
                    <button 
                        className="refresh-btn"
                        onClick={fetchContents}
                        disabled={loading}
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    </button>
                </h3>

                {loading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading contents...
                    </div>
                ) : contents.length === 0 ? (
                    <div className="no-contents">
                        <i className="fas fa-inbox"></i>
                        <p>No contents available</p>
                    </div>
                ) : (
                    <div className="contents-grid">
                        {contents.map(content => (
                            <div key={content._id} className="content-card">
                                <div className="content-image">
                                        <img 
                                        src={`${UPLOAD_URLS.SERVICES}/${content.image}`}
                                        alt={content.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-content.jpg';
                                        }}
                                        />
                                    </div>
                                <div className="content-info">
                                    <h4>{content.title}</h4>
                                    <p>{content.description}</p>
                                </div>
                                <div className="content-actions">
                                    <button 
                                        onClick={() => handleEdit(content)}
                                        className="edit-btn"
                                        disabled={loading}
                                    >
                                <i className="fas fa-edit"></i>
                            </button>
                                    <button 
                                        onClick={() => handleDelete(content._id)}
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

export default ServiceContent; 