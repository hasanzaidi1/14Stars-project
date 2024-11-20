const pool = require('../config/dbConfig'); // Database connection

async function registerTeacher(teacherData) {
    const query = `INSERT INTO teachers (t_f_name, t_mi, t_l_name, t_email, t_phone, gender, t_staddress, t_city, t_state, t_zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return await pool.query(query, [
        teacherData.t_f_name,
        teacherData.t_mi,
        teacherData.t_l_name,
        teacherData.t_email,
        teacherData.t_phone,
        teacherData.gender,
        teacherData.t_staddress,
        teacherData.t_city,
        teacherData.t_state,
        teacherData.t_zip
    ]);
}

async function getAllTeachers() {
    const query = `SELECT * FROM teachers`;
    const [rows] = await pool.query(query);
    return rows;
}

async function getTeacherById(teacherId) {
    const query = `SELECT * FROM teachers WHERE id = ?`;
    const [rows] = await pool.query(query, [teacherId]);
    return rows[0]; // Return the first teacher found
}


module.exports = {
    registerTeacher,
    getAllTeachers,
    getTeacherById
};