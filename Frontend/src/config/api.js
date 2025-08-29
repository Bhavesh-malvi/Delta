// API Configuration
// Frontend URL: https://deltawaresolution.com
// Backend URL: https://delta-teal.vercel.app
export const API_BASE_URL = 'https://delta-teal.vercel.app';  // Always use Vercel URL

// Timeout configuration
export const API_TIMEOUT = 60000; // 60 seconds

// Retry configuration
export const RETRY_CONFIG = {
    retries: 3, // Increased from 2 to 3
    initialDelayMs: 2000, // Increased from 1000 to 2000
    maxDelayMs: 10000, // Increased from 5000 to 10000
    statusCodesToRetry: [500, 502, 503, 504] // Added specific status codes to retry
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

// Utility function for handling image URLs
export const getImageUrl = (imagePath, fallbackImage = null) => {
    if (!imagePath) return fallbackImage;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Remove any leading slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Construct the full URL
    return `${API_BASE_URL}/${cleanPath}`;
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
    RETRYING: 'Connection issue detected. Retrying...',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Retrying...',
    STATUS_503: 'Service is starting up. Please wait...',
    STATUS_500: 'Server encountered an error. Retrying...'
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
        (RETRY_CONFIG.statusCodesToRetry.includes(error.response?.status) || !error.response);
    
    if (!shouldRetry) {
        return Promise.reject(error);
    }

    config.retryCount = retryCount + 1;
    const delay = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(2, retryCount),
        RETRY_CONFIG.maxDelayMs
    );

    // Add jitter to prevent all retries happening at exactly the same time
    const jitter = Math.random() * 1000;
    const finalDelay = delay + jitter;

    console.log(`🔄 Retrying request (${config.retryCount}/${RETRY_CONFIG.retries}) after ${Math.round(finalDelay)}ms`);
    
    if (error.response?.status === 503) {
        console.log('Service unavailable, waiting for startup...');
    }

    await wait(finalDelay);
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
            const status = error.response.status;
            console.error('❌ API Error:', {
                url: error.config.url,
                method: error.config.method,
                status: status,
                data: error.response.data,
                retryCount: error.config.retryCount
            });

            // Set user-friendly message based on status code
            error.userMessage = error.response.data?.message || 
                ERROR_MESSAGES[`STATUS_${status}`] || 
                (status >= 500 ? ERROR_MESSAGES.SERVER_ERROR : ERROR_MESSAGES.DEFAULT);

            // Special handling for 503
            if (status === 503) {
                error.userMessage = ERROR_MESSAGES.SERVICE_UNAVAILABLE;
                error.isStartupError = true;
            }
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