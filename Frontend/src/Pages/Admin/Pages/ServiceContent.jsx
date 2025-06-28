import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../../config/api';
import './ServiceContent.css';
import logo1 from '../../../assets/img/logo1.jpg';

const ServiceContent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
        points: ['', '', '', ''] // Initialize with 4 empty points
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
            if (response.data && Array.isArray(response.data)) {
                setContents(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setContents(response.data.data);
            } else {
                setError('Invalid data format received');
            }
        } catch (err) {
            console.error('Error fetching contents:', err);
            setError(err.response?.data?.message || 'Failed to fetch contents');
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
        // Clear error when user starts typing
        setError(null);
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
        if (file) {
            try {
                const compressedFile = await compressImage(file);
                setFormData(prev => ({ ...prev, image: compressedFile }));
                setPreviewImage(URL.createObjectURL(compressedFile));
                setError(null);
            } catch (error) {
                console.error('Error processing image:', error);
                setError('Error processing image. Please try again.');
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageChange({ target: { files: [file] } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleContainerClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => handleImageChange(e);
        input.click();
    };

    const handlePointChange = (index, value) => {
        const newPoints = [...formData.points];
        newPoints[index] = value;
        setFormData(prev => ({ ...prev, points: newPoints }));
        setError(null);
    };

    const addNewPoint = () => {
        if (formData.points.length < 10) {
            setFormData(prev => ({
                ...prev,
                points: [...prev.points, '']
            }));
        }
    };

    const deletePoint = (indexToDelete) => {
        if (formData.points.length > 4) {
            setFormData(prev => ({
                ...prev,
                points: prev.points.filter((_, index) => index !== indexToDelete)
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image: null,
            points: ['', '', '', '']
        });
        setPreviewImage(null);
        setEditingId(null);
        setError(null);
    };

    const handleEdit = (content) => {
        setEditingId(content._id);
        setFormData({
            title: content.title || '',
            description: content.description || '',
            image: null,
            points: Array.isArray(content.points) && content.points.length >= 4 ? 
                content.points : ['', '', '', '']
        });
        setPreviewImage(getImageUrl(content.image));
        setError(null);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.title?.trim()) {
            setError('Title is required');
            return;
        }

        if (!formData.description?.trim()) {
            setError('Description is required');
            return;
        }

        if (!editingId && !formData.image) {
            setError('Please select an image');
            return;
        }

        // Validate points
        const validPoints = formData.points.filter(point => point.trim() !== '');
        if (validPoints.length < 4) {
            setError('Please provide at least 4 non-empty points');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Create FormData object
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('description', formData.description.trim());
            
            // Filter out empty points and append
            data.append('points', JSON.stringify(validPoints));
            
            // Only append image if it exists (required for new content or optional for edit)
            if (formData.image) {
                data.append('image', formData.image);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            let response;
            if (editingId) {
                response = await axiosInstance.put(
                    `${ENDPOINTS.SERVICE_CONTENT}/${editingId}`, 
                    data,
                    config
                );
                console.log('Content updated successfully:', response.data);
            } else {
                response = await axiosInstance.post(
                    ENDPOINTS.SERVICE_CONTENT, 
                    data,
                    config
                );
                console.log('Content created successfully:', response.data);
            }

            // Reset form and refresh list
            resetForm();
            await fetchContents();
            
            // Show success message
            setError({
                type: 'success',
                text: `Content ${editingId ? 'updated' : 'added'} successfully!`
            });
        } catch (err) {
            console.error('Error submitting content:', err);
            setError(
                err.response?.data?.message || 
                err.message || 
                `Failed to ${editingId ? 'update' : 'add'} content`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this content?')) return;
        
        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.SERVICE_CONTENT}/${id}`);
            await fetchContents();
            setError({
                type: 'success',
                text: 'Content deleted successfully!'
            });
        } catch (err) {
            console.error('Error deleting content:', err);
            setError(err.response?.data?.message || 'Failed to delete content');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return logo1;
        return imagePath.startsWith('http') ? imagePath : `${UPLOAD_URLS.SERVICES}/${imagePath}`;
    };

    return (
        <div className="service-content-container">
            <h2>{editingId ? 'Edit Content' : 'Add New Content'}</h2>

            {error && (
                <div className={`message ${typeof error === 'object' ? (error.type === 'success' ? 'success' : 'error') : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}

            <form className="service-content-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Upload Image {!editingId && <span className="required">*</span>}</label>
                    <div 
                        className="image-upload-container"
                        onClick={handleContainerClick}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        {!previewImage ? (
                            <div className="upload-label">
                                <i className="fas fa-cloud-upload-alt"></i>
                                <p>Choose an image or drag it here</p>
                            </div>
                        ) : (
                            <div className="image-preview">
                                <img 
                                    src={previewImage} 
                                    alt="Preview" 
                                />
                                <p className="file-name">
                                    {formData.image ? formData.image.name : 'Current Image'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Content Title <span className="required">*</span></label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter content title"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>Content Description <span className="required">*</span></label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter content description"
                        required
                        disabled={loading}
                        rows={4}
                    />
                </div>

                <div className="form-group">
                    <label>Content Points <span className="required">*</span></label>
                    <p className="text-muted">Please provide at least 4 points about this service</p>
                    <div className="points-section">
                        {formData.points.map((point, index) => (
                            <div key={index} className="point-input-container">
                                <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => handlePointChange(index, e.target.value)}
                                    placeholder={`Point ${index + 1}`}
                                    required={index < 4}
                                    disabled={loading}
                                />
                                {index >= 4 && (
                                    <button
                                        type="button"
                                        className="remove-point-btn"
                                        onClick={() => deletePoint(index)}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                        {formData.points.length < 10 && (
                            <button
                                type="button"
                                className="add-point-btn"
                                onClick={addNewPoint}
                                disabled={loading}
                            >
                                <i className="fas fa-plus"></i>
                                Add More Point
                            </button>
                        )}
                    </div>
                </div>

                <div className="form-buttons">
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                {editingId ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            editingId ? 'Update Content' : 'Create Content'
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

            <div className="existing-services">
                <h3>Service Contents</h3>
                <div className="services-list">
                    {loading && !contents.length ? (
                        <div className="loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading...</p>
                        </div>
                    ) : contents.length === 0 ? (
                        <div className="no-content">
                            <p>No service contents found</p>
                        </div>
                    ) : (
                        contents.map(content => (
                            <div key={content._id} className="service-item">
                                <div className="service-image-container">
                                    <img 
                                        src={getImageUrl(content.image)}
                                        alt={content.title}
                                        className="service-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = logo1;
                                        }}
                                    />
                                </div>
                                <div className="service-content">
                                    <h4>{content.title}</h4>
                                    <p>{content.description}</p>
                                    {Array.isArray(content.points) && content.points.length > 0 && (
                                        <div className="points-list">
                                            <strong>Points:</strong>
                                            <ul>
                                                {content.points.map((point, index) => (
                                                    <li key={index}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="service-actions">
                                    <button
                                        className="action-btn edit"
                                        onClick={() => handleEdit(content)}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-edit"></i>
                                        Edit
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(content._id)}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceContent;