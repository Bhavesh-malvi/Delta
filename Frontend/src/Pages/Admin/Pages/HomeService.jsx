import React, { useState, useEffect } from 'react';
import axiosInstance, { ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { Card, Button, Row, Col, Form, Container } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCloudUploadAlt } from 'react-icons/fa';
import './HomeService.css';

const HomeService = () => {
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
            console.log('Raw API Response:', response);
            console.log('Services data:', response.data);
            
            if (response.data && Array.isArray(response.data.data)) {
                const services = response.data.data.map(service => ({
                    ...service,
                    image: service.image || '/placeholder-service.jpg'
                }));
                console.log('Processed services:', services);
                setServices(services);
            } else if (response.data && Array.isArray(response.data)) {
                const services = response.data.map(service => ({
                    ...service,
                    image: service.image || '/placeholder-service.jpg'
                }));
                console.log('Processed services:', services);
                setServices(services);
            } else {
                setError('Invalid data format received');
                console.error('Invalid data format:', response.data);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err.userMessage || 'Failed to fetch services');
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
            image: null
        });
        setPreviewImage(null);
        setEditingId(null);
        setError(null);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    const handleEdit = (service) => {
        setEditingId(service._id);
        setFormData({
            title: service.title,
            description: service.description,
            image: null
        });
        // Handle both Cloudinary and local URLs
        const imageUrl = service.image.startsWith('http') ? service.image : `${API_BASE_URL}${service.image}`;
        setPreviewImage(imageUrl);
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
                    `${ENDPOINTS.HOME_SERVICE}/${editingId}`, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Service updated successfully!', type: 'success' });
            } else {
                await axiosInstance.post(
                    ENDPOINTS.HOME_SERVICE, 
                    formDataToSend, 
                    config
                );
                setError({ text: 'Service added successfully!', type: 'success' });
            }

            resetForm();
            fetchServices();
        } catch (err) {
            console.error(editingId ? 'Error updating service:' : 'Error adding service:', err);
            setError(err.userMessage || (editingId ? 'Failed to update service' : 'Failed to add service'));
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
                setError(err.userMessage || 'Failed to delete service');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Container fluid className="home-service-container py-4">
            <h2 className="text-center mb-4 text-success">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            
            {error && (
                <div className={`alert ${typeof error === 'object' ? (error.type === 'success' ? 'alert-success' : 'alert-danger') : 'alert-danger'} mb-4`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}
            
            <Card className="mb-4 bg-dark text-white border-success">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-success">Upload Image {!editingId && <span className="text-danger">*</span>}</Form.Label>
                            <div className="image-upload-container bg-dark border border-success rounded p-3">
                                <Form.Control
                                    type="file"
                                    id="image"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="d-none"
                                    disabled={loading}
                                />
                                <label htmlFor="image" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer">
                                    {!previewImage ? (
                                        <>
                                            <FaCloudUploadAlt size={40} className="mb-2 text-success" />
                                            <span>Choose an image or drag it here</span>
                                        </>
                                    ) : (
                                        <div className="position-relative w-100 h-100">
                                            <img src={previewImage} alt="Preview" className="img-fluid rounded" style={{maxHeight: '300px', objectFit: 'contain'}} />
                                        </div>
                                    )}
                                </label>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-success">Title <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="bg-dark text-white border-success"
                                placeholder="Enter service title"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-success">Description <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                className="bg-dark text-white border-success"
                                placeholder="Enter service description"
                                rows={4}
                            />
                        </Form.Group>

                        <div className="d-flex gap-3">
                            <Button 
                                type="submit" 
                                variant="success" 
                                className="flex-grow-1"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (editingId ? 'Update Service' : 'Add Service')}
                            </Button>
                            {editingId && (
                                <Button 
                                    type="button" 
                                    variant="outline-danger" 
                                    className="flex-grow-1"
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

            <h3 className="text-center mb-4 text-success">Existing Services</h3>
            
            {loading && (
                <div className="text-center">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            
            {!loading && services.length === 0 && (
                <div className="text-center text-muted">
                    <FaCloudUploadAlt size={40} className="mb-2" />
                    <p>No services added yet</p>
                </div>
            )}
            
            <Row className="g-4">
                {services.map((service, index) => {
                    // Handle different URL formats and provide fallback
                    let imageUrl;
                    try {
                        if (!service.image) {
                            imageUrl = `${API_BASE_URL}/placeholder-service.jpg`;
                        } else if (service.image.startsWith('http')) {
                            imageUrl = service.image;
                        } else if (service.image.startsWith('/')) {
                            imageUrl = `${API_BASE_URL}${service.image}`;
                        } else {
                            imageUrl = `${API_BASE_URL}/${service.image}`;
                        }
                    } catch (error) {
                        console.error('Error processing image URL:', error);
                        imageUrl = `${API_BASE_URL}/placeholder-service.jpg`;
                    }
                    
                    console.log(`Rendering service ${index + 1}:`, {
                        id: service._id,
                        title: service.title,
                        originalImage: service.image,
                        computedUrl: imageUrl
                    });
                    
                    return (
                        <Col key={service._id} xs={12} sm={6} lg={4}>
                            <Card className="h-100 bg-dark text-white border-success hover-card">
                                <div className="card-img-container">
                                    <Card.Img 
                                        variant="top" 
                                        src={imageUrl}
                                        alt={service.title}
                                        className="service-image"
                                        onError={(e) => {
                                            console.error('Image failed to load:', {
                                                originalSrc: e.target.src,
                                                serviceImage: service.image,
                                                computedUrl: imageUrl,
                                                serviceId: service._id,
                                                error: e.error
                                            });
                                            e.target.onerror = null;
                                            e.target.src = `${API_BASE_URL}/placeholder-service.jpg`;
                                        }}
                                        onLoad={() => {
                                            console.log('Image loaded successfully:', {
                                                serviceId: service._id,
                                                title: service.title,
                                                originalImage: service.image,
                                                computedUrl: imageUrl
                                            });
                                        }}
                                    />
                                </div>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-success">{service.title}</Card.Title>
                                    <Card.Text className="flex-grow-1">{service.description}</Card.Text>
                                    <div className="mt-auto d-flex justify-content-end gap-3">
                                        <button 
                                            onClick={() => handleEdit(service)}
                                            className="action-btn edit"
                                            title="Edit"
                                            disabled={loading}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(service._id)}
                                            className="action-btn delete"
                                            title="Delete"
                                            disabled={loading}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </Container>
    );
};

export default HomeService; 