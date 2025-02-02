const pool = require('../config/dbConfig');

const getAllLevels = async () => {
    const [rows] = await pool.query('SELECT * FROM level');
    return rows;
};


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
            student.st_id, 
            level.level_number, 
            student_level.full_name, 
            student_level.subject, 
            student_level.school_year 
        FROM 
            student_level 
        JOIN 
            level ON student_level.level_id = level.level_id 
        JOIN 
            student ON student_level.st_id = student.st_id
    `;
    const [rows] = await pool.query(query);
    return rows;
};

const addLevel = async (level) => {
    const query = 'INSERT INTO level (level_number) VALUES (?)';
    await pool.query(query, [level]);
};

module.exports = { 
    getAllLevels, 
    assignStudentLevel, 
    getAssignedLevels, 
    addLevel
};
