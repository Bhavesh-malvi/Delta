import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
    totalEnrollments: {
        type: Number,
        default: 0
    },
    totalCourses: {
        type: Number,
        default: 0
    },
    totalServices: {
        type: Number,
        default: 0
    },
    totalCareers: {
        type: Number,
        default: 0
    },
    totalContacts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'stats'
});

const Stats = mongoose.model('Stats', statsSchema);

export default Stats; 