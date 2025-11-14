const {
    assignStudentLevel,
    getAssignedLevels,
    updateAssignedLevel,
    deleteAssignedLevel,
} = require('./student-level.model');

const { getSubjectName } = require('../subject/subject.model');

const { getFullNameByStudentId, determineSchoolYear } = require('../../utils/helpers');

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

const updateAssignment = async (req, res) => {
    const { studentId, originalLevelId, originalSubject, levelId, subject, schoolYear } = req.body;

    if (!studentId || !originalLevelId || !originalSubject) {
        return res.status(400).json({ message: 'Student id, current level id, and subject are required' });
    }

    const updates = {};
    if (levelId !== undefined) updates.levelId = levelId;
    if (subject !== undefined) updates.subject = subject;
    if (schoolYear !== undefined) updates.schoolYear = schoolYear;

    if (!Object.keys(updates).length) {
        return res.status(400).json({ message: 'No new values provided' });
    }

    try {
        const result = await updateAssignedLevel(studentId, originalLevelId, originalSubject, updates);
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Assignment not found or unchanged' });
        }
        res.json({ message: 'Assignment updated successfully' });
    } catch (error) {
        console.error('Error updating assignment:', error.message);
        res.status(500).send('Server Error');
    }
};

const deleteAssignment = async (req, res) => {
    const { studentId, levelId, subject } = req.body;

    if (!studentId || !levelId || !subject) {
        return res.status(400).json({ message: 'Student id, level id, and subject are required' });
    }

    try {
        const result = await deleteAssignedLevel(studentId, levelId, subject);
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { assignLevel, fetchAssignedLevels, updateAssignment, deleteAssignment };
