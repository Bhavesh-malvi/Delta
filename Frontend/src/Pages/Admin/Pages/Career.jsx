import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, API_BASE_URL } from '../../../config/api';
import './Career.css';

const Career = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        points: [''],
        image: null
    });
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.CAREER);
            console.log('Fetched careers:', response.data);
            if (response.data && Array.isArray(response.data)) {
                setCareers(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setCareers(response.data.data);
            } else {
                setError('Invalid data format received');
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching careers:', err);
            setError(err.userMessage || 'Failed to fetch careers');
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

    const handlePointChange = (index, value) => {
        const newPoints = [...formData.points];
        newPoints[index] = value;
        setFormData(prev => ({
            ...prev,
            points: newPoints
        }));
    };

    const addPoint = () => {
        setFormData(prev => ({
            ...prev,
            points: [...prev.points, '']
        }));
    };

    const removePoint = (index) => {
        if (formData.points.length > 1) {
            const newPoints = formData.points.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                points: newPoints
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
                setError('Please upload an image file');
                e.target.value = '';
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            points: [''],
            image: null
        });
        setPreviewImage(null);
        setEditingId(null);
        setError(null);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    const handleEdit = (career) => {
        setEditingId(career._id);
        
        // Convert old Point fields to points array if they exist
        let points = [''];
        if (career.points && Array.isArray(career.points)) {
            points = career.points;
        } else {
            // Handle legacy Point1, Point2, etc. fields
            const legacyPoints = [];
            for (let i = 1; i <= 7; i++) {
                if (career[`Point${i}`]) {
                    legacyPoints.push(career[`Point${i}`]);
                }
            }
            points = legacyPoints.length > 0 ? legacyPoints : [''];
        }

        setFormData({
            title: career.title,
            description: career.description,
            points: points,
            image: null
        });
        setPreviewImage(`${API_BASE_URL}${career.image}`);
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
            
            // Filter out empty points and send as JSON string
            const filteredPoints = formData.points.filter(point => point.trim() !== '');
            formDataToSend.append('points', JSON.stringify(filteredPoints));
            
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
                    `${ENDPOINTS.CAREER}/${editingId}`, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Career updated successfully!', type: 'success' });
            } else {
                await axiosInstance.post(
                    ENDPOINTS.CAREER, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Career added successfully!', type: 'success' });
            }

            resetForm();
            fetchCareers();
        } catch (err) {
            console.error(editingId ? 'Error updating career:' : 'Error adding career:', err);
            setError(err.userMessage || (editingId ? 'Failed to update career' : 'Failed to add career'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.CAREER}/${id}`);
            setError({ text: 'Career deleted successfully!', type: 'success' });
            fetchCareers();
        } catch (err) {
            console.error('Error deleting career:', err);
            setError(err.userMessage || 'Failed to delete career');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="career-container">
            <h2>{editingId ? 'Edit Career' : 'Add New Career'}</h2>
            
            {error && (
                <div className={`message ${typeof error === 'object' ? error.type : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="career-form">
                <div className="form-group">
                    <label htmlFor="image">Career Image {!editingId && <span className="required">*</span>}</label>
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
                    <label htmlFor="title">Career Title <span className="required">*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter career title"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Career Description <span className="required">*</span></label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter career description"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>Key Points</label>
                    <div className="points-container">
                        {formData.points.map((point, index) => (
                            <div key={index} className="point-input-group">
                                <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => handlePointChange(index, e.target.value)}
                                    placeholder={`Enter point ${index + 1}`}
                                    disabled={loading}
                                    className="point-input"
                                />
                                {formData.points.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePoint(index)}
                                        className="remove-point-btn"
                                        disabled={loading}
                                        title="Remove point"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addPoint}
                            className="add-point-btn"
                            disabled={loading}
                        >
                            <i className="fas fa-plus"></i> Add Point
                        </button>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Processing...
                            </>
                        ) : (
                            editingId ? 'Update Career' : 'Add Career'
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

            <div className="existing-careers">
                <h3>Existing Careers</h3>
                {loading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading careers...
                    </div>
                ) : careers.length === 0 ? (
                    <div className="no-careers">
                        <i className="fas fa-inbox"></i>
                        <p>No careers available</p>
                    </div>
                ) : (
                <div className="careers-list">
                    {careers.map(career => (
                        <div key={career._id} className="career-item">
                            <div className="career-content">
                                <h4>{career.title}</h4>
                                {career.image && (
                                    <div className="career-image-container">
                                        <img 
                                            src={`${API_BASE_URL}${career.image}`}
                                            alt={career.title} 
                                            onLoad={() => console.log('Image loaded successfully:', `${API_BASE_URL}${career.image}`)}
                                            onError={(e) => {
                                                console.error('Image failed to load:', e.target.src);
                                                console.error('Career image path:', career.image);
                                                console.error('Full image URL:', `${API_BASE_URL}${career.image}`);
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder-career.jpg';
                                            }}
                                        />
                                    </div>
                                )}
                                <p>{career.description}</p>
                                <div className="career-details">
                                    {career.points && career.points.length > 0 && (
                                        <div className="career-points">
                                            <h5>Key Points:</h5>
                                            <ul>
                                                {career.points.map((point, index) => (
                                                    <li key={index}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="career-actions">
                                <button 
                                    onClick={() => handleEdit(career)}
                                    className="edit-btn"
                                    title="Edit"
                                    disabled={loading}
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    onClick={() => handleDelete(career._id)}
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

export default Career; 