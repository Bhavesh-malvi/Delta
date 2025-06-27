import Enroll from '../models/Enroll.js';

// Create new enrollment
export const createEnroll = async (req, res) => {
    try {
        const enroll = new Enroll(req.body);
        await enroll.save();
        res.status(201).json({ success: true, data: enroll });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all enrollments
export const getAllEnrolls = async (req, res) => {
    try {
        const enrolls = await Enroll.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: enrolls });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete enrollment
export const deleteEnroll = async (req, res) => {
    try {
        const enroll = await Enroll.findByIdAndDelete(req.params.id);
        if (!enroll) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }
        res.status(200).json({ success: true, message: 'Enrollment deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}; 