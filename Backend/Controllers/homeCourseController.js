import HomeCourse from '../models/HomeCourse.js';

// ✅ Create a new course
export const createHomeCourse = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const course = await HomeCourse.create({ title, description });
        res.status(201).json({ success: true, message: 'Course created successfully', data: course });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Get all courses
export const getHomeCourses = async (req, res) => {
    try {
        const courses = await HomeCourse.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Update a course
export const updateHomeCourse = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const updated = await HomeCourse.findByIdAndUpdate(
            req.params.id,
            { title, description },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, message: 'Course updated', data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Delete a course
export const deleteHomeCourse = async (req, res) => {
    try {
        const deleted = await HomeCourse.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
