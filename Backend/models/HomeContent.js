import mongoose from 'mongoose';

const homeContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    }
}, {
    timestamps: true
});

const HomeContent = mongoose.model('HomeContent', homeContentSchema);

export default HomeContent; 