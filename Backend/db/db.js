import mongoose from "mongoose";
import debug from "debug";

const log = debug("app:db");

let cachedConnection = null;

const connectDB = async (app) => {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/delta";
    
    console.log("Attempting to connect to MongoDB...");
    
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
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
        if (app) {
            app.locals.dbConnected = false;
            console.log("Database connection flag set to false");
        }
        throw new Error("Failed to connect to MongoDB");
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

export default connectDB;






