const TermModel = require('./term.model');

class TermController {
    // Create a new term
    static async createTerm(req, res) {
        try {
            const termData = req.body;
            const result = await TermModel.create(termData);
            res.status(201).json({ message: 'Term created successfully', term: result });
        } catch (error) {
            console.error('Error creating term:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Fetch all terms
    static async getAllTerms(req, res) {
        try {
            const terms = await TermModel.findAll();
            res.status(200).json(terms);
            console.log(terms)
        } catch (error) {
            console.error('Error fetching terms:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Update an existing term
    static async updateTerm(req, res) {
        const { id } = req.params;
        const termData = req.body || {};

        if (!id) {
            return res.status(400).json({ message: 'Term ID is required' });
        }

        try {
            const result = await TermModel.update(id, termData);
            if (!result.affectedRows) {
                return res.status(404).json({ message: 'Term not found' });
            }
            res.json({ message: 'Term updated successfully' });
        } catch (error) {
            console.error('Error updating term:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete a term
    static async deleteTerm(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Term ID is required' });
        }

        try {
            const result = await TermModel.delete(id);
            if (!result.affectedRows) {
                return res.status(404).json({ message: 'Term not found' });
            }
            res.json({ message: 'Term deleted successfully' });
        } catch (error) {
            console.error('Error deleting term:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = TermController; // Export the controller
