const pool = require('../../config/dbConfig');

const getAllLevels = async () => {
    const [rows] = await pool.query('SELECT * FROM level');
    return rows;
};

const addLevel = async (level) => {
    const query = 'INSERT INTO level (level_number) VALUES (?)';
    await pool.query(query, [level]);
};

const updateLevel = async (levelId, levelNumber) => {
    const query = 'UPDATE level SET level_number = ? WHERE level_id = ?';
    const [result] = await pool.query(query, [levelNumber, levelId]);
    return result;
};

const deleteLevel = async (levelId) => {
    const query = 'DELETE FROM level WHERE level_id = ?';
    const [result] = await pool.query(query, [levelId]);
    return result;
};

module.exports = { 
    getAllLevels, 
    addLevel,
    updateLevel,
    deleteLevel
};
