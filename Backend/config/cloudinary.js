import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (buffer) => {
    try {
        // Convert buffer to base64
        const b64 = Buffer.from(buffer).toString('base64');
        const dataURI = `data:image/jpeg;base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'delta/services',
            resource_type: 'auto'
        });
        
        console.log('Cloudinary upload result:', result);
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

export default cloudinary; 