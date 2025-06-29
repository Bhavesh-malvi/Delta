import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log("Already connected to MongoDB");
            return true;
        }
        
        console.log("Attempting to connect to MongoDB...");
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000
        });
        
        console.log("MongoDB connected successfully");
        
        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
            // Try to reconnect
            setTimeout(() => {
                console.log('Attempting to reconnect to MongoDB...');
                mongoose.connect(mongoURI).catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, 5000);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
            // Try to reconnect
            setTimeout(() => {
                console.log('Attempting to reconnect to MongoDB...');
                mongoose.connect(mongoURI).catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, 5000);
        });
        
        return true;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        if (error.name === 'MongoServerSelectionError') {
            console.error("Could not connect to MongoDB server. Please check:");
            console.error("1. MongoDB connection string is correct");
            console.error("2. MongoDB server is running and accessible");
            console.error("3. Network allows connection to MongoDB port");
            console.error("4. IP address is whitelisted in MongoDB Atlas");
        }
        throw error;
    }
};

export default connectDB;






