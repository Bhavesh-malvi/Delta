import mongoose from "mongoose";
import debug from "debug";

const log = debug("app:db");

const connectDB = async (app) => {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@')); // Log URI safely
    
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            socketTimeoutMS: 45000, // 45 second timeout
        });
        console.log("MongoDB connected successfully");
        
        // Set the database connection flag
        if (app) {
            app.locals.dbConnected = true;
            console.log("Database connection flag set to true");
        }
        
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
        
        // Check specific error types
        if (error.name === 'MongoServerSelectionError') {
            console.error("Failed to reach MongoDB server. Please check if the connection string is correct and the server is running.");
        } else if (error.name === 'MongoParseError') {
            console.error("Invalid MongoDB connection string. Please check the format of MONGODB_URI.");
        }
        
        throw error; // Re-throw to be handled by the global error handler
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
    console.error('Error name:', err.name);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

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






