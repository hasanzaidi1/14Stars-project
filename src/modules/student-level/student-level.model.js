const pool = require('../../config/dbConfig');

const assignStudentLevel = async (studentId, levelId, fullName, subjectName, schoolYear) => {
    const query = `
        INSERT INTO student_level (st_id, level_id, full_name, subject, school_year) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [studentId, levelId, fullName, subjectName, schoolYear]);
    return result.insertId;
};

const getAssignedLevels = async () => {
    const query = `
        SELECT 
            student_level.st_id,
            student_level.level_id,
            level.level_number,
            student_level.full_name,
            student_level.subject,
            student_level.school_year
        FROM student_level
        JOIN level ON student_level.level_id = level.level_id
        ORDER BY student_level.full_name
    `;
    const [rows] = await pool.query(query);
    return rows;
};

const updateAssignedLevel = async (studentId, currentLevelId, currentSubject, updates) => {
    const columnMap = {
        levelId: 'level_id',
        subject: 'subject',
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

    const query = `UPDATE student_level SET ${fields.join(', ')} WHERE st_id = ? AND level_id = ? AND subject = ?`;
    const [result] = await pool.query(query, [...values, studentId, currentLevelId, currentSubject]);
    return result;
};

const deleteAssignedLevel = async (studentId, levelId, subject) => {
    const query = 'DELETE FROM student_level WHERE st_id = ? AND level_id = ? AND subject = ?';
    const [result] = await pool.query(query, [studentId, levelId, subject]);
    return result;
};

module.exports = {
    assignStudentLevel,
    getAssignedLevels,
    updateAssignedLevel,
    deleteAssignedLevel
};
