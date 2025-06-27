import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS, API_BASE_URL } from '../../../config/api';
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

    const handlePointChange = (index, value) => {
        setFormData(prev => {
            const newPoints = [...prev.points];
            newPoints[index] = value;
            return {
                ...prev,
                points: newPoints
            };
        });
    };

    const addNewPoint = () => {
        setFormData(prev => ({
            ...prev,
            points: [...prev.points, '']
        }));
    };

    const deletePoint = (indexToDelete) => {
        // Don't allow deleting if only 4 points remain
        if (formData.points.length <= 4) {
            setError('Minimum 4 points are required');
            return;
        }

        setFormData(prev => ({
            ...prev,
            points: prev.points.filter((_, index) => index !== indexToDelete)
        }));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image: null,
            points: ['', '', '', ''] // Reset points too
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
            image: null,
            points: content.points || ['', '', '', ''] // Handle existing points
        });
        setPreviewImage(content.image.startsWith('http') ? content.image : `${API_BASE_URL}/uploads/services/${content.image}`);
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
                            <div className="image-upload-container border rounded p-3">
                                <Form.Control
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    disabled={loading}
                                    className="mb-3"
                                />
                                {!previewImage ? (
                                    <div className="text-center text-muted">
                                        <i className="fas fa-cloud-upload-alt fa-2x mb-2"></i>
                                        <p>Choose an image or drag it here</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="img-thumbnail mb-2"
                                            style={{ maxHeight: '200px' }}
                                        />
                                        <p className="text-muted">
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
                                variant="primary"
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
                    <h3 className="mb-0">Existing Contents</h3>
                    <Button 
                        variant="outline-primary"
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
                                    <Card className="h-100">
                                        <div className="card-img-wrapper" style={{ height: '200px', overflow: 'hidden' }}>
                                            <Card.Img
                                                variant="top"
                                                src={content.image.startsWith('http') ? content.image : `${API_BASE_URL}/uploads/services/${content.image}`}
                                                alt={content.title}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder-content.jpg';
                                                }}
                                                style={{ height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <Card.Body>
                                            <Card.Title>{content.title}</Card.Title>
                                            <Card.Text>{content.description}</Card.Text>
                                        </Card.Body>
                                        <Card.Footer className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="primary"
                                                onClick={() => handleEdit(content)}
                                                disabled={loading}
                                                size="sm"
                                            >
                                                <i className="fas fa-edit me-1"></i> Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDelete(content._id)}
                                                disabled={loading}
                                                size="sm"
                                            >
                                                <i className="fas fa-trash me-1"></i> Delete
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