const session = require('express-session');
const pool = require('./dbConfig');
const logger = require('../utils/logger');

const TABLE_NAME = 'sessions';

class MySQLSessionStore extends session.Store {
    constructor(options = {}) {
        super();
        this.ttl = options.ttl || 1000 * 60 * 60 * 4; // 4 hours default
        this.cleanupInterval = options.cleanupInterval || 1000 * 60 * 15; // 15 minutes
        this.tableReady = this.ensureTable();
        this.cleanupTimer = setInterval(() => this.cleanupExpiredSessions(), this.cleanupInterval);
        if (typeof this.cleanupTimer.unref === 'function') {
            this.cleanupTimer.unref();
        }
        process.once('exit', () => this.stop());
    }

    async ensureTable() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS \`${TABLE_NAME}\` (
                session_id VARCHAR(128) NOT NULL PRIMARY KEY,
                expires BIGINT UNSIGNED NOT NULL,
                data TEXT NOT NULL
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `;

        try {
            await pool.query(createTableSQL);
        } catch (error) {
            logger.error('Failed to ensure sessions table exists', { error: error.message });
            throw error;
        }
    }

    getExpiration(sessionData) {
        if (sessionData?.cookie?.expires) {
            return new Date(sessionData.cookie.expires).getTime();
        }
        return Date.now() + this.ttl;
    }

    async get(sid, callback = () => {}) {
        try {
            await this.tableReady;
            const [rows] = await pool.query(`SELECT data, expires FROM \`${TABLE_NAME}\` WHERE session_id = ?`, [sid]);

            if (!rows.length) {
                return callback(null, null);
            }

            const sessionRow = rows[0];
            if (sessionRow.expires < Date.now()) {
                await this.destroy(sid);
                return callback(null, null);
            }

            const sessionData = JSON.parse(sessionRow.data);
            return callback(null, sessionData);
        } catch (error) {
            logger.error('Failed to get session', { sessionId: sid, error: error.message });
            return callback(error);
        }
    }

    async set(sid, sessionData, callback = () => {}) {
        try {
            await this.tableReady;
            const expires = this.getExpiration(sessionData);
            const data = JSON.stringify(sessionData);
            await pool.query(
                `REPLACE INTO \`${TABLE_NAME}\` (session_id, expires, data) VALUES (?, ?, ?)`,
                [sid, expires, data]
            );
            callback(null);
        } catch (error) {
            logger.error('Failed to set session', { sessionId: sid, error: error.message });
            callback(error);
        }
    }

    async destroy(sid, callback = () => {}) {
        try {
            await this.tableReady;
            await pool.query(`DELETE FROM \`${TABLE_NAME}\` WHERE session_id = ?`, [sid]);
            callback(null);
        } catch (error) {
            logger.error('Failed to destroy session', { sessionId: sid, error: error.message });
            callback(error);
        }
    }

    async cleanupExpiredSessions() {
        try {
            await this.tableReady;
            await pool.query(`DELETE FROM \`${TABLE_NAME}\` WHERE expires < ?`, [Date.now()]);
        } catch (error) {
            logger.error('Failed cleaning up expired sessions', { error: error.message });
        }
    }

    touch(sid, sessionData, callback = () => {}) {
        this.set(sid, sessionData, callback);
    }

    stop() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
}

module.exports = MySQLSessionStore;
