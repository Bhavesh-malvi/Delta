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
app.use('/api/v1', homeContentRoutes);
app.use('/api/v1', homeCourseRoutes);
app.use('/api/v1', homeServiceRoutes);
app.use('/api/v1', serviceContentRoutes);
app.use('/api/v1', careerRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1', enrollRoutes);
app.use('/api/v1', enrollCourseRoutes);
app.use('/api/v1', statsRoutes);

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
            '/api/v1/homeContent',
            '/api/v1/homeCourse', 
            '/api/v1/homeService',
            '/api/v1/serviceContent',
            '/api/v1/career',
            '/api/v1/contact',
            '/api/v1/enroll',
            '/api/v1/enrollCourse'
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
            'GET /api/v1/homeContent',
            'GET /api/v1/homeCourse',
            'GET /api/v1/homeService', 
            'GET /api/v1/serviceContent',
            'GET /api/v1/career',
            'GET /api/v1/contact',
            'GET /api/v1/enroll',
            'GET /api/v1/enrollCourse'
        ]
    });
});

// Initialize database connection
const initializeDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        
        console.log('MongoDB connected successfully');
        
        // Initialize stats
        console.log('Initializing stats...');
        const Stats = (await import('./models/Stats.js')).default;
        const stats = await Stats.findOne();
        
        if (!stats) {
            await Stats.create({
                customerCount: 21,
                displayedCount: 21
            });
            console.log('Stats initialized successfully');
        } else {
            console.log('Stats already exist');
        }
    } catch (error) {
        console.error('Failed to initialize:', error);
        process.exit(1);
    }
};

// Initialize database and stats
initializeDB().then(() => {
    // Mount routes after DB initialization
    app.use('/api/v1', homeContentRoutes);
    app.use('/api/v1', homeCourseRoutes);
    app.use('/api/v1', homeServiceRoutes);
    app.use('/api/v1', serviceContentRoutes);
    app.use('/api/v1', careerRoutes);
    app.use('/api/v1', contactRoutes);
    app.use('/api/v1', enrollRoutes);
    app.use('/api/v1', enrollCourseRoutes);
    app.use('/api/v1', statsRoutes);

    // Health check route
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            message: 'Server is running',
            dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default app;




