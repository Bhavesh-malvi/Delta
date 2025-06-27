import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
// Import routes
import homeCourseRoutes from './Routes/homeCourseRoutes.js';
import homeContentRoutes from './Routes/homeContentRoutes.js';
import homeServiceRoutes from './Routes/homeServiceRoutes.js';
import serviceContentRoutes from './Routes/serviceContentRoutes.js';
import careerRoutes from './Routes/careerRoutes.js';
import contactRoutes from './Routes/contactRoutes.js';
import enrollRoutes from './Routes/enrollRoutes.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

// CORS configuration - Allow all origins during development
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Log static file requests
app.use('/uploads', (req, res, next) => {
    console.log('Static file requested:', req.url);
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/homecourses', homeCourseRoutes);
app.use('/api/homecontent', homeContentRoutes);
app.use('/api/homeservices', homeServiceRoutes);
app.use('/api/servicecontent', serviceContentRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/enrolls', enrollRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Delta API' });
});
// MongoDB connection
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

