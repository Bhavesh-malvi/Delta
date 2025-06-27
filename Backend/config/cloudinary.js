import { v2 as cloudinary } from 'cloudinary';
import debug from 'debug';

const log = debug('app:cloudinary');

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
    console.log('Checking Cloudinary configuration...');
    
    const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('Missing Cloudinary environment variables:', missingVars);
        throw new Error(`Missing Cloudinary environment variables: ${missingVars.join(', ')}`);
    }

    // Log configuration (but hide sensitive data)
    console.log('Cloudinary Configuration:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? '****' : undefined,
        api_secret: process.env.CLOUDINARY_API_SECRET ? '****' : undefined
    });
};

// Initialize Cloudinary configuration
try {
    validateCloudinaryConfig();
    
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Test the configuration
    cloudinary.api.ping()
        .then(result => {
            console.log('✅ Cloudinary connection successful:', result);
        })
        .catch(error => {
            console.error('❌ Cloudinary connection failed:', error.message);
            throw error;
        });

    log('Cloudinary configured successfully');
} catch (error) {
    console.error('Error configuring Cloudinary:', error);
    throw error;
}

export const uploadToCloudinary = async (file) => {
    try {
        if (!file) {
            console.log('No file provided to upload');
            return null;
        }
        
        console.log('Starting file upload to Cloudinary...', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        // Convert buffer to base64
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        // Upload to cloudinary with optimization settings
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'ml_default',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' }, // Limit max dimensions
                { quality: 'auto:good' }, // Auto optimize quality
                { fetch_format: 'auto' } // Auto select best format
            ],
            timeout: 60000 // Increase timeout to 60 seconds
        });
        
        console.log('✅ Upload successful:', {
            public_id: uploadResponse.public_id,
            url: uploadResponse.secure_url,
            format: uploadResponse.format,
            size: uploadResponse.bytes
        });

        return uploadResponse.secure_url;
    } catch (error) {
        console.error('❌ Error uploading to Cloudinary:', error);
        // Add more context to the error
        const enhancedError = new Error('Failed to upload image to Cloudinary');
        enhancedError.originalError = error;
        enhancedError.details = {
            message: error.message,
            code: error.http_code || error.code,
            type: error.name
        };
        throw enhancedError;
    }
};

export default cloudinary; 