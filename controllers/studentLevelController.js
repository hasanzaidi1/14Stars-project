const {
    assignStudentLevel,
    getAssignedLevels,
} = require('../models/levelModel');

const { getSubjectName } = require('../models/subjectModel');

const { getFullNameByStudentId, determineSchoolYear } = require('../utils/helpers');

const assignLevel = async (req, res) => {
    const { studentId, levelId, subjectId } = req.body;

    try {
        // Fetch full name
        const fullName = await getFullNameByStudentId(studentId);
        if (!fullName) return res.status(400).send('Invalid student ID');

        // Fetch subject name
        const subjectName = await getSubjectName(subjectId);
        if (!subjectName) return res.status(400).send('Invalid subject ID');

        // Determine school year
        const schoolYear = determineSchoolYear(new Date());

        // Insert into student_level
        const assignedLevelId = await assignStudentLevel(studentId, levelId, fullName, subjectName, schoolYear);

        res.status(201).json({ message: 'Level assigned successfully', assignedLevelId });
    } catch (error) {
        console.error('Error assigning level:', error.message);
        res.status(500).send('Error assigning level');
    }
};

const fetchAssignedLevels = async (req, res) => {
    try {
        const levels = await getAssignedLevels();
        res.json(levels);
    } catch (error) {
        console.error('Error fetching assigned levels:', error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { assignLevel, fetchAssignedLevels };
