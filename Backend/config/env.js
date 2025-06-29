import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables directly
process.env.NODE_ENV = 'development';
process.env.PORT = '5001';

// MongoDB connection string (updated format)
process.env.MONGODB_URI = 'mongodb+srv://bhaveshmalviya335:Bhavesh@cluster0.hljx43v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Cloudinary credentials
process.env.CLOUDINARY_CLOUD_NAME = 'do98lw5ja';
process.env.CLOUDINARY_API_KEY = '937151688518423';
process.env.CLOUDINARY_API_SECRET = 'W7n8ywPVSRxxh5BaFchK70_1mrM';

// Log environment status (without sensitive info)
console.log('\nEnvironment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MongoDB:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not Set');
console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Not Set');
console.log('Port:', process.env.PORT);

export default process.env; 