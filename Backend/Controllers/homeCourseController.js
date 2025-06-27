import HomeCourse from '../models/HomeCourse.js';

// Create a new course
export const createHomeCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const course = new HomeCourse({
            title,
            description
        });
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all courses
export const getHomeCourses = async (req, res) => {
    try {
        const courses = await HomeCourse.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a course
export const updateHomeCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const course = await HomeCourse.findByIdAndUpdate(
            req.params.id,
            { title, description },
            { new: true }
        );
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a course
export const deleteHomeCourse = async (req, res) => {
    try {
        const course = await HomeCourse.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 