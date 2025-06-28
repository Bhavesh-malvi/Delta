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
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=Service+Image';
        return imagePath.startsWith('http') ? imagePath : `${UPLOAD_URLS.SERVICES}/${imagePath}`;
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
                                            required={index < 4}
                                            disabled={loading}
                                        />
                                        {index >= 4 && (
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
                                {formData.points.length < 10 && (
                                    <Button
                                        variant="success"
                                        onClick={addNewPoint}
                                        disabled={loading}
                                        className="mt-2"
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Add More Point
                                    </Button>
                                )}
                            </div>
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={loading}
                                className="flex-grow-1"
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            className="me-2"
                                        />
                                        {editingId ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    editingId ? 'Update Content' : 'Create Content'
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
                <Card.Header>
                    <h4 className="mb-0">Service Contents</h4>
                </Card.Header>
                <Card.Body>
                    {loading && !contents.length ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                        </div>
                    ) : contents.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="mb-0">No service contents found</p>
                        </div>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {contents.map(content => (
                                <Col key={content._id}>
                                    <Card className="h-100 content-card">
                                        <div className="card-img-wrapper">
                                            <Card.Img 
                                                variant="top" 
                                                src={getImageUrl(content.image)}
                                                alt={content.title}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Service+Image';
                                                }}
                                            />
                                        </div>
                                        <Card.Body>
                                            <Card.Title>{content.title}</Card.Title>
                                            <Card.Text>{content.description}</Card.Text>
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
                                        </Card.Body>
                                        <Card.Footer className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleEdit(content)}
                                                disabled={loading}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(content._id)}
                                                disabled={loading}
                                            >
                                                Delete
                                            </Button>
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