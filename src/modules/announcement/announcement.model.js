const pool = require('../../config/dbConfig');

const mapRow = (row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    ctaLabel: row.cta_label,
    ctaUrl: row.cta_url,
    displayOrder: row.display_order,
    isPublished: Boolean(row.is_published),
    publishedAt: row.published_at,
    updatedAt: row.updated_at
});

class AnnouncementModel {
    static async getPublished(limit = 6) {
        const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 6;
        const [rows] = await pool.query(
            `SELECT id, title, body, cta_label, cta_url, display_order, is_published, published_at, updated_at
             FROM announcements
             WHERE is_published = 1
             ORDER BY display_order ASC, published_at DESC
             LIMIT ?`,
            [safeLimit]
        );
        return rows.map(mapRow);
    }

    static async getAll() {
        const [rows] = await pool.query(
            `SELECT id, title, body, cta_label, cta_url, display_order, is_published, published_at, updated_at
             FROM announcements
             ORDER BY display_order ASC, updated_at DESC`
        );
        return rows.map(mapRow);
    }

    static async createAnnouncement({ title, body, ctaLabel, ctaUrl, displayOrder = 0, isPublished = true }) {
        const [result] = await pool.query(
            `INSERT INTO announcements (title, body, cta_label, cta_url, display_order, is_published)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title,
                body,
                ctaLabel || null,
                ctaUrl || null,
                Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
                isPublished ? 1 : 0
            ]
        );
        return result.insertId;
    }

    static async updateAnnouncement(id, updates) {
        const fields = [];
        const values = [];

        const map = {
            title: 'title',
            body: 'body',
            ctaLabel: 'cta_label',
            ctaUrl: 'cta_url',
            displayOrder: 'display_order',
            isPublished: 'is_published'
        };

        Object.entries(map).forEach(([key, column]) => {
            if (updates[key] !== undefined) {
                if (key === 'displayOrder') {
                    values.push(Number.isFinite(Number(updates[key])) ? Number(updates[key]) : 0);
                } else if (key === 'isPublished') {
                    values.push(updates[key] ? 1 : 0);
                } else if (updates[key] === null || updates[key] === '') {
                    values.push(null);
                } else {
                    values.push(updates[key]);
                }
                fields.push(`${column} = ?`);
            }
        });

        if (!fields.length) {
            return { affectedRows: 0 };
        }

        const [result] = await pool.query(
            `UPDATE announcements SET ${fields.join(', ')} WHERE id = ?`,
            [...values, id]
        );
        return result;
    }

    static async deleteAnnouncement(id) {
        const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
        return result;
    }
}

module.exports = AnnouncementModel;
