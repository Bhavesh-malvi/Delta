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
        required: true,
        validate: {
            validator: function(points) {
                return points.length >= 4;
            },
            message: 'At least 4 points are required'
        }
    }
}, {
    timestamps: true
});

const Career = mongoose.model('Career', careerSchema);

export default Career; 