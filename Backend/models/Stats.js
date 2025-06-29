import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
    customerCount: {
        type: Number,
        default: 21,
        min: [0, 'Customer count cannot be negative']
    },
    displayedCount: {
        type: Number,
        default: 21,
        min: [0, 'Displayed count cannot be negative']
    },
    lastManualUpdate: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    // Add timeout options
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 5000
    }
});

// Middleware to update displayedCount based on customerCount
statsSchema.pre('save', function(next) {
    if (this.customerCount >= 21) {
        this.displayedCount = this.customerCount;
    } else {
        this.displayedCount = 21;
    }
    next();
});

// Add static method for safe initialization
statsSchema.statics.initializeStats = async function() {
    try {
        let stats = await this.findOne().maxTimeMS(5000);
        if (!stats) {
            stats = await this.create({});
        }
        return stats;
    } catch (error) {
        console.error('Error initializing stats:', error);
        throw error;
    }
};

const Stats = mongoose.model('Stats', statsSchema);
export default Stats; 