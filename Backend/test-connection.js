import mongoose from 'mongoose';
import './config/env.js';

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@'));
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000
        });
        
        console.log('✅ MongoDB connected successfully');
        
        // Test database operations
        const collections = await mongoose.connection.db.collections();
        console.log('\nAvailable collections:');
        for (let collection of collections) {
            console.log(`- ${collection.collectionName}`);
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log('\nConnection closed successfully');
    } catch (error) {
        console.error('❌ Connection failed:', error);
        if (error.name === 'MongoServerSelectionError') {
            console.error('\nPossible issues:');
            console.error('1. MongoDB server is not running');
            console.error('2. Network connectivity issues');
            console.error('3. IP address not whitelisted in MongoDB Atlas');
            console.error('4. Invalid connection string');
        }
    } finally {
        process.exit();
    }
};

testConnection(); 