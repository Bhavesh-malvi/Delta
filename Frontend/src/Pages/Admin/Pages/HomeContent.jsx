import React, { useState, useEffect } from 'react';
import './HomeContent.css';
import axios from 'axios';
import { API_BASE_URL, UPLOADS_BASE_URL } from '../../../config/api';

const API_ENDPOINT = `${API_BASE_URL}/api/homecontent`;
const UPLOADS_ENDPOINT = `${UPLOADS_BASE_URL}/content`;

const HomeContent = () => {
    const [formData, setFormData] = useState({
        title: '',
        image: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [editingId, setEditingId] = useState(null);

    // Fetch existing content
    const fetchContent = async () => {
        setContentLoading(true);
        try {
            const response = await axios.get(API_ENDPOINT);
            console.log('Fetched content:', response.data.data);
            setContent(response.data.data || []);
        } catch (err) {
            setMessage({ text: 'Failed to fetch content', type: 'error' });
            console.error('Error fetching content:', err);
            setContent([]);
        } finally {
            setContentLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
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
                setMessage({ text: 'Please upload an image file', type: 'error' });
                e.target.value = '';
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            image: null
        });
        setPreviewImage(null);
        setEditingId(null);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            title: item.title,
            image: null
        });
        setPreviewImage(`${UPLOADS_ENDPOINT}/${item.image}`);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingId && !formData.image) {
            setMessage({ text: 'Please select an image', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Create FormData object
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            if (formData.image instanceof File) {
                formDataToSend.append('image', formData.image);
            }

            if (editingId) {
                // Update existing content
                await axios.put(`${API_ENDPOINT}/${editingId}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setMessage({ text: 'Content updated successfully!', type: 'success' });
            } else {
                // Create new content
                await axios.post(API_ENDPOINT, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setMessage({ text: 'Content added successfully!', type: 'success' });
            }

            // Reset form
            resetForm();
            
            // Refresh content list
            fetchContent();
        } catch (err) {
            setMessage({ 
                text: err.response?.data?.message || (editingId ? 'Failed to update content' : 'Failed to add content'), 
                type: 'error' 
            });
            console.error(editingId ? 'Error updating content:' : 'Error adding content:', err);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_ENDPOINT}/${id}`);
            setMessage({ text: 'Content deleted successfully!', type: 'success' });
            fetchContent();
        } catch (err) {
            setMessage({ text: 'Failed to delete content', type: 'error' });
            console.error('Error deleting content:', err);
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    return (
        <div className="home-content-container">
            <h2>{editingId ? 'Edit Content' : 'Add New Content'}</h2>
            
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="home-content-form">
                <div className="form-group">
                    <label htmlFor="title">Title <span className="required">*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter title"
                        required
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

                <div className="button-group">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <i className="fas fa-save"></i> {editingId ? 'Update Content' : 'Add Content'}
                            </>
                        )}
                    </button>
                    {editingId && (
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={resetForm}
                        >
                            <i className="fas fa-times"></i> Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="content-list">
                <h3>Existing Content</h3>
                <div className="content-grid">
                    {contentLoading ? (
                        <div className="loading-message">Loading content...</div>
                    ) : (
                        content.map(item => (
                            <div key={item._id} className="content-item">
                                <div className="content-content">
                                    <h4>{item.title}</h4>
                                    {item.image && (
                                        <div className="content-image-container">
                                            <img 
                                                src={`${UPLOADS_ENDPOINT}/${item.image}`}
                                                alt={item.title}
                                                onError={(e) => {
                                                    console.error('Error loading image:', e);
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="content-actions">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(item)}
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(item._id)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeContent; 