import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('Successfully connected to MongoDB!');
        
        // Try to create a test document
        const TestModel = mongoose.model('Test', new mongoose.Schema({ test: String }));
        await TestModel.create({ test: 'test' });
        console.log('Successfully created test document!');
        
        // Cleanup
        await TestModel.deleteMany({});
        await mongoose.connection.close();
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Connection test failed:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
    }
    process.exit();
};

testConnection(); 