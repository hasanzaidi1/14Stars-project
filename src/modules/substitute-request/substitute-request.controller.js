const SubstituteRequest = require('./substitute-request.model');
const helpers = require('../../utils/helpers');

exports.submitRequest = async (req, res) => {
    const { teacher_name, teacher_email, reason, date } = req.body;

    if (!teacher_name || !teacher_email || !date) {
        return helpers.sendPortalResponse(req, res, {
            success: false,
            message: 'All fields are required.',
            statusCode: 400
        });
    }

    try {
        const existingRequest = await SubstituteRequest.findByEmailAndDate(teacher_email, date);

        if (existingRequest.length > 0) {
            return helpers.sendPortalResponse(req, res, {
                success: false,
                message: 'A substitute request for this date already exists.',
                statusCode: 409
            });
        }

        await SubstituteRequest.create(teacher_name, teacher_email, reason, date);
        return helpers.sendPortalResponse(req, res, {
            success: true,
            message: 'Substitute request submitted successfully.',
            statusCode: 201
        });
    } catch (error) {
        console.error('Error submitting substitute request:', error);
        return helpers.sendPortalResponse(req, res, {
            success: false,
            message: 'Internal Server Error',
            statusCode: 500
        });
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
