const AnnouncementModel = require('./announcement.model');

const isValidUrl = (value) => {
    if (!value) return true;
    try {
        const parsed = new URL(value);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch (error) {
        return false;
    }
};

class AnnouncementController {
    async listPublic(req, res) {
        try {
            const { limit } = req.query;
            const announcements = await AnnouncementModel.getPublished(limit ? Number(limit) : undefined);
            res.json(announcements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            res.status(500).json({ success: false, message: 'Unable to load announcements' });
        }
    }

    async listAll(req, res) {
        try {
            const announcements = await AnnouncementModel.getAll();
            res.json({ announcements });
        } catch (error) {
            console.error('Error fetching admin announcements:', error);
            res.status(500).json({ success: false, message: 'Unable to load announcements' });
        }
    }

    async create(req, res) {
        try {
            const {
                title,
                body,
                ctaLabel,
                ctaUrl,
                displayOrder,
                isPublished = true
            } = req.body;

            if (!title || !body) {
                return res.status(400).json({ success: false, message: 'Title and body are required.' });
            }

            if (ctaUrl && !isValidUrl(ctaUrl)) {
                return res.status(400).json({ success: false, message: 'CTA URL must be http(s).' });
            }

            const id = await AnnouncementModel.createAnnouncement({
                title: title.trim(),
                body: body.trim(),
                ctaLabel: ctaLabel ? ctaLabel.trim() : null,
                ctaUrl: ctaUrl ? ctaUrl.trim() : null,
                displayOrder,
                isPublished
            });

            res.status(201).json({ success: true, id });
        } catch (error) {
            console.error('Error creating announcement:', error);
            res.status(500).json({ success: false, message: 'Unable to create announcement' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'Announcement id required.' });
            }

            const {
                title,
                body,
                ctaLabel,
                ctaUrl,
                displayOrder,
                isPublished
            } = req.body;

            if (ctaUrl !== undefined && ctaUrl !== null && ctaUrl !== '' && !isValidUrl(ctaUrl)) {
                return res.status(400).json({ success: false, message: 'CTA URL must be http(s).' });
            }

            const updates = {};
            if (title !== undefined) updates.title = title.trim();
            if (body !== undefined) updates.body = body.trim();
            if (ctaLabel !== undefined) updates.ctaLabel = ctaLabel ? ctaLabel.trim() : null;
            if (ctaUrl !== undefined) updates.ctaUrl = ctaUrl ? ctaUrl.trim() : null;
            if (displayOrder !== undefined) updates.displayOrder = displayOrder;
            if (isPublished !== undefined) updates.isPublished = isPublished;

            const result = await AnnouncementModel.updateAnnouncement(id, updates);
            if (!result.affectedRows) {
                return res.status(404).json({ success: false, message: 'Announcement not found or unchanged.' });
            }

            res.json({ success: true, message: 'Announcement updated.' });
        } catch (error) {
            console.error('Error updating announcement:', error);
            res.status(500).json({ success: false, message: 'Unable to update announcement' });
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'Announcement id required.' });
            }

            const result = await AnnouncementModel.deleteAnnouncement(id);
            if (!result.affectedRows) {
                return res.status(404).json({ success: false, message: 'Announcement not found.' });
            }

            res.json({ success: true, message: 'Announcement deleted.' });
        } catch (error) {
            console.error('Error deleting announcement:', error);
            res.status(500).json({ success: false, message: 'Unable to delete announcement' });
        }
    }
}

module.exports = new AnnouncementController();
