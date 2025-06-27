import mongoose from 'mongoose';

const serviceContentSchema = new mongoose.Schema({
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
        required: true
    },
    points: {
        type: [String],
        required: true,
        validate: {
            validator: function(points) {
                // At least 4 non-empty points required
                return points.filter(point => point.trim() !== '').length >= 4;
            },
            message: 'At least 4 non-empty points are required'
        }
    }
}, {
    timestamps: true
});

const ServiceContent = mongoose.model('ServiceContent', serviceContentSchema);

export default ServiceContent; 