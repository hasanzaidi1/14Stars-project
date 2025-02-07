const { getAllLevels } = require('../models/levelModel');

const fetchLevels = async (req, res) => {
    console.log('Fetching levels...');
    try {
        const levels = await getAllLevels();
        res.json(levels);
    } catch (error) {
        console.error('Error fetching levels:', error.message);
        res.status(500).send('Server Error');
    }
};

const addLevel = async (req, res) => {
    console.log('Request body:', req.body); // Debugging

    const { level_number } = req.body;
    if (!level_number) {
        return res.status(400).json({ error: 'Level number is required' });
    }

    try {
        await addLevel({ level_number });
        res.status(201).json({ message: 'Level added successfully!' });
    } catch (error) {
        console.error('Error adding level:', error.message);
        res.status(500).send('Server Error');
    }
};


module.exports = { fetchLevels, addLevel };
