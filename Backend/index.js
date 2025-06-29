import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

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

// Load environment variables
import './config/env.js';
import './config/cloudinary.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




