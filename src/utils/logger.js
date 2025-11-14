const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const LEVELS = ['error', 'warn', 'info', 'debug'];
const DEFAULT_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

class Logger {
    constructor() {
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }
        this.currentDate = this.getDateStamp();
        this.stream = fs.createWriteStream(this.getLogFilePath(), { flags: 'a' });
    }

    getDateStamp() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    getLogFilePath() {
        return path.join(LOG_DIR, `${this.currentDate}.log`);
    }

    rotateStreamIfNeeded() {
        const today = this.getDateStamp();
        if (today !== this.currentDate) {
            this.stream.end();
            this.currentDate = today;
            this.stream = fs.createWriteStream(this.getLogFilePath(), { flags: 'a' });
        }
    }

    shouldLog(level) {
        const normalizedLevel = level.toLowerCase();
        const targetIndex = LEVELS.indexOf(DEFAULT_LEVEL);
        if (targetIndex === -1) {
            return true;
        }
        return LEVELS.indexOf(normalizedLevel) <= targetIndex;
    }

    serializeMeta(meta) {
        if (meta === undefined || meta === null) {
            return '';
        }
        if (typeof meta === 'string') {
            return meta;
        }
        try {
            return JSON.stringify(meta);
        } catch (error) {
            return '[unserializable metadata]';
        }
    }

    log(level, ...args) {
        if (!this.shouldLog(level)) {
            return;
        }

        this.rotateStreamIfNeeded();

        const timestamp = new Date().toISOString();
        const [message, ...metaParts] = args;
        const meta = metaParts.length === 1 ? metaParts[0] : (metaParts.length ? metaParts : undefined);
        const payload = `[${timestamp}] [${level.toUpperCase()}] ${message}${meta ? ` | ${this.serializeMeta(meta)}` : ''}\n`;
        this.stream.write(payload);

        if (level === 'error') {
            process.stderr.write(payload);
        } else {
            process.stdout.write(payload);
        }
    }

    info(...args) {
        this.log('info', ...args);
    }

    warn(...args) {
        this.log('warn', ...args);
    }

    error(...args) {
        this.log('error', ...args);
    }

    debug(...args) {
        this.log('debug', ...args);
    }
}

module.exports = new Logger();
