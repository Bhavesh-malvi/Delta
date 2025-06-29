import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

// Check for required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('\nMissing required environment variables:');
    missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
    console.error('\nPlease set these variables in your .env file');
    process.exit(1);
}

// Set default values for optional environment variables
const optionalEnvVars = {
    NODE_ENV: 'development',
    PORT: '5001'
};

// Set optional environment variables if not already set
Object.entries(optionalEnvVars).forEach(([key, value]) => {
    if (!process.env[key]) {
        process.env[key] = value;
    }
});

// Log environment status (without sensitive info)
console.log('\nEnvironment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MongoDB:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not Set');
console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Not Set');
console.log('Port:', process.env.PORT);

export default process.env; 