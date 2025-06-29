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
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Test the configuration
    cloudinary.api.ping()
        .then(() => console.log('✅ Cloudinary connection test successful'))
        .catch(error => console.error('❌ Cloudinary connection test failed:', error.message));
} catch (error) {
    console.error('❌ Error configuring Cloudinary:', error.message);
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