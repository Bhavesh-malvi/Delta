import mongoose from "mongoose";
import debug from "debug";

const log = debug("app:db");

let cachedConnection = null;

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/delta";
    
    console.log("Attempting to connect to MongoDB...");
    
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully");
        return true;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
};

export default connectDB;






