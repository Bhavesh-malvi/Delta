const Stats = require('../models/Stats');

// Initialize stats if not exists
const initializeStats = async () => {
    try {
        const stats = await Stats.findOne();
        if (!stats) {
            await Stats.create({});
        }
    } catch (error) {
        console.error('Error initializing stats:', error);
    }
};

// Call initialization
initializeStats();

// Get stats
exports.getStats = async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = await Stats.create({});
        }
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update customer count (called when enroll form is submitted)
exports.incrementCustomerCount = async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = await Stats.create({});
        }
        
        stats.customerCount += 1;
        await stats.save();
        
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin manual update
exports.updateStats = async (req, res) => {
    try {
        const { customerCount } = req.body;
        
        if (typeof customerCount !== 'number' || customerCount < 0) {
            return res.status(400).json({ success: false, message: 'Invalid customer count' });
        }

        let stats = await Stats.findOne();
        if (!stats) {
            stats = await Stats.create({ customerCount });
        } else {
            stats.customerCount = customerCount;
            stats.lastManualUpdate = Date.now();
            await stats.save();
        }

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}; 