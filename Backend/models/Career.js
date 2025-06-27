import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: false
    },
    points: {
        type: [String],
        required: false,
        default: []
    }
}, {
    timestamps: true
});

const Career = mongoose.model('Career', careerSchema);

export default Career; 