import Stats from '../models/Stats.js';

// Initialize stats if not exists
const initializeStats = async () => {
    try {
        return await Stats.initializeStats();
    } catch (error) {
        console.error('Error initializing stats:', error);
        throw error;
    }
};

// Call initialization
initializeStats().catch(console.error);

// Get stats
export const getStats = async (req, res) => {
    try {
        let stats = await Stats.findOne().maxTimeMS(5000);
        if (!stats) {
            stats = await Stats.create({});
        }
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(503).json({ 
            success: false, 
            message: 'Service temporarily unavailable',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
};

// Update customer count (called when enroll form is submitted)
export const incrementCustomerCount = async (req, res) => {
    try {
        let stats = await Stats.findOne().maxTimeMS(5000);
        if (!stats) {
            stats = await Stats.create({});
        }
        
        stats.customerCount += 1;
        await stats.save();
        
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error incrementing customer count:', error);
        res.status(503).json({ 
            success: false, 
            message: 'Service temporarily unavailable',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
};

// Admin manual update
export const updateStats = async (req, res) => {
    try {
        const { customerCount } = req.body;
        
        if (typeof customerCount !== 'number' || customerCount < 0) {
            return res.status(400).json({ success: false, message: 'Invalid customer count' });
        }

        let stats = await Stats.findOne().maxTimeMS(5000);
        if (!stats) {
            stats = await Stats.create({ customerCount });
        } else {
            stats.customerCount = customerCount;
            stats.lastManualUpdate = Date.now();
            await stats.save();
        }

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(503).json({ 
            success: false, 
            message: 'Service temporarily unavailable',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
}; 