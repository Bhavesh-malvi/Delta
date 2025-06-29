import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db/db.js';
import debug from 'debug';
import mongoose from 'mongoose';
import multer from 'multer';
import './config/cloudinary.js';

// Import routes
import homeContentRoutes from './Routes/homeContentRoutes.js';
import homeCourseRoutes from './Routes/homeCourseRoutes.js';
import homeServiceRoutes from './Routes/homeServiceRoutes.js';
import serviceContentRoutes from './Routes/serviceContentRoutes.js';
import careerRoutes from './Routes/careerRoutes.js';
import contactRoutes from './Routes/contactRoutes.js';
import enrollRoutes from './Routes/enrollRoutes.js';
import enrollCourseRoutes from './Routes/enrollCourseRoutes.js';
import statsRoutes from './Routes/statsRoutes.js';

dotenv.config();

const log = debug('app:server');

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['https://deltawaresolution.com', 'https://www.deltawaresolution.com', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    optionsSuccessStatus: 204
};

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('/tmp', 'uploads/services'));
    },
    filename: function (req, file, cb) {
        const uniqueName = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) cb(null, true);
        else cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
    }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Request Headers:', req.headers);
    next();
});

// Initialize database connection
let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        // Check all required environment variables
        const requiredEnvVars = [
            'MONGODB_URI',
            'CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY',
            'CLOUDINARY_API_SECRET'
        ];

        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            keepAlive: true,
            keepAliveInitialDelay: 300000
        });
        
        console.log('MongoDB connected successfully');
        isConnected = true;
        
        // Initialize stats if needed
        const Stats = (await import('./models/Stats.js')).default;
        const stats = await Stats.findOne();
        
        if (!stats) {
            await Stats.create({
                customerCount: 21,
                displayedCount: 21
            });
            console.log('Stats initialized successfully');
        }
    } catch (error) {
        console.error('Failed to connect to database:', error);
        throw error;
    }
};

// Routes
app.use('/api/v1', async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        next(error);
    }
});

app.use('/api/v1', homeContentRoutes);
app.use('/api/v1', homeCourseRoutes);
app.use('/api/v1', homeServiceRoutes);
app.use('/api/v1', serviceContentRoutes);
app.use('/api/v1', careerRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1', enrollRoutes);
app.use('/api/v1', enrollCourseRoutes);
app.use('/api/v1/stats', statsRoutes);

// Root
app.get('/', (req, res) => {
    res.json({message: 'Welcome to the Delta API'});
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await connectToDatabase();
        res.json({
            status: 'ok',
            message: 'Server is running',
            dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Test endpoint
app.post('/api/test', (req, res) => {
    console.log('Test endpoint hit:', req.body);
    res.json({success: true, message: 'Test endpoint working', data: req.body});
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    
    if (res.headersSent) {
        return next(err);
    }
    
    const dbStatus = mongoose.connection.readyState;
    
    // Handle specific error types
    if (err.name === 'MongoServerSelectionError') {
        return res.status(503).json({
            success: false,
            message: 'Database connection error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Database connection error',
            dbConnected: false
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Invalid data provided',
            dbConnected: dbStatus === 1
        });
    }

    if (err.message && err.message.includes('Missing required environment variables')) {
        return res.status(500).json({
            success: false,
            message: 'Server configuration error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
            dbConnected: dbStatus === 1
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {},
        dbConnected: dbStatus === 1
    });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /api/v1/homeContent',
            'GET /api/v1/homeCourse',
            'GET /api/v1/homeService', 
            'GET /api/v1/serviceContent',
            'GET /api/v1/career',
            'GET /api/v1/contact',
            'GET /api/v1/enroll',
            'GET /api/v1/enrollCourse',
            'GET /api/v1/stats'
        ]
    });
});

export default app;




