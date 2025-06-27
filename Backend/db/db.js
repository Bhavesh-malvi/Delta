import mongoose from "mongoose";
import debug from "debug";

const log = debug("app:database");

const connectDB = async () => {
    try {
        log("Connecting to MongoDB...");
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });

        log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle MongoDB connection errors
        mongoose.connection.on("error", (err) => {
            log("MongoDB connection error:", err);
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            log("MongoDB disconnected");
            console.warn("MongoDB disconnected");
        });

        mongoose.connection.on("reconnected", () => {
            log("MongoDB reconnected");
            console.log("MongoDB reconnected");
        });

    } catch (error) {
        log("Error connecting to MongoDB:", error);
        console.error("Error connecting to MongoDB:", error);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;






