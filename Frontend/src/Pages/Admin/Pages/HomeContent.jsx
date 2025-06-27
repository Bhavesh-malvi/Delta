import React, { useState, useEffect } from 'react';
import './HomeContent.css';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS, API_BASE_URL } from '../../../config/api';

const HomeContent = () => {
    const [formData, setFormData] = useState({
        title: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
        setContentLoading(true);
            setMessage({ text: '', type: '' });
            
            const response = await axiosInstance.get(ENDPOINTS.HOME_CONTENT);
            
            if (response.data.success) {
                setContents(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch content');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            let errorMessage = 'Failed to fetch content';
            
            if (error.response) {
                // Server responded with error
                errorMessage = error.response.data.message || 'Server error occurred';
                console.error('Server error:', error.response.data);
            } else if (error.request) {
                // No response received
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Other error
                errorMessage = error.message;
            }
            
            setMessage({ 
                text: errorMessage, 
                type: 'error' 
            });
            setContents([]);
        } finally {
            setContentLoading(false);
        }
    };

    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Show preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(file);

            // Compress image
            const compressedFile = await compressImage(file);
            setFormData(prev => ({ ...prev, image: compressedFile }));
        } catch (error) {
            console.error('Error processing image:', error);
            setMessage({
                text: 'Error processing image. Please try again.',
                type: 'error'
            });
        }
    };

    const resetForm = () => {
        setFormData({ title: '', image: null });
        setPreviewImage(null);
        setEditingId(null);
        setUploadProgress(0);
        setMessage({ text: '', type: '' });
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            title: item.title,
            image: null
        });
        setPreviewImage(item.image);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editingId && !formData.image) {
            setMessage({ text: 'Please select an image', type: 'error' });
            return;
        }

        try {
        setLoading(true);
        setMessage({ text: '', type: '' });

            const data = new FormData();
            data.append('title', formData.title);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            };

            let response;
            if (editingId) {
                response = await axiosInstance.put(
                    `${ENDPOINTS.HOME_CONTENT}/${editingId}`,
                    data,
                    config
                );
                setMessage({ text: 'Content updated successfully', type: 'success' });
            } else {
                response = await axiosInstance.post(
                    ENDPOINTS.HOME_CONTENT,
                    data,
                    config
                );
                setMessage({ text: 'Content added successfully', type: 'success' });
            }

            // Reset form
            resetForm();
            
            // Refresh content list
            fetchContent();
        } catch (error) {
            console.error('Error:', error);
            setMessage({ 
                text: error.userMessage || 'Error processing your request',
                type: 'error' 
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.HOME_CONTENT}/${id}`);
            setMessage({ text: 'Content deleted successfully!', type: 'success' });
            fetchContent();
        } catch (err) {
            console.error('Error deleting content:', err);
            setMessage(err.userMessage || 'Failed to delete content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-content-container">
            <h2>{editingId ? 'Edit Content' : 'Add New Content'}</h2>
            
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                    {message.type === 'error' && (
                        <button 
                            className="retry-btn"
                            onClick={() => {
                                setMessage({ text: '', type: '' });
                                fetchContent();
                            }}
                        >
                            <i className="fas fa-sync-alt"></i> Retry
                        </button>
                    )}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="home-content-form">
                <div className="form-group">
                    <label htmlFor="title">Title {!editingId && <span className="required">*</span>}</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        placeholder="Enter title"
                    />
                </div>

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
                            </div>
                        )}
                    </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="upload-progress">
                        <div 
                            className="progress-bar" 
                            style={{ width: `${uploadProgress}%` }}
                        >
                            {uploadProgress}%
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
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

            <div className="content-list">
                <h3>
                    Existing Content
                    <button 
                        className="refresh-btn"
                        onClick={() => fetchContent()}
                        disabled={contentLoading}
                    >
                        <i className={`fas fa-sync-alt ${contentLoading ? 'fa-spin' : ''}`}></i>
                    </button>
                </h3>
                
                    {contentLoading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading content...
                    </div>
                ) : contents.length === 0 ? (
                    <div className="no-content">
                        {message.type === 'error' ? (
                            <>
                                <i className="fas fa-exclamation-circle"></i>
                                <p>Failed to load content</p>
                                <button 
                                    className="retry-btn"
                                    onClick={() => fetchContent()}
                                >
                                    <i className="fas fa-sync-alt"></i> Retry
                                </button>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-inbox"></i>
                                <p>No content available</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="content-grid">
                        {contents.map(item => (
                            <div key={item._id} className="content-card">
                                <div className="image-container">
                                    <img 
                                        src={`${API_BASE_URL}${item.image}`} 
                                        alt={item.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </div>
                                <h4>{item.title}</h4>
                                <div className="card-actions">
                                        <button 
                                        onClick={() => handleEdit(item)}
                                            className="edit-btn"
                                        disabled={loading}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                        onClick={() => handleDelete(item._id)}
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

export default HomeContent; 