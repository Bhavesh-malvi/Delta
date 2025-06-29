import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db/db.js';
import debug from 'debug';
import mongoose from 'mongoose';
import multer from 'multer';

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
        cb(null, path.join(__dirname, 'uploads/services'));
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
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);
    console.log('Request Headers:', req.headers);
    next();
});

// Static folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/homeContent', homeContentRoutes);
app.use('/api/homeCourse', homeCourseRoutes);
app.use('/api/homeService', homeServiceRoutes);
app.use('/api/serviceContent', serviceContentRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/enrollCourse', enrollCourseRoutes);
app.use('/api/stats', statsRoutes);

// Root
app.get('/', (req, res) => {
    res.json({message: 'Welcome to the Delta API'});
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        routes: [
            '/api/homeContent',
            '/api/homeCourse', 
            '/api/homeService',
            '/api/serviceContent',
            '/api/career',
            '/api/contact',
            '/api/enroll',
            '/api/enrollCourse'
        ]
    });
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
    
    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState;
    console.log('Database connection state:', dbStatus);
    
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
    
    // Send appropriate error response
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
            'GET /api/health',
            'POST /api/test',
            'GET /api/homeContent',
            'GET /api/homeCourse',
            'GET /api/homeService', 
            'GET /api/serviceContent',
            'GET /api/career',
            'GET /api/contact',
            'GET /api/enroll',
            'GET /api/enrollCourse'
        ]
    });
});

// Initialize database connection
let dbInitialized = false;

const initializeDB = async () => {
    if (!dbInitialized) {
        try {
            console.log('Initializing database connection...');
            await connectDB(app);
            dbInitialized = true;
            console.log('Database initialized successfully');

            // Initialize stats after DB connection
            try {
                const Stats = (await import('./models/Stats.js')).default;
                const stats = await Stats.findOne();
                if (!stats) {
                    await Stats.create({});
                    console.log('Stats initialized successfully');
                }
            } catch (error) {
                console.error('Error initializing stats:', error);
                // Don't throw here, just log the error
            }
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }
};

// Middleware to ensure database is connected
app.use(async (req, res, next) => {
    try {
        if (!dbInitialized) {
            await initializeDB();
        }
        next();
    } catch (error) {
        console.error('Database initialization error:', error);
        res.status(503).json({
            success: false,
            message: 'Database connection error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
        });
    }
});

// Remove the startServer function and export the app
export default app;




