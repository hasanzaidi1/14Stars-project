const SubstituteRequest = require('./substitute-request.model');

exports.submitRequest = async (req, res) => {
    const { teacher_name, teacher_email, reason, date } = req.body;

    if (!teacher_name || !teacher_email || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingRequest = await SubstituteRequest.findByEmailAndDate(teacher_email, date);

        if (existingRequest.length > 0) {
            return res.status(400).json({ message: 'A substitute request for this date already exists.' });
        }

        await SubstituteRequest.create(teacher_name, teacher_email, reason, date);
        res.status(201).json({ message: 'Substitute request submitted successfully.' });
    } catch (error) {
        console.error('Error submitting substitute request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.fetchRequests = async (req, res) => {
    try {
        const requests = await SubstituteRequest.fetchAll();
        res.status(200).json({ substituteRequests: requests });
    } catch (error) {
        console.error('Error fetching substitute requests:', error);
        res.status(500).send('Internal server error');
    }
};

exports.updateSatisfiedBy = async (req, res) => {
    const { request_id, teacher_email, satisfied_by } = req.body;

    try {
        await SubstituteRequest.updateSatisfiedBy(request_id, teacher_email, satisfied_by);
        res.status(200).send('Successfully updated');
    } catch (error) {
        console.error('Error updating satisfied by:', error);
        res.status(500).send('Internal server error');
    }
};
