// API Configuration
// Frontend URL: https://deltawaresolution.com
// Backend URL: https://delta-teal.vercel.app
export const API_BASE_URL = 'https://delta-teal.vercel.app';

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
    HEALTH: '/api/health'
};

// Upload URLs
export const UPLOAD_URLS = {
    SERVICES: `${API_BASE_URL}/uploads/services`,
    CAREERS: `${API_BASE_URL}/uploads/careers`,
    CONTENT: `${API_BASE_URL}/uploads/content`,
    HOME_CONTENT: `${API_BASE_URL}/uploads/content`
};

// Default headers
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
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
    headers: DEFAULT_HEADERS,
    withCredentials: false // Important for CORS
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
    config => {
        console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
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
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    error => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });
        
        if (error.response) {
            // Server responded with error
            const status = error.response.status;
            const message = error.response.data?.message || ERROR_MESSAGES[`STATUS_${status}`] || ERROR_MESSAGES.DEFAULT;
            error.userMessage = message;
            
            // Log specific error details
            console.error(`🔍 Server Error (${status}):`, error.response.data);
        } else if (error.request) {
            // No response received
            error.userMessage = ERROR_MESSAGES.NETWORK_ERROR;
            console.error('🔍 Network Error: No response received');
        } else {
            // Error in request configuration
            error.userMessage = ERROR_MESSAGES.DEFAULT;
            console.error('🔍 Request Config Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance; 