import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance, { ENDPOINTS } from '../../../config/api';
import './EnrollCourses.css';

const EnrollCourses = () => {
    const [formData, setFormData] = useState({
        courseName: ''
    });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(ENDPOINTS.ENROLL_COURSE);
            if (response.data && Array.isArray(response.data.data)) {
                setCourses(response.data.data);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.message || 'Failed to fetch courses');
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

    const resetForm = () => {
        setFormData({
            courseName: ''
        });
        setEditingId(null);
        setError(null);
    };

    const handleEdit = (course) => {
        setEditingId(course._id);
        setFormData({
            courseName: course.courseName
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);

            if (editingId) {
                await axiosInstance.put(`${ENDPOINTS.ENROLL_COURSE}/${editingId}`, formData);
                setError({ text: 'Course updated successfully!', type: 'success' });
            } else {
                await axiosInstance.post(ENDPOINTS.ENROLL_COURSE, formData);
                setError({ text: 'Course added successfully!', type: 'success' });
            }

            resetForm();
            fetchCourses();
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to process your request');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                setLoading(true);
                await axiosInstance.delete(`${ENDPOINTS.ENROLL_COURSE}/${id}`);
                setError({ text: 'Course deleted successfully!', type: 'success' });
                fetchCourses();
            } catch (err) {
                console.error('Error deleting course:', err);
                setError(err.message || 'Failed to delete course');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Container fluid className="enroll-courses-container py-4">
            <h2 className="text-center mb-4 text-success">
                {editingId ? 'Edit Enrollment Course' : 'Add New Enrollment Course'}
            </h2>
            
            {error && (
                <div className={`alert ${typeof error === 'object' ? (error.type === 'success' ? 'alert-success' : 'alert-danger') : 'alert-danger'} mb-4`}>
                    {typeof error === 'object' ? error.text : error}
                </div>
            )}
            
            <Card className="mb-4 bg-dark text-white border-success">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Course Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="courseName"
                                value={formData.courseName}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter course name"
                                className="bg-dark text-white"
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                            <Button 
                                variant="success" 
                                type="submit" 
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (editingId ? 'Update Course' : 'Add Course')}
                            </Button>
                            {editingId && (
                                <Button 
                                    variant="secondary" 
                                    onClick={resetForm}
                                    disabled={loading}
                                >
                                    Cancel Edit
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Row>
                {courses.map((course) => (
                    <Col key={course._id} md={4} className="mb-4">
                        <Card className="h-100 bg-dark text-white border-success">
                            <Card.Body>
                                <Card.Title>{course.courseName}</Card.Title>
                                <div className="d-flex justify-content-between mt-3">
                                    <Button
                                        variant="outline-success"
                                        onClick={() => handleEdit(course)}
                                        disabled={loading}
                                    >
                                        <FaEdit /> Edit
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => handleDelete(course._id)}
                                        disabled={loading}
                                    >
                                        <FaTrash /> Delete
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default EnrollCourses; 