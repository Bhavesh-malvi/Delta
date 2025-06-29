import mongoose from "mongoose";
import debug from "debug";

const log = debug("app:db");

let isConnected = false;

const connectDB = async (app) => {
    if (isConnected) {
        console.log('Using existing database connection');
        return true;
    }

    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@')); // Log URI safely
    
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // Increased timeout to 30 seconds
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true,
        bufferCommands: false, // Disable mongoose buffering
        autoIndex: true, // Build indexes
        maxConnecting: 10,
        connectTimeoutMS: 30000, // Connection timeout also increased to 30 seconds
        heartbeatFrequencyMS: 10000 // Check connection status every 10 seconds
    };
    
    try {
        // Clear any existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        // Connect to MongoDB
        await mongoose.connect(mongoURI, options);
        isConnected = true;
        console.log("MongoDB connected successfully");
        
        // Set the database connection flag
        if (app) {
            app.locals.dbConnected = true;
            console.log("Database connection flag set to true");
        }

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
            isConnected = true;
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
            console.error('Error name:', err.name);
            console.error('Error code:', err.code);
            console.error('Error message:', err.message);
            isConnected = false;
            if (app) {
                app.locals.dbConnected = false;
            }
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
            isConnected = false;
            if (app) {
                app.locals.dbConnected = false;
            }
        });
        
        return true;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        console.error("Error name:", error.name);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        if (app) {
            app.locals.dbConnected = false;
            console.log("Database connection flag set to false");
        }
        
        isConnected = false;
        
        // Check specific error types
        if (error.name === 'MongoServerSelectionError') {
            console.error("Failed to reach MongoDB server. Please check if the connection string is correct and the server is running.");
        } else if (error.name === 'MongoParseError') {
            console.error("Invalid MongoDB connection string. Please check the format of MONGODB_URI.");
        }
        
        throw error;
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing Mongoose connection:', err);
        process.exit(1);
    }
});

export default connectDB;






