const pool = require('../../config/dbConfig');

const assignTeacherClass = async ({ teacherId, levelId, subjectId, schoolYear }) => {
    const query = `
        INSERT INTO teacher_class_assignments (teacher_id, level_id, subject_id, school_year)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [teacherId, levelId, subjectId, schoolYear]);
    return result.insertId;
};

const getTeacherClassAssignments = async () => {
    const query = `
        SELECT 
            tca.assignment_id,
            tca.teacher_id,
            tca.level_id,
            tca.subject_id,
            tca.school_year,
            t.t_f_name,
            t.t_l_name,
            t.t_email AS teacher_email,
            CONCAT(t.t_f_name, ' ', t.t_l_name) AS teacher_name,
            lvl.level_number,
            subj.subject
        FROM teacher_class_assignments tca
        JOIN teachers t ON tca.teacher_id = t.t_id
        JOIN level lvl ON tca.level_id = lvl.level_id
        JOIN subject subj ON tca.subject_id = subj.subject_id
        ORDER BY t.t_l_name, t.t_f_name, lvl.level_number, subj.subject;
    `;
    const [rows] = await pool.query(query);
    return rows;
};

const updateTeacherClassAssignment = async (assignmentId, updates) => {
    const columnMap = {
        teacherId: 'teacher_id',
        levelId: 'level_id',
        subjectId: 'subject_id',
        schoolYear: 'school_year'
    };

    const fields = [];
    const values = [];

    for (const [key, column] of Object.entries(columnMap)) {
        if (updates[key] !== undefined) {
            fields.push(`${column} = ?`);
            values.push(updates[key]);
        }
    }

    if (!fields.length) {
        return { affectedRows: 0 };
    }

    const query = `UPDATE teacher_class_assignments SET ${fields.join(', ')} WHERE assignment_id = ?`;
    const [result] = await pool.query(query, [...values, assignmentId]);
    return result;
};

const deleteTeacherClassAssignment = async (assignmentId) => {
    const query = 'DELETE FROM teacher_class_assignments WHERE assignment_id = ?';
    const [result] = await pool.query(query, [assignmentId]);
    return result;
};

module.exports = {
    assignTeacherClass,
    getTeacherClassAssignments,
    updateTeacherClassAssignment,
    deleteTeacherClassAssignment
};
