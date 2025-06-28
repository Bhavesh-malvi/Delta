import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required Cloudinary environment variables:', missingEnvVars);
    throw new Error(`Missing required Cloudinary environment variables: ${missingEnvVars.join(', ')}`);
}

// Configure Cloudinary
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Cloudinary configured successfully');
} catch (error) {
    console.error('Error configuring Cloudinary:', error);
    throw error;
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