import { v2 as cloudinary } from 'cloudinary';

const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.warn(`Warning: Missing Cloudinary environment variables: ${missingEnvVars.join(', ')}`);
    // Don't throw error, just warn
}

// Configure Cloudinary
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'default',
        api_key: process.env.CLOUDINARY_API_KEY || 'default',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'default'
    });
    console.log('Cloudinary configured successfully');
} catch (error) {
    console.error('Error configuring Cloudinary:', error);
}

export const uploadToCloudinary = async (buffer, folder = 'delta/services') => {
    if (!buffer) {
        throw new Error('No buffer provided for upload');
    }

    try {
        // Convert buffer to base64
        const b64 = Buffer.from(buffer).toString('base64');
        const dataURI = `data:image/jpeg;base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folder,
            resource_type: 'auto'
        });
        
        console.log('Cloudinary upload successful. URL:', result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.http_code
        });
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

export default cloudinary; 