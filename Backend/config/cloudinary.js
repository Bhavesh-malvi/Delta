import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file) => {
    try {
        if (!file) return null;
        
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
            timeout: 10000 // Increase timeout to 10 seconds
        });
        
        return uploadResponse.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image');
    }
};

export default cloudinary; 