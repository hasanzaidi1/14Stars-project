const Substitute = require('./substitute.model');

exports.registerSubstitute = async (req, res) => {
    const { sub_f_name, sub_l_name, sub_email, sub_phone } = req.body;

    try {
        const existing = await Substitute.findByEmail(sub_email);

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Substitute already exists' });
        }

        const insertId = await Substitute.create(sub_f_name, sub_l_name, sub_email, sub_phone);
        const newSub = await Substitute.findById(insertId);

        res.status(201).json({ substitute: newSub });
    } catch (error) {
        console.error('Error registering substitute:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.fetchSubstitutes = async (req, res) => {
    try {
        const substitutes = await Substitute.fetchAll();
        res.json({ substitutes });
    } catch (error) {
        console.error('Error fetching substitutes:', error);
        res.status(500).json({ message: 'Error fetching substitutes' });
    }
};

exports.updateSubstitute = async (req, res) => {
    const { id } = req.params;
    const updates = req.body || {};

    if (!id) {
        return res.status(400).json({ message: 'Substitute ID is required' });
    }

    try {
        const result = await Substitute.update(id, updates);
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Substitute not found or unchanged' });
        }
        res.json({ message: 'Substitute updated successfully' });
    } catch (error) {
        console.error('Error updating substitute:', error);
        res.status(500).json({ message: 'Error updating substitute' });
    }
};

exports.deleteSubstitute = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Substitute ID is required' });
    }

    try {
        const result = await Substitute.delete(id);
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Substitute not found' });
        }
        res.json({ message: 'Substitute removed successfully' });
    } catch (error) {
        console.error('Error deleting substitute:', error);
        res.status(500).json({ message: 'Error deleting substitute' });
    }
};
