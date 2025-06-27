import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Try both environment variable names
        const uri = process.env.MONGO_URI;
        
        if (!uri) {
            throw new Error('MongoDB connection URI is not defined in environment variables');
        }

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        throw err; // Let the error propagate to be handled by the express error handler
    }
};

export default connectDB;






