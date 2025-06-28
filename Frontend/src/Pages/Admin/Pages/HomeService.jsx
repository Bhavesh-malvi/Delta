import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { Card, Button, Row, Col, Form, Container } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCloudUploadAlt } from 'react-icons/fa';
import './HomeService.css';

const HomeService = () => {
    console.log('🏠 HomeService Component - Rendered!');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Fetch existing services
    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.HOME_SERVICE);
            
            if (response.data && Array.isArray(response.data.data)) {
                setServices(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setServices(response.data);
            } else {
                throw new Error('Invalid data format received');
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err.message || 'Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
        input.onchange = handleImageChange;
        input.click();
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
    };

    const handleEdit = (service) => {
        setEditingId(service._id);
        setFormData({
            title: service.title,
            description: service.description,
            image: null
        });
        const imageUrl = service.image.startsWith('http') ? service.image : `${API_BASE_URL}/uploads/${service.image}`;
        setPreviewImage(imageUrl);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingId && !formData.image) {
            setError('Please select an image');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            if (editingId) {
                await axiosInstance.put(
                    `${ENDPOINTS.HOME_SERVICE}/${editingId}`, 
                    formDataToSend,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                setError({ text: 'Service updated successfully!', type: 'success' });
            } else {
                await axiosInstance.post(
                    ENDPOINTS.HOME_SERVICE, 
                    formDataToSend,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                setError({ text: 'Service added successfully!', type: 'success' });
            }

            resetForm();
            fetchServices();
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to process your request');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                setLoading(true);
                await axiosInstance.delete(`${ENDPOINTS.HOME_SERVICE}/${id}`);
                setError({ text: 'Service deleted successfully!', type: 'success' });
                fetchServices();
            } catch (err) {
                console.error('Error deleting service:', err);
                setError(err.message || 'Failed to delete service');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Container fluid className="home-service-container py-4">
            <h2 className="text-center mb-4 text-success">
                {editingId ? 'Edit Service' : 'Add New Service'}
            </h2>
            
            {error && (
                <div className={`alert ${typeof error === 'object' ? (error.type === 'success' ? 'alert-success' : 'alert-danger') : 'alert-danger'} mb-4`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}
            
            <Card className="mb-4 bg-dark text-white border-success">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-success fw-bold">Service Image *</Form.Label>
                                    <div
                                        className="image-upload-container"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={handleContainerClick}
                                    >
                                        {previewImage ? (
                                            <div className="preview-container">
                                                <img src={previewImage} alt="Preview" className="preview-image" />
                                                <div className="preview-overlay">
                                                    <span className="text-white">Click to change image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <FaCloudUploadAlt className="upload-icon" />
                                                <p className="mb-2">Click to choose an image or drag it here</p>
                                                <small className="text-muted">Supports: JPG, PNG, GIF (Max: 5MB)</small>
                                            </div>
                                        )}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-success fw-bold">Service Title *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter service title"
                                        required
                                        className="bg-dark text-white border-success"
                                        size="lg"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-success fw-bold">Service Description *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter detailed service description"
                                        required
                                        className="bg-dark text-white border-success"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-start align-items-center pt-3 border-top border-success">
                            <div className="d-flex gap-3">
                                {editingId && (
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={resetForm}
                                        disabled={loading}
                                        size="lg"
                                    >
                                        Cancel Edit
                                    </Button>
                                )}
                                <Button 
                                    variant="success" 
                                    type="submit" 
                                    disabled={loading}
                                    size="lg"
                                    className="px-4"
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {editingId ? 'Updating Service...' : 'Adding Service...'}
                                        </>
                                    ) : (
                                        <>
                                            {editingId ? 'Update Service' : 'Add Service'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <div className="mt-5">
                <h3 className="text-center mb-4 text-success">Existing Services</h3>
                <Row>
                    {services.map((service) => (
                        <Col key={service._id} lg={4} md={6} className="mb-4">
                            <Card className="h-100 bg-dark text-white border-success">
                                <Card.Img 
                                    variant="top" 
                                    src={service.image.startsWith('http') ? service.image : `${API_BASE_URL}/uploads/${service.image}`}
                                    alt={service.title}
                                    className="service-image"
                                    onError={(e) => {
                                        console.error('Image failed to load:', e.target.src);
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                                    }}
                                />
                                <Card.Body>
                                    <Card.Title>{service.title}</Card.Title>
                                    <Card.Text>{service.description}</Card.Text>
                                    <div className="d-flex justify-content-between mt-3">
                                        <Button 
                                            variant="outline-success" 
                                            onClick={() => handleEdit(service)}
                                            disabled={loading}
                                            size="sm"
                                        >
                                            <FaEdit /> Edit
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            onClick={() => handleDelete(service._id)}
                                            disabled={loading}
                                            size="sm"
                                        >
                                            <FaTrash /> Delete
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                {services.length === 0 && (
                    <div className="text-center text-muted">
                        <p>No services available. Add your first service above.</p>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default HomeService; 