// Load environment variables first
import './config/env.js';

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Import cloudinary config after env vars are loaded
import './config/cloudinary.js';

// Import routes
import enrollRoutes from './Routes/enrollRoutes.js';
import homeContentRoutes from './Routes/homeContentRoutes.js';
import homeCourseRoutes from './Routes/homeCourseRoutes.js';
import homeServiceRoutes from './Routes/homeServiceRoutes.js';
import serviceContentRoutes from './Routes/serviceContentRoutes.js';
import careerRoutes from './Routes/careerRoutes.js';
import contactRoutes from './Routes/contactRoutes.js';
import enrollCourseRoutes from './Routes/enrollCourseRoutes.js';
import statsRoutes from './Routes/statsRoutes.js';

// Import database connection
import connectDB from './db/db.js';

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['https://deltawaresolution.com', 'http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        if (req.originalUrl.includes('career')) {
            uploadPath += 'careers/';
        } else if (req.originalUrl.includes('content')) {
            uploadPath += 'content/';
        } else if (req.originalUrl.includes('service')) {
            uploadPath += 'services/';
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Mount routes
app.use('/api/v1/enroll', enrollRoutes);
app.use('/api/v1/homeContent', homeContentRoutes);
app.use('/api/v1/homeCourse', homeCourseRoutes);
app.use('/api/v1/homeService', homeServiceRoutes);
app.use('/api/v1/serviceContent', serviceContentRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/enrollCourse', enrollCourseRoutes);
app.use('/api/v1/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();




