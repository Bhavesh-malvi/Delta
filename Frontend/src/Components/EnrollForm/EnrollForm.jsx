import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axiosInstance, { ENDPOINTS } from '../../config/api';
import './EnrollForm.css';

const EnrollForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        course: '',
        message: ''
    });

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axiosInstance.get(ENDPOINTS.ENROLL_COURSE);
            if (response.data && Array.isArray(response.data.data)) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses. Please try again later.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axiosInstance.post(ENDPOINTS.ENROLL, formData);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                course: '',
                message: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="enroll-form-container">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <div className="form-wrapper">
                        <h2 className="text-center mb-4">Enroll Now</h2>
                        
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        
                        {success && (
                            <div className="alert alert-success" role="alert">
                                Enrollment submitted successfully! We'll contact you soon.
                            </div>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your name"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your phone number"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Course</Form.Label>
                                <Form.Select
                                    name="course"
                                    value={formData.course}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course.courseName}>
                                            {course.courseName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Message (Optional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Any additional message..."
                                />
                            </Form.Group>

                            <Button 
                                type="submit" 
                                className="w-100" 
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Enrollment'}
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default EnrollForm;