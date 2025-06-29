import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Default environment variables
const defaultEnv = {
    MONGODB_URI: 'mongodb+srv://bhaveshmalviya335:Bhavesh@cluster0.hljx43v.mongodb.net/?retryWrites=true&w=majority/delta',
    CLOUDINARY_CLOUD_NAME: 'do98lw5ja',
    CLOUDINARY_API_KEY: '937151688518423',
    CLOUDINARY_API_SECRET: 'W7n8ywPVSRxxh5BaFchK70_1mrM',
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5001
};

// Set environment variables if not already set
Object.entries(defaultEnv).forEach(([key, value]) => {
    if (!process.env[key]) {
        process.env[key] = value;
    }
});

// Log environment status (without sensitive info)
console.log('\nEnvironment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MongoDB:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not Set');
console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Not Set');

export default process.env; 