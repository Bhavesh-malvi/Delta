import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../../config/api';
import './ServiceContent.css';

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

    const handleContainerClick = (e) => {
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
    };

    const addNewPoint = () => {
        setFormData(prev => ({
            ...prev,
            points: [...prev.points, '']
        }));
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
            title: content.title,
            description: content.description,
            image: null,
            points: content.points || ['', '', '', ''] // Handle existing points
        });
        setPreviewImage(content.image.startsWith('http') ? content.image : `${UPLOAD_URLS.SERVICES}/${content.image}`);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            
            // Append points as a JSON string
            formDataToSend.append('points', JSON.stringify(formData.points.filter(point => point.trim() !== '')));
            
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
        if (window.confirm('Are you sure you want to delete this content?')) {
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
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=Service+Image';
        
        // If the image path already contains the full URL, use it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // If it's just a filename, construct the full URL
        return `${UPLOAD_URLS.SERVICES}/${imagePath}`;
    };

    return (
        <Container className="service-content-container py-4">
            <h2 className="mb-4">{editingId ? 'Edit Content' : 'Add New Content'}</h2>

            {error && (
                <div className={`alert ${typeof error === 'object' ? (error.type === 'success' ? 'alert-success' : 'alert-danger') : 'alert-danger'} mb-4`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}

            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Upload Image {!editingId && <span className="text-danger">*</span>}</Form.Label>
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
                                    <div className="text-center">
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="mb-2"
                                            style={{ 
                                                maxHeight: '200px', 
                                                border: '2px solid rgba(0, 255, 135, 0.3)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <p>
                                            {formData.image ? formData.image.name : 'Current Image'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Content Title <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter content title"
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Content Description <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter content description"
                                required
                                disabled={loading}
                                rows={4}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Content Points <span className="text-danger">*</span></Form.Label>
                            <p className="text-muted small">Please provide at least 4 points about this service</p>
                            <div className="points-container">
                                {formData.points.map((point, index) => (
                                    <div key={index} className="d-flex gap-2 mb-2">
                                        <Form.Control
                                            type="text"
                                            value={point}
                                            onChange={(e) => handlePointChange(index, e.target.value)}
                                            placeholder={`Point ${index + 1}`}
                                            required
                                            disabled={loading}
                                        />
                                        {formData.points.length > 4 && (
                                            <Button
                                                variant="danger"
                                                onClick={() => deletePoint(index)}
                                                disabled={loading}
                                                className="flex-shrink-0"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="success"
                                    onClick={addNewPoint}
                                    disabled={loading}
                                    className="mt-2"
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    Add More Point
                                </Button>
                            </div>
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button 
                                type="submit" 
                                style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: '#000' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            className="me-2"
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    editingId ? 'Update Content' : 'Add Content'
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

            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Existing Content</h3>
                    <Button 
                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: '#000' }}
                        onClick={fetchContents}
                        disabled={loading}
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    </Button>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Loading contents...</p>
                        </div>
                    ) : contents.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-inbox fa-3x mb-3"></i>
                            <p>No contents available</p>
                        </div>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {contents.map(content => (
                                <Col key={content._id}>
                                    <Card className="h-100 service-content-card">
                                        <div className="card-img-wrapper" style={{ height: '200px', overflow: 'hidden' }}>
                                            <Card.Img
                                                variant="top"
                                                src={getImageUrl(content.image)}
                                                alt={content.title}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Service+Image';
                                                }}
                                                style={{ height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <Card.Body>
                                            <Card.Title>{content.title}</Card.Title>
                                            <Card.Text>{content.description}</Card.Text>
                                        </Card.Body>
                                        <Card.Footer className="d-flex justify-content-end gap-2">
                                            <button
                                                onClick={() => handleEdit(content)}
                                                className="action-btn edit"
                                                title="Edit"
                                                disabled={loading}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(content._id)}
                                                className="action-btn delete"
                                                title="Delete"
                                                disabled={loading}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ServiceContent;