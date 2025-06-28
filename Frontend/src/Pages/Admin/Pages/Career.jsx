import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../../config/api';
import './Career.css';

const Career = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        points: [''],
        image: null,
        experience: '',
        location: ''
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
        if (formData.points.length < 10) { // Limit to 10 points
            setFormData(prev => ({
                ...prev,
                points: [...prev.points, '']
            }));
        }
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
            } catch (error) {
                console.error('Error processing image:', error);
                setError('Error processing image. Please try again.');
            }
        }
    };

    // Helper functions for drag and drop
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

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=Career+Image';
        
        // If the image path already contains the full URL, use it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // If it starts with a slash, it's a relative path from the API base
        if (imagePath.startsWith('/')) {
            return `https://delta-teal.vercel.app${imagePath}`;
        }
        
        // If it's just a filename, construct the full URL
        return `${UPLOAD_URLS.CAREERS}/${imagePath}`;
    };

    const handleEdit = (career) => {
        setEditingId(career._id);
        setFormData({
            title: career.title || '',
            description: career.description || '',
            points: Array.isArray(career.points) && career.points.length > 0 ? career.points : [''],
            image: null
        });
        setPreviewImage(getImageUrl(career.image));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate points
            const validPoints = formData.points.filter(point => point.trim().length > 0);
            if (validPoints.length === 0) {
                throw new Error('At least one point is required');
            }

            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('points', JSON.stringify(validPoints));
            
            if (formData.image) {
                data.append('image', formData.image);
            }

            if (editingId) {
                await axiosInstance.put(`${ENDPOINTS.CAREER}/${editingId}`, data);
            } else {
                await axiosInstance.post(ENDPOINTS.CAREER, data);
            }

            await fetchCareers();
            resetForm();
        } catch (err) {
            console.error('Error submitting career:', err);
            setError(err.response?.data?.message || err.message || 'Failed to submit career');
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
        } catch (err) {
            console.error('Error deleting career:', err);
            setError(err.response?.data?.message || 'Failed to delete career');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="career-admin-container">
            <Row>
                <Col md={12} lg={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h4>{editingId ? 'Edit Career' : 'Add New Career'}</h4>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <div className="alert alert-danger">{error}</div>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Points</Form.Label>
                                    {formData.points.map((point, index) => (
                                        <div key={index} className="point-input-group mb-2">
                                            <Form.Control
                                                type="text"
                                                value={point}
                                                onChange={(e) => handlePointChange(index, e.target.value)}
                                                placeholder={`Point ${index + 1}`}
                                            />
                                            <div className="point-actions">
                                                {index > 0 && (
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => removePoint(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {formData.points.length < 10 && (
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={addPoint}
                                            className="mt-2"
                                        >
                                            Add Point
                                        </Button>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Image</Form.Label>
                                    <div
                                        className="image-upload-container"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={handleContainerClick}
                                    >
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="preview-image"
                                            />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <i className="fas fa-cloud-upload-alt"></i>
                                                <p>Click or drag image here</p>
                                            </div>
                                        )}
                                    </div>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-grow-1"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" />
                                                {editingId ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            editingId ? 'Update Career' : 'Create Career'
                                        )}
                                    </Button>
                                    {editingId && (
                                        <Button 
                                            variant="secondary"
                                            onClick={resetForm}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={12} lg={8}>
                    <Card>
                        <Card.Header>
                            <h4>Career Listings</h4>
                        </Card.Header>
                        <Card.Body>
                            {loading && !careers.length ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" />
                                </div>
                            ) : careers.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="mb-0">No careers found</p>
                                </div>
                            ) : (
                                <div className="career-grid">
                                    {careers.map(career => (
                                        <Card key={career._id} className="career-card">
                                            <Card.Img 
                                                variant="top" 
                                                src={getImageUrl(career.image)}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Career+Image';
                                                }}
                                            />
                                            <Card.Body>
                                                <Card.Title>{career.title}</Card.Title>
                                                <Card.Text>{career.description}</Card.Text>
                                                
                                                {Array.isArray(career.points) && career.points.length > 0 && (
                                                    <div className="points-list">
                                                        <strong>Points:</strong>
                                                        <ul>
                                                            {career.points.map((point, index) => (
                                                                <li key={index}>{point}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                
                                                <div className="d-flex gap-2 mt-3">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleEdit(career)}
                                                        disabled={loading}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(career._id)}
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Career;