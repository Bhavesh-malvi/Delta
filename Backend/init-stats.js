import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stats from './models/Stats.js';

dotenv.config();

const initializeStats = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000
        });
        
        console.log('Connected to MongoDB successfully');
        
        // Check if stats document exists
        console.log('Checking for existing stats...');
        const existingStats = await Stats.findOne();
        
        if (!existingStats) {
            console.log('No stats found. Creating initial stats...');
            const newStats = await Stats.create({
                customerCount: 21,
                displayedCount: 21
            });
            console.log('Initial stats created:', newStats);
        } else {
            console.log('Existing stats found:', existingStats);
        }
        
        console.log('Stats initialization completed successfully!');
    } catch (error) {
        console.error('Error during stats initialization:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the initialization
console.log('Starting stats initialization...');
initializeStats().then(() => {
    console.log('Initialization script completed');
    process.exit(0);
}).catch(error => {
    console.error('Initialization script failed:', error);
    process.exit(1);
}); 