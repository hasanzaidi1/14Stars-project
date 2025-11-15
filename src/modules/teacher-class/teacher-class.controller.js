const {
    assignTeacherClass,
    getTeacherClassAssignments,
    updateTeacherClassAssignment,
    deleteTeacherClassAssignment
} = require('./teacher-class.model');
const { determineSchoolYear } = require('../../utils/helpers');

const normalizeId = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric <= 0) {
        return null;
    }
    return numeric;
};

const assignTeacherToClass = async (req, res) => {
    const teacherId = normalizeId(req.body.teacherId);
    const levelId = normalizeId(req.body.levelId);
    const subjectId = normalizeId(req.body.subjectId);
    const schoolYearInput = req.body.schoolYear?.trim();

    if (!teacherId || !levelId || !subjectId) {
        return res.status(400).json({ message: 'Teacher, level, and subject are required.' });
    }

    const schoolYear = schoolYearInput || determineSchoolYear(new Date());

    try {
        const assignmentId = await assignTeacherClass({ teacherId, levelId, subjectId, schoolYear });
        return res.status(201).json({ message: 'Teacher assigned to class successfully.', assignmentId });
    } catch (error) {
        console.error('Error assigning teacher to class:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'This teacher is already assigned to that class for the selected school year.' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW' || error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'Teacher, level, or subject reference is invalid.' });
        }
        return res.status(500).json({ message: 'Failed to assign teacher to class.' });
    }
};

const fetchTeacherClassAssignments = async (_req, res) => {
    try {
        const assignments = await getTeacherClassAssignments();
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching teacher-class assignments:', error);
        res.status(500).json({ message: 'Failed to load teacher-class assignments.' });
    }
};

const updateTeacherClass = async (req, res) => {
    const assignmentId = normalizeId(req.params.assignmentId);
    if (!assignmentId) {
        return res.status(400).json({ message: 'Assignment id is required.' });
    }

    const updates = {};
    if (req.body.teacherId !== undefined) {
        const teacherId = normalizeId(req.body.teacherId);
        if (!teacherId) {
            return res.status(400).json({ message: 'A valid teacher id is required when updating the teacher.' });
        }
        updates.teacherId = teacherId;
    }
    if (req.body.levelId !== undefined) {
        const levelId = normalizeId(req.body.levelId);
        if (!levelId) {
            return res.status(400).json({ message: 'A valid level id is required when updating the level.' });
        }
        updates.levelId = levelId;
    }
    if (req.body.subjectId !== undefined) {
        const subjectId = normalizeId(req.body.subjectId);
        if (!subjectId) {
            return res.status(400).json({ message: 'A valid subject id is required when updating the subject.' });
        }
        updates.subjectId = subjectId;
    }
    if (req.body.schoolYear !== undefined) {
        updates.schoolYear = req.body.schoolYear?.trim() || null;
    }

    if (Object.values(updates).every((value) => value === undefined || value === null)) {
        return res.status(400).json({ message: 'No changes provided.' });
    }

    if (updates.schoolYear === null) {
        updates.schoolYear = determineSchoolYear(new Date());
    }

    try {
        const result = await updateTeacherClassAssignment(assignmentId, updates);
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Assignment not found or unchanged.' });
        }
        res.json({ message: 'Assignment updated successfully.' });
    } catch (error) {
        console.error('Error updating teacher-class assignment:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Another assignment already exists with those details.' });
        }
        res.status(500).json({ message: 'Failed to update assignment.' });
    }
};

const deleteTeacherClass = async (req, res) => {
    const assignmentId = normalizeId(req.params.assignmentId);
    if (!assignmentId) {
        return res.status(400).json({ message: 'Assignment id is required.' });
    }

    try {
        const result = await deleteTeacherClassAssignment(assignmentId);
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }
        res.json({ message: 'Assignment removed successfully.' });
    } catch (error) {
        console.error('Error deleting teacher-class assignment:', error);
        res.status(500).json({ message: 'Failed to delete assignment.' });
    }
};

module.exports = {
    assignTeacherToClass,
    fetchTeacherClassAssignments,
    updateTeacherClass,
    deleteTeacherClass
};
