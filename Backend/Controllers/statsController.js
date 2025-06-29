import Stats from '../models/Stats.js';
import initializeStats from '../init-stats.js';

// Initialize stats
try {
    await initializeStats();
} catch (error) {
    console.error('Error initializing stats:', error);
}

// Get stats
export const getStats = async (req, res) => {
    try {
        const stats = await Stats.findOne({});
        if (!stats) {
            return res.status(404).json({ 
                success: false, 
                message: 'Stats not found' 
            });
        }
        res.status(200).json({ 
            success: true, 
            data: stats 
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(503).json({ 
            success: false, 
            message: 'Service temporarily unavailable',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
};

// Update stats
export const updateStats = async (req, res) => {
    try {
        const updates = req.body;
        
        // Validate updates
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value !== 'number' || value < 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid value for ${key}. Must be a non-negative number.` 
                });
            }
        }

        let stats = await Stats.findOne({});
        if (!stats) {
            stats = await Stats.create(updates);
        } else {
            Object.keys(updates).forEach(key => {
                if (stats[key] !== undefined) {
                    stats[key] = updates[key];
                }
            });
            await stats.save();
        }

        res.status(200).json({ 
            success: true, 
            data: stats 
        });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(503).json({ 
            success: false, 
            message: 'Service temporarily unavailable',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
}; 