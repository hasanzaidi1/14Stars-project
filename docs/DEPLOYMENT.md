# Deployment Guide

## Supported Targets
1. **Heroku / Render**
   - Use Buildpack for Node.js.
   - Configure `.env` via dashboard.
   - Add managed MySQL add-on and import schema.
   - `npm start` runs web dyno.

2. **AWS (EC2 or Elastic Beanstalk)**
   - Provision Ubuntu host, install Node.js + MySQL (or RDS).
   - Upload `.env` via SSM Parameter Store.
   - Use PM2/systemd to keep `npm start` alive.
   - Configure ALB or Nginx reverse proxy with TLS; set `trust proxy`.

3. **Docker/Kubernetes**
   - Build image from Node base, copy repo, `npm ci`.
   - Mount `.env` or use secrets.
   - Deploy alongside MySQL stateful service.
   - Expose port 30000 via Service/Ingress.

## Environment Setup
- Ensure DB connectivity through VPC security groups or networking rules.
- Set `NODE_ENV=production` before boot to enforce secure cookies.
- Provide persistent storage for `/logs` if you want to retain files; otherwise redirect logs to stdout (`logger` writes to both).

## Build & Start Commands
```bash
npm install --production
npm run build   # optional step if bundling front-end assets
npm start       # runs `node src/app.js`
```
Use process managers:
```bash
pm2 start src/app.js --name 14stars --env production
# or
NODE_ENV=production PORT=8080 node src/app.js
```

## Scaling Notes
- Application is stateless besides DB and sessions; with MySQL session store, use a shared DB accessible to all instances.
- Horizontal scaling requires sticky sessions or migrating to Redis-based session store.
- Increase `connectionLimit` in `dbConfig` for high throughput.
- Use load balancers to distribute traffic; ensure health checks hit a cheap endpoint (`GET /parents/guardianNames`).

## Logs & Monitoring
- **File Logs** – Default path `logs/YYYY-MM-DD.log`. Rotate via external logrotate or ship to centralized service (CloudWatch, ELK).
- **Metrics** – `requestLogger` already records duration; integrate with APM by wrapping `logger`.
- **Health Checks** – Add `/healthz` route (recommended) to verify DB connectivity.
- **Alerts** – Monitor DB connections, error log rate, and substitute request backlog to stay ahead of operational issues.
