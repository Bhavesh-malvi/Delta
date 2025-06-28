import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import logo1 from '../../../assets/img/logo1.jpg';
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
            if (response.data && Array.isArray(response.data)) {
                setCareers(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setCareers(response.data.data);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching careers:', err);
            setError(err.response?.data?.message || 'Failed to fetch careers');
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
        setError(null);
    };

    const handlePointChange = (index, value) => {
        const newPoints = [...formData.points];
        newPoints[index] = value;
        setFormData(prev => ({
            ...prev,
            points: newPoints
        }));
        setError(null);
    };

    const addPoint = () => {
        if (formData.points.length < 10) {
            setFormData(prev => ({
                ...prev,
                points: [...prev.points, '']
            }));
        }
    };

    const removePoint = (index) => {
        if (formData.points.length > 1) {
            setFormData(prev => ({
                ...prev,
                points: formData.points.filter((_, i) => i !== index)
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
            setError(null);
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
    };

    const handleEdit = (career) => {
        setEditingId(career._id);
        setFormData({
            title: career.title || '',
            description: career.description || '',
            points: Array.isArray(career.points) && career.points.length > 0 ? career.points : [''],
            image: null
        });
        setPreviewImage(career.image ? career.image : logo1);
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

        // Validate points
        const validPoints = formData.points.filter(point => point.trim() !== '');
        if (validPoints.length === 0) {
            setError('Please add at least one point');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('description', formData.description.trim());
            data.append('points', JSON.stringify(validPoints));

            if (formData.image) {
                data.append('image', formData.image);
                console.log('📁 Image being sent:', formData.image);
                console.log('📁 Image name:', formData.image.name);
                console.log('📁 Image type:', formData.image.type);
                console.log('📁 Image size:', formData.image.size);
            } else {
                console.log('📁 No image selected');
            }

            console.log('📤 FormData contents:');
            for (let [key, value] of data.entries()) {
                console.log(`${key}:`, value);
            }

            // Set correct headers for multipart/form-data
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingId) {
                await axiosInstance.put(`${ENDPOINTS.CAREER}/${editingId}`, data, config);
            } else {
                await axiosInstance.post(ENDPOINTS.CAREER, data, config);
            }

            resetForm();
            await fetchCareers();
            setError({ type: 'success', text: `Career ${editingId ? 'updated' : 'added'} successfully!` });
        } catch (err) {
            console.error('Error submitting career:', err);
            setError(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} career`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this career?')) return;

        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.CAREER}/${id}`);
            await fetchCareers();
            setError({ type: 'success', text: 'Career deleted successfully!' });
        } catch (err) {
            console.error('Error deleting career:', err);
            setError(err.response?.data?.message || 'Failed to delete career');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return logo1;
        return imagePath; // Cloudinary URLs are already complete URLs
    };

    return (
        <div className="career-container">
            <h2>{editingId ? 'Edit Career' : 'Add New Career'}</h2>

            {error && (
                <div className={`message ${typeof error === 'object' ? (error.type === 'success' ? 'success' : 'error') : 'error'}`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}

            <form className="career-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Upload Image</label>
                    <div className="image-upload-container">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="image-input"
                        />
                        {!previewImage ? (
                            <div className="upload-label">
                                <i className="fas fa-cloud-upload-alt"></i>
                                <p>Choose an image or drag it here</p>
                            </div>
                        ) : (
                            <div className="image-preview">
                                <img src={previewImage} alt="Preview" />
                                <p className="file-name">
                                    {formData.image ? formData.image.name : 'Current Image'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Title <span className="required">*</span></label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter career title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description <span className="required">*</span></label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter career description"
                        required
                        rows={4}
                    />
                </div>

                <div className="points-section">
                    <label>Points <span className="required">*</span></label>
                    {formData.points.map((point, index) => (
                        <div key={index} className="point-input-container">
                            <input
                                type="text"
                                value={point}
                                onChange={(e) => handlePointChange(index, e.target.value)}
                                placeholder={`Point ${index + 1}`}
                                required
                            />
                            {formData.points.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePoint(index)}
                                    className="remove-point-btn"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.points.length < 10 && (
                        <button
                            type="button"
                            onClick={addPoint}
                            className="add-point-btn"
                        >
                            <i className="fas fa-plus"></i> Add Point
                        </button>
                    )}
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
                                {editingId ? ' Updating...' : ' Creating...'}
                            </>
                        ) : (
                            editingId ? 'Update Career' : 'Add Career'
                        )}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="cancel-btn"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="existing-courses">
                <h3>Existing Careers</h3>
                <div className="careers-list">
                    {loading && !careers.length ? (
                        <div className="loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading careers...</p>
                        </div>
                    ) : careers.length === 0 ? (
                        <div className="no-data">
                            <p>No careers available</p>
                        </div>
                    ) : (
                        careers.map(career => (
                            <div key={career._id} className="career-item">
                                <div className="career-image-container">
                                    <img
                                        src={getImageUrl(career.image)}
                                        alt={career.title}
                                        className="career-image"
                                        onError={(e) => {
                                            console.log('❌ Image failed to load:', e.target.src);
                                            e.target.onerror = null;
                                            e.target.src = logo1;
                                        }}
                                        onLoad={(e) => {
                                            console.log('✅ Image loaded successfully:', e.target.src);
                                        }}
                                    />
                                </div>
                                <div className="career-content">
                                    <h4>{career.title}</h4>
                                    <p>{career.description}</p>
                                    {Array.isArray(career.points) && career.points.length > 0 && (
                                        <ul>
                                            {career.points.map((point, index) => (
                                                <li key={index}>{point}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="career-actions">
                                    <button
                                        onClick={() => handleEdit(career)}
                                        className="action-btn edit"
                                        disabled={loading}
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(career._id)}
                                        className="action-btn delete"
                                        disabled={loading}
                                    >
                                        <i className="fas fa-trash"></i>
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

export default Career;