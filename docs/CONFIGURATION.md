# Configuration Guide

## .env Keys
(See `docs/SETUP_AND_INSTALLATION.md` for required vs optional keys.)

Additional optional keys:
| Key | Purpose |
| --- | --- |
| `COOKIE_DOMAIN` (future) | Align session cookie across subdomains. |
| `HTTPS_REDIRECT` (recommended) | If enabled in middleware, force HTTPS. |

## Config Files
- `src/config/dbConfig.js` – Creates a pooled MySQL connection using env credentials. Adjust `connectionLimit` for production workloads.
- `src/config/sessionStore.js` – Accepts `{ ttl, cleanupInterval }` overrides when instantiating. Instances automatically create `sessions` table if absent.
- `src/utils/logger.js` – Reads `LOG_LEVEL` at require-time. Customize log directory or rotation policy if running on read-only filesystems.

## Security Considerations
- **Secrets** – `SESSION_SECRET`, DB credentials, and admin login must never be committed. Use secret managers (AWS SSM, Heroku config vars).
- **Admin Credentials** – Environment-based to avoid DB exposure; rotate regularly.
- **Database Grants** – Provide least privilege: SELECT/INSERT/UPDATE/DELETE on schema plus `CREATE` on `sessions`.
- **Transport Security** – Terminate TLS at reverse proxy; Express cookies marked `secure` when `NODE_ENV=production`.

## Defaults & Overrides
| Component | Default | Override Mechanism |
| --- | --- | --- |
| Session TTL | 240 minutes | `SESSION_TTL_MINUTES` |
| Session cookie name | `14stars.sid` | `SESSION_COOKIE_NAME` |
| Logger level | `info` | `LOG_LEVEL` |
| Server port | `30000` | `PORT` |
| Static directory | `public_html` | Change path in `src/app.js` |
| Request logging | Enabled | Swap middleware or add sampling logic |

To customize config, adjust environment variables rather than editing source files to keep deployments reproducible.
