const pool = require('../../config/dbConfig');

const assignStudentLevel = async (studentId, levelId, termId, fullName, subjectName, schoolYear, grades = {}) => {
    const query = `
        INSERT INTO student_level (st_id, level_id, term_id, full_name, subject, school_year, midterm_grade, final_grade, average_grade) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
        studentId,
        levelId,
        termId ?? null,
        fullName,
        subjectName,
        schoolYear,
        grades.midtermGrade ?? null,
        grades.finalGrade ?? null,
        grades.averageGrade ?? null
    ]);
    return result.insertId;
};

const getAssignedLevels = async () => {
    const query = `
        SELECT 
            student_level.st_id,
            student_level.level_id,
            student_level.term_id,
            level.level_number,
            student_level.full_name,
            student_level.subject,
            student_level.school_year,
            term.term_name,
            term.school_year AS term_school_year,
            student_level.midterm_grade,
            student_level.final_grade,
            student_level.average_grade
        FROM student_level
        JOIN level ON student_level.level_id = level.level_id
        LEFT JOIN term ON student_level.term_id = term.term_id
        ORDER BY student_level.full_name
    `;
    const [rows] = await pool.query(query);
    return rows;
};

const updateAssignedLevel = async (studentId, currentLevelId, currentSubject, updates) => {
    const columnMap = {
        levelId: 'level_id',
        subject: 'subject',
        schoolYear: 'school_year',
        termId: 'term_id',
        midtermGrade: 'midterm_grade',
        finalGrade: 'final_grade',
        averageGrade: 'average_grade'
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
