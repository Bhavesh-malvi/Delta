import mongoose from "mongoose";
import debug from "debug";

const log = debug("app:db");

let cachedConnection = null;

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/delta";
    
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", mongoURI);
    
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        console.log("Continuing without database connection for testing...");
    }
};

export default connectDB;






