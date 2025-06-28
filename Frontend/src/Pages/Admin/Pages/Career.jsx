import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS, API_BASE_URL } from '../../../config/api';
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
        const fileInput = document.getElementById('careerImage');
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
        
        // Set preview image path
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

    return (
        <Container className="career-container py-4">
            <h2 className="mb-4">{editingId ? 'Edit Career' : 'Add New Career'}</h2>

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
                            <Form.Label>Career Title <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter career title"
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Career Description <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter career description"
                                required
                                disabled={loading}
                                rows={4}
                            />
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button 
                                type="submit" 
                                style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
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
                                    editingId ? 'Update Career' : 'Add Career'
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
                    <h3 className="mb-0">Existing Careers</h3>
                    <Button 
                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: '#000' }}
                        onClick={fetchCareers}
                        disabled={loading}
                    >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    </Button>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Loading careers...</p>
                        </div>
                    ) : careers.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-inbox fa-3x mb-3"></i>
                            <p>No careers available</p>
                        </div>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {careers.map(career => (
                                <Col key={career._id}>
                                    <Card className="h-100 career-card">
                                        <div className="card-img-wrapper" style={{ height: '200px', overflow: 'hidden' }}>
                                            <Card.Img
                                                variant="top"
                                                src={`${API_BASE_URL}${career.image}`}
                                                alt={career.title}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder-career.jpg';
                                                }}
                                                style={{ height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <Card.Body>
                                            <Card.Title>{career.title}</Card.Title>
                                            <Card.Text>{career.description}</Card.Text>
                                        </Card.Body>
                                        <Card.Footer className="d-flex justify-content-end gap-2">
                                            <button
                                                onClick={() => handleEdit(career)}
                                                className="action-btn edit"
                                                title="Edit"
                                                disabled={loading}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(career._id)}
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

export default Career;