// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

// Base URLs
export const API_BASE_URL = isDevelopment 
    ? 'http://localhost:5000'
    : 'https://delta-theta-one.vercel.app';

// Timeout configuration
export const API_TIMEOUT = 60000; // 60 seconds

// API endpoints
export const ENDPOINTS = {
    HOME_CONTENT: '/api/homecontent',
    HOME_COURSE: '/api/homecourse',
    HOME_SERVICE: '/api/homeservice',
    SERVICE_CONTENT: '/api/servicecontent',
    CAREER: '/api/career',
    CONTACT: '/api/contact',
    ENROLL: '/api/enroll'
};

// Default headers
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json'
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

// Configure axios defaults
import axios from 'axios';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = API_TIMEOUT;
axios.defaults.headers.common = DEFAULT_HEADERS;

// Add response interceptor for error handling
axios.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        
        if (error.response) {
            // Server responded with error
            const status = error.response.status;
            const message = error.response.data?.message || ERROR_MESSAGES[`STATUS_${status}`] || ERROR_MESSAGES.DEFAULT;
            error.userMessage = message;
        } else if (error.request) {
            // No response received
            error.userMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else {
            // Error in request configuration
            error.userMessage = ERROR_MESSAGES.DEFAULT;
        }
        
        return Promise.reject(error);
    }
);

export const UPLOADS_BASE_URL = 'https://delta-theta-one.vercel.app/uploads'; 