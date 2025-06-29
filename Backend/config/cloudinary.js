import { v2 as cloudinary } from 'cloudinary';

const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

// Debug function to safely show credential format
const debugEnvVar = (value) => {
    if (!value) return 'not set';
    if (value.includes(' ')) return 'contains spaces';
    if (value.startsWith('"') || value.startsWith("'")) return 'has quotes';
    if (value.length < 5) return 'too short';
    return `${value.substring(0, 3)}...${value.substring(value.length - 3)}` // Show first and last 3 chars
};

// Check for missing environment variables
console.log('\nChecking Cloudinary configuration:');
const envIssues = requiredEnvVars.map(envVar => {
    const value = process.env[envVar];
    const issues = [];
    
    if (!value) issues.push('missing');
    else {
        if (value.includes(' ')) issues.push('contains spaces');
        if (value.startsWith('"') || value.startsWith("'") || value.endsWith('"') || value.endsWith("'")) 
            issues.push('has quotes');
        if (value.length < 5) issues.push('too short');
    }
    
    return {
        variable: envVar,
        value: debugEnvVar(value),
        issues: issues
    };
});

const hasIssues = envIssues.some(env => env.issues.length > 0);
if (hasIssues) {
    console.error('\n❌ Found issues with Cloudinary environment variables:');
    envIssues.forEach(env => {
        if (env.issues.length > 0) {
            console.error(`- ${env.variable}:`);
            console.error(`  Value: ${env.value}`);
            console.error(`  Issues: ${env.issues.join(', ')}`);
        }
    });
    console.error('\nPlease ensure in .env file:');
    console.error('1. No quotes around values');
    console.error('2. No spaces before or after =');
    console.error('3. Values are copied exactly from Cloudinary dashboard');
    console.error('Example format:');
    console.error('CLOUDINARY_CLOUD_NAME=your_cloud_name');
} else {
    console.log('✅ Environment variables format looks correct');
}

// Configure Cloudinary
let cloudinaryConfigured = false;

try {
    // Check if all required variables are present
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Missing required Cloudinary environment variables');
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim()
    });
    
    // Test the configuration
    cloudinaryConfigured = true;
    console.log('✅ Cloudinary configured successfully');
} catch (error) {
    console.error('❌ Error configuring Cloudinary:', error.message);
    console.error('Current environment variables:');
    console.error('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set');
    console.error('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
    console.error('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');
}

export const uploadToCloudinary = async (buffer, folder = 'delta/services') => {
    if (!cloudinaryConfigured) {
        throw new Error('Cloudinary is not properly configured. Please check environment variables.');
    }

    if (!buffer) {
        throw new Error('No buffer provided for upload');
    }

    try {
        // Convert buffer to base64
        const b64 = Buffer.from(buffer).toString('base64');
        const dataURI = `data:image/jpeg;base64,${b64}`;
        
        const uploadOptions = {
            folder: folder,
            resource_type: 'auto',
            timeout: 60000 // 60 seconds timeout
        };

        console.log('Attempting to upload to Cloudinary...');
        const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
        
        if (!result || !result.secure_url) {
            throw new Error('Upload successful but no URL returned');
        }

        console.log('✅ Cloudinary upload successful:', {
            publicId: result.public_id,
            url: result.secure_url,
            format: result.format,
            size: result.bytes
        });

        return result.secure_url;
    } catch (error) {
        console.error('❌ Error uploading to Cloudinary:', {
            name: error.name,
            message: error.message,
            code: error.http_code,
            stack: error.stack
        });

        // Provide more specific error messages
        if (error.http_code === 401) {
            throw new Error('Authentication failed. Please check Cloudinary credentials.');
        } else if (error.http_code === 403) {
            throw new Error('Permission denied. Please check Cloudinary account permissions.');
        } else if (error.message.includes('timeout')) {
            throw new Error('Upload timed out. Please try again.');
        } else {
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
    }
};

export default cloudinary; 