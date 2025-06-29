import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
    customerCount: {
        type: Number,
        default: 21
    },
    displayedCount: {
        type: Number,
        default: 21
    },
    lastManualUpdate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Middleware to update displayedCount based on customerCount
statsSchema.pre('save', function(next) {
    if (this.customerCount >= 21) {
        this.displayedCount = this.customerCount;
    } else {
        this.displayedCount = 21;
    }
    next();
});

const Stats = mongoose.model('Stats', statsSchema);
export default Stats; 