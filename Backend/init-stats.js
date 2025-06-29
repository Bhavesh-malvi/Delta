import Stats from './models/Stats.js';
import connectDB from './db/db.js';
import './config/env.js';

const initializeStats = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        
        console.log('Checking for existing stats...');
        const existingStats = await Stats.findOne({});
        
        if (!existingStats) {
            console.log('No stats found, creating initial stats...');
            const initialStats = new Stats({
                totalEnrollments: 0,
                totalCourses: 0,
                totalServices: 0,
                totalCareers: 0,
                totalContacts: 0
            });
            
            await initialStats.save();
            console.log('Initial stats created successfully');
        } else {
            console.log('Stats already exist:', existingStats);
        }
    } catch (error) {
        console.error('Error initializing stats:', error);
        throw error;
    }
};

export default initializeStats; 