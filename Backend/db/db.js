import mongoose from "mongoose";
import debug from "debug";

const log = debug("app:db");

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        log("Using cached database connection");
        return cachedConnection;
    }

    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Cache the connection
        cachedConnection = conn;
        
        // Handle connection errors
        conn.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
            cachedConnection = null;
        });

        conn.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
            cachedConnection = null;
        });

        return conn;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};

export default connectDB;






