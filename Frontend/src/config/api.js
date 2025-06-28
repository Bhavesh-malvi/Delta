// API Configuration
// Frontend URL: https://deltawaresolution.com
// Backend URL: https://delta-teal.vercel.app
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://delta-teal.vercel.app'  // Updated to the correct Vercel backend URL
    : 'http://localhost:5000';

// Timeout configuration
export const API_TIMEOUT = 60000; // 60 seconds

// API endpoints
export const ENDPOINTS = {
    HOME_CONTENT: '/api/homeContent',
    HOME_COURSE: '/api/homeCourse',
    HOME_SERVICE: '/api/homeService',
    SERVICE_CONTENT: '/api/serviceContent',
    CAREER: '/api/career',
    CONTACT: '/api/contact',
    ENROLL: '/api/enroll',
    HEALTH: '/api/health',
    ENROLL_COURSE: '/api/enrollCourse'
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error occurred. Please check your internet connection.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    NOT_FOUND: 'Resource not found.',
    UNAUTHORIZED: 'Unauthorized access.',
    FORBIDDEN: 'Access forbidden.',
    VALIDATION_ERROR: 'Validation error occurred.',
    DEFAULT: 'An unexpected error occurred.'
};

// Configure axios instance
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
    config => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
        }
        return config;
    },
    error => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    response => {
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Response:', response.status, response.config.url);
        }
        return response;
    },
    error => {
        if (error.response) {
            console.error('❌ API Error:', {
                url: error.config.url,
                method: error.config.method,
                status: error.response.status,
                data: error.response.data
            });
            error.userMessage = error.response.data?.message || ERROR_MESSAGES[`STATUS_${error.response.status}`] || ERROR_MESSAGES.DEFAULT;
        } else if (error.request) {
            console.error('🔍 Network Error:', error.message);
            error.userMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else {
            console.error('❌ Request Config Error:', error.message);
            error.userMessage = ERROR_MESSAGES.DEFAULT;
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 