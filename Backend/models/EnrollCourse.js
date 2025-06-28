import mongoose from 'mongoose';

const enrollCourseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('EnrollCourse', enrollCourseSchema); 