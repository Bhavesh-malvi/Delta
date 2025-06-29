// API Configuration
// Frontend URL: https://deltawaresolution.com
// Backend URL: https://delta-teal.vercel.app
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://delta-teal.vercel.app'  // Production URL
    : 'http://localhost:5001';  // Updated local development port

// Timeout configuration
export const API_TIMEOUT = 60000; // 60 seconds

// Retry configuration
export const RETRY_CONFIG = {
    retries: 2,
    initialDelayMs: 1000,
    maxDelayMs: 5000
};

// API endpoints
export const ENDPOINTS = {
    HOME_CONTENT: '/api/v1/homeContent',
    HOME_COURSE: '/api/v1/homeCourse',
    HOME_SERVICE: '/api/v1/homeService',
    SERVICE_CONTENT: '/api/v1/serviceContent',
    CAREER: '/api/v1/career',
    CONTACT: '/api/v1/contact',
    ENROLL: '/api/v1/enroll',
    HEALTH: '/health',
    ENROLL_COURSE: '/api/v1/enrollCourse',
    STATS: '/api/v1/stats'
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
    DEFAULT: 'An unexpected error occurred.',
    RETRYING: 'Connection issue detected. Retrying...'
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

// Utility function for exponential backoff
const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// Retry request function
const retryRequest = async (config, error) => {
    const retryCount = config.retryCount || 0;
    const shouldRetry = retryCount < RETRY_CONFIG.retries && 
        (error.response?.status === 500 || !error.response);
    
    if (!shouldRetry) {
        return Promise.reject(error);
    }

    config.retryCount = retryCount + 1;
    const delay = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(2, retryCount),
        RETRY_CONFIG.maxDelayMs
    );

    console.log(`🔄 Retrying request (${config.retryCount}/${RETRY_CONFIG.retries})`);
    await wait(delay);
    return axiosInstance(config);
};

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
    config => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
        }
        // Initialize retry count
        config.retryCount = 0;
        return config;
    },
    error => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling and retry logic
axiosInstance.interceptors.response.use(
    response => {
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Response:', response.status, response.config.url);
        }
        return response;
    },
    async error => {
        // Try to retry the request if applicable
        if (error.config) {
            try {
                return await retryRequest(error.config, error);
            } catch (retryError) {
                error = retryError;
            }
        }

        // Handle final error
        if (error.response) {
            console.error('❌ API Error:', {
                url: error.config.url,
                method: error.config.method,
                status: error.response.status,
                data: error.response.data,
                retryCount: error.config.retryCount
            });
            error.userMessage = error.response.data?.message || 
                ERROR_MESSAGES[`STATUS_${error.response.status}`] || 
                ERROR_MESSAGES.DEFAULT;
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