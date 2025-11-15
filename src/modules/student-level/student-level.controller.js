const {
    assignStudentLevel,
    getAssignedLevels,
    updateAssignedLevel,
    deleteAssignedLevel,
} = require('./student-level.model');

const { getSubjectName } = require('../subject/subject.model');
const TermModel = require('../term/term.model');

const { getFullNameByStudentId, determineSchoolYear } = require('../../utils/helpers');

const parseGradeField = (label, rawValue) => {
    if (rawValue === undefined) {
        return undefined;
    }
    if (rawValue === null || rawValue === '') {
        return null;
    }
    const value = Number(rawValue);
    if (Number.isNaN(value)) {
        const err = new Error(`${label} must be a valid number.`);
        err.statusCode = 400;
        throw err;
    }
    if (value < 0 || value > 100) {
        const err = new Error(`${label} must be between 0 and 100.`);
        err.statusCode = 400;
        throw err;
    }
    return Number(value.toFixed(2));
};

const assignLevel = async (req, res) => {
    const { studentId, levelId, subjectId, termId, midtermGrade, finalGrade, averageGrade } = req.body;

    try {
        if (!termId) {
            return res.status(400).send('Term is required for assigning a level.');
        }

        const numericTermId = Number(termId);
        if (Number.isNaN(numericTermId)) {
            return res.status(400).send('Term must be a valid identifier.');
        }

        const term = await TermModel.findById(numericTermId);
        if (!term) {
            return res.status(400).send('Invalid term selected.');
        }

        // Fetch full name
        const fullName = await getFullNameByStudentId(studentId);
        if (!fullName) return res.status(400).send('Invalid student ID');

        // Fetch subject name
        const subjectName = await getSubjectName(subjectId);
        if (!subjectName) return res.status(400).send('Invalid subject ID');

        const schoolYear = term.school_year || determineSchoolYear(new Date());

        const midterm = parseGradeField('Midterm grade', midtermGrade);
        const final = parseGradeField('Final grade', finalGrade);
        let average = parseGradeField('Average grade', averageGrade);

        if (average === undefined && midterm !== undefined && midterm !== null && final !== undefined && final !== null) {
            average = Number(((midterm + final) / 2).toFixed(2));
        }

        const assignedLevelId = await assignStudentLevel(
            studentId,
            levelId,
            numericTermId,
            fullName,
            subjectName,
            schoolYear,
            { midtermGrade: midterm, finalGrade: final, averageGrade: average }
        );

        res.status(201).json({ message: 'Level assigned successfully', assignedLevelId });
    } catch (error) {
        console.error('Error assigning level:', error.message);
        res.status(error.statusCode || 500).send(error.statusCode ? error.message : 'Error assigning level');
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
    const {
        studentId,
        originalLevelId,
        originalSubject,
        levelId,
        subject,
        schoolYear,
        midtermGrade,
        finalGrade,
        averageGrade,
        termId
    } = req.body;

    if (!studentId || !originalLevelId || !originalSubject) {
        return res.status(400).json({ message: 'Student id, current level id, and subject are required' });
    }

    const updates = {};
    if (levelId !== undefined) updates.levelId = levelId;
    if (subject !== undefined) updates.subject = subject;
    if (schoolYear !== undefined) updates.schoolYear = schoolYear;

    try {
        if (termId !== undefined) {
            const numericTermId = Number(termId);
            if (Number.isNaN(numericTermId)) {
                return res.status(400).json({ message: 'Term must be a valid identifier.' });
            }
            const term = await TermModel.findById(numericTermId);
            if (!term) {
                return res.status(400).json({ message: 'Selected term does not exist.' });
            }
            updates.termId = numericTermId;
            if (updates.schoolYear === undefined || updates.schoolYear === null || updates.schoolYear === '') {
                updates.schoolYear = term.school_year;
            }
        }

        const midterm = parseGradeField('Midterm grade', midtermGrade);
        const final = parseGradeField('Final grade', finalGrade);
        let average = parseGradeField('Average grade', averageGrade);

        if (midterm !== undefined) updates.midtermGrade = midterm;
        if (final !== undefined) updates.finalGrade = final;
        if (average === undefined && midterm !== undefined && midterm !== null && final !== undefined && final !== null) {
            average = Number(((midterm + final) / 2).toFixed(2));
        }
        if (average !== undefined) {
            updates.averageGrade = average;
        }
    } catch (error) {
        return res.status(error.statusCode || 400).json({ message: error.message });
    }

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
