const { getAllSubjects, addSubject } = require('../models/subjectModel');

/**
 * Fetch all subjects.
 * Responds with a list of subjects or an error if the operation fails.
 */
const fetchAllSubjects = async (req, res) => {
    try {
        const subjects = await getAllSubjects();
        res.status(200).json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Unable to fetch subjects. Please try again later.' });
    }
};

/**
 * Add a new subject.
 * Validates input and attempts to create a subject.
 */
const createSubject = async (req, res) => {
    const { subject } = req.body;

    // Check for missing input
    if (!subject) {
        return res.status(400).json({ error: 'Subject field is required.' });
    }

    try {
        await addSubject(subject);
        res.status(201).json({ message: 'Subject added successfully!' });
    } catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ error: 'Unable to add subject. Please try again later.' });
    }
};


module.exports = {
    addSubject: createSubject,
    fetchSubjects: fetchAllSubjects,
};