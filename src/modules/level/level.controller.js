const { getAllLevels, addLevel, updateLevel, deleteLevel } = require('./level.model');

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

const add = async (req, res) => {
    console.log('Request body:', req.body); // Debugging

    const { level } = req.body;
    if (!level) {
        return res.status(400).json({ error: 'Level number is required' });
    }

    try {
        await addLevel(level);
        res.status(201).json({ message: 'Level added successfully!' });
    } catch (error) {
        console.error('Error adding level:', error.message);
        res.status(500).send('Server Error');
    }
};

const update = async (req, res) => {
    const { id } = req.params;
    const { level } = req.body;

    if (!id || !level) {
        return res.status(400).json({ error: 'Level id and new value are required' });
    }

    try {
        const result = await updateLevel(id, level);
        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Level not found' });
        }
        res.json({ message: 'Level updated successfully!' });
    } catch (error) {
        console.error('Error updating level:', error.message);
        res.status(500).send('Server Error');
    }
};

const remove = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Level id is required' });
    }

    try {
        const result = await deleteLevel(id);
        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Level not found' });
        }
        res.json({ message: 'Level deleted successfully!' });
    } catch (error) {
        console.error('Error deleting level:', error.message);
        res.status(500).send('Server Error');
    }
};


module.exports = { fetchLevels, add, update, remove };
