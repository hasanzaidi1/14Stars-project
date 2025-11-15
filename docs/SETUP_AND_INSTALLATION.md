# Setup & Installation

## Requirements
| Component | Minimum Version | Purpose |
| --- | --- | --- |
| Node.js | 18 LTS (20 recommended) | Runs Express backend |
| npm | 9+ | Dependency management |
| MySQL Server | 8.0+ | Primary datastore + session store |
| Git | Latest | Source control |
| Optional tools | Postman/Insomnia, curl | API validation |

## Step-by-Step Installation
1. **Clone and prepare**
   ```bash
   git clone <repo-url>
   cd 14Stars-project
   npm install
   ```
2. **Copy environment template** (see below) into `.env` at repo root.
3. **Provision MySQL schema**
   ```bash
   mysql -u <user> -p -h <host> < database < src/config/schema.sql
   ```
4. **Seed admins/teachers** – Insert baseline admin creds into `.env`, add teacher profiles in `teachers` table (or through `/teachers/profiles`).
5. **Run local server**
   ```bash
   npm start
   ```
   Access `http://localhost:30000`.

## Environment Variables
| Key | Required | Description | Default/Fallback |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` / `production` toggles cookies | `development` |
| `PORT` | No | HTTP port | `30000` |
| `DB_HOST` | Yes | MySQL host | – |
| `DB_USER` | Yes | DB username | – |
| `DB_PASS` | Yes | DB password | – |
| `DB_NAME` | Yes | Database schema name | – |
| `SESSION_SECRET` | Yes | HMAC secret for sessions | `'change-me'` |
| `SESSION_COOKIE_NAME` | No | Custom cookie label | `14stars.sid` |
| `SESSION_TTL_MINUTES` | No | Session duration | `240` |
| `ADMIN_USERNAME` | Yes | Admin login | – |
| `ADMIN_PASSWORD` | Yes | Admin password | – |
| `LOG_LEVEL` | No | `error|warn|info|debug` for `src/utils/logger.js` | `info` |

Example snippet:
```ini
NODE_ENV=development
PORT=30000
DB_HOST=127.0.0.1
DB_USER=14stars
DB_PASS=secret
DB_NAME=admin14stars_education_center
SESSION_SECRET=e0d9dca1
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=supersecret
```

## Database Setup
- Execute `src/config/schema.sql` to create `student`, `guardian`, `teachers`, `student_level`, `term`, `subject`, `teacher_class_assignments`, etc.
- Populate lookup tables (levels, terms, subjects) before assigning students.
- `sessions` table is auto-created by `sessionStore.ensureTable()` but included in schema for production migrations.

## Running Modes
- **Development** – `NODE_ENV=development`, HTTP cookies are non-secure, logs stream to console and `logs/<date>.log`.
- **Production** – `NODE_ENV=production`, cookies flagged `secure`, ensure reverse proxy sets `X-Forwarded-*` because `app.set('trust proxy', 1)` is enabled (`src/app.js:29`). Use process manager (PM2, systemd) to keep service alive.

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| `ER_ACCESS_DENIED_ERROR` | Verify DB credentials and network ACLs; confirm `.env` values match DB user grants. |
| 404 for portal HTML | Ensure `public_html` files exist, and requests omit `.html` extension (handled by `htmlPageMiddleware`). |
| Sessions not persisting | Confirm `sessions` table exists, DB user has INSERT/UPDATE rights, and cookies are not blocked. |
| `Student already exists` conflicts | Student dedupe uses first name + last name + DOB. Adjust data or extend logic if necessary. |
| `ER_DUP_ENTRY` in teacher-class assignments | Unique constraint prevents duplicate (teacher, level, subject, year). Update or delete existing assignment first. |
