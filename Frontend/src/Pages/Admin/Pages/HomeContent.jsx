import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { Card, Form, Button, Row, Col, Container, Alert } from 'react-bootstrap';
import { FaCloudUploadAlt, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import './HomeContent.css';
import axiosInstance, { ENDPOINTS, UPLOAD_URLS } from '../../../config/api';

const HomeContent = () => {
    const [formData, setFormData] = useState({
        title: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
        setContentLoading(true);
            setMessage({ text: '', type: '' });
            
            const response = await axiosInstance.get(ENDPOINTS.HOME_CONTENT);
            
            if (response.data.success) {
                setContents(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch content');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            let errorMessage = 'Failed to fetch content';
            
            if (error.response) {
                // Server responded with error
                errorMessage = error.response.data.message || 'Server error occurred';
                console.error('Server error:', error.response.data);
            } else if (error.request) {
                // No response received
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Other error
                errorMessage = error.message;
            }
            
            setMessage({ 
                text: errorMessage, 
                type: 'error' 
            });
            setContents([]);
        } finally {
            setContentLoading(false);
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
        if (!file) return;

        try {
            // Show preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(file);

            // Compress image
            const compressedFile = await compressImage(file);
            setFormData(prev => ({ ...prev, image: compressedFile }));
        } catch (error) {
            console.error('Error processing image:', error);
            setMessage({
                text: 'Error processing image. Please try again.',
                type: 'error'
            });
        }
    };

    const resetForm = () => {
        setFormData({ title: '', image: null });
        setPreviewImage(null);
        setEditingId(null);
        setUploadProgress(0);
        setMessage({ text: '', type: '' });
    };

    const handleEdit = (content) => {
        setEditingId(content._id);
        setFormData({
            title: content.title,
            image: null
        });
        setPreviewImage(content.image.startsWith('http') ? content.image : `${API_BASE_URL}${content.image}`);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editingId && !formData.image) {
            setMessage({ text: 'Please select an image', type: 'error' });
            return;
        }

        try {
        setLoading(true);
        setMessage({ text: '', type: '' });

            const data = new FormData();
            data.append('title', formData.title);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            };

            let response;
            if (editingId) {
                response = await axiosInstance.put(
                    `${ENDPOINTS.HOME_CONTENT}/${editingId}`,
                    data,
                    config
                );
                setMessage({ text: 'Content updated successfully', type: 'success' });
            } else {
                response = await axiosInstance.post(
                    ENDPOINTS.HOME_CONTENT,
                    data,
                    config
                );
                setMessage({ text: 'Content added successfully', type: 'success' });
            }

            // Reset form
            resetForm();
            
            // Refresh content list
            fetchContent();
        } catch (error) {
            console.error('Error:', error);
            setMessage({ 
                text: error.userMessage || 'Error processing your request',
                type: 'error' 
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`${ENDPOINTS.HOME_CONTENT}/${id}`);
            setMessage({ text: 'Content deleted successfully!', type: 'success' });
            fetchContent();
        } catch (err) {
            console.error('Error deleting content:', err);
            setMessage(err.userMessage || 'Failed to delete content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-content-container">
            <h2>{editingId ? 'Edit Content' : 'Add New Content'}</h2>

            {message.text && (
                <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                    {message.text}
                    {message.type === 'error' && (
                        <button 
                            className="retry-btn"
                            onClick={() => {
                                setMessage({ text: '', type: '' });
                                fetchContent();
                            }}
                        >
                            <i className="fas fa-sync-alt"></i> Retry
                        </button>
                    )}
                </Alert>
            )}

            <Card className="mb-4 bg-dark text-white border-success">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-success">
                                Title {!editingId && <span className="text-danger">*</span>}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                                placeholder="Enter title"
                                className="bg-dark text-white border-success"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-success">
                                Upload Image {!editingId && <span className="text-danger">*</span>}
                            </Form.Label>
                            <div className="image-upload-container bg-dark border border-success rounded p-3">
                                <Form.Control
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="d-none"
                                    disabled={loading}
                                />
                                <label className="w-100 h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer">
                                    {!previewImage ? (
                                        <>
                                            <FaCloudUploadAlt size={40} className="mb-2 text-success" />
                                            <span>Choose an image or drag it here</span>
                                        </>
                                    ) : (
                                        <div className="position-relative w-100 h-100">
                                            <img 
                                                src={previewImage} 
                                                alt="Preview" 
                                                className="img-fluid rounded" 
                                                style={{maxHeight: '300px', objectFit: 'contain'}} 
                                            />
                                        </div>
                                    )}
                                </label>
                            </div>
                        </Form.Group>

                        <div className="d-flex gap-3">
                            <Button 
                                type="submit" 
                                variant="success" 
                                className="flex-grow-1"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="spinner me-2" />
                                        Processing...
                                    </>
                                ) : (
                                    editingId ? 'Update Content' : 'Add Content'
                                )}
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

            <h3 className="text-center mb-4 text-success">Existing Content</h3>
            
            {loading ? (
                <div className="text-center">
                    <FaSpinner className="spinner text-success" size={40} />
                </div>
            ) : contents.length === 0 ? (
                <div className="text-center text-muted">
                    <FaCloudUploadAlt size={40} className="mb-2" />
                    <p>No content added yet</p>
                </div>
            ) : (
                <Row className="g-4">
                    {contents.map(item => (
                        <Col key={item._id} xs={12} sm={6} lg={4}>
                            <Card className="h-100 bg-dark text-white border-success hover-card">
                                <div className="card-img-container">
                                    <Card.Img 
                                        variant="top" 
                                        src={item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`}
                                        alt={item.title}
                                        className="service-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </div>
                                <Card.Body>
                                    <Card.Title className="text-success">{item.title}</Card.Title>
                                </Card.Body>
                                <Card.Footer className="bg-dark border-success">
                                    <div className="d-flex gap-2 justify-content-end">
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => handleEdit(item)}
                                            disabled={loading}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(item._id)}
                                            disabled={loading}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default HomeContent; 