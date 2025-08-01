import mongoose from 'mongoose';

const homeServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    position: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const HomeService = mongoose.model('HomeService', homeServiceSchema);

export default HomeService; 