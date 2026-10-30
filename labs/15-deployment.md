# Lab 15 — Production readiness

**Lecture:** [15 — Deployment & recap](../lectures/15-deployment.md) · **Time:** 2 h

### Goals
- Make the Task board configurable, observable and robust.
- Rehearse a deployment on a lab machine and present the project status.

### Steps
1. `src/config.js` reads `PORT`, `NODE_ENV`, `DATABASE_URL`, and fails fast with a clear message if something required is missing.
2. Structured JSON logger (one line per request). Make sure no passwords, cookies or tokens are logged.
3. `/health` endpoint, and optionally check the DB with `prisma.$queryRaw\`SELECT 1\``.
4. Graceful shutdown on `SIGTERM`/`SIGINT`: `server.close()` → `prisma.$disconnect()` → exit; force exit after 10 s.
5. `server.headersTimeout`, `server.requestTimeout` set.
6. **Performance.** Install `autocannon` globally or with `npx`, run `npx autocannon -c 50 -d 10 http://localhost:3000/health`, then do the same for a board page while logged in (pass the cookie with `-H`). Note the requests/s and latency. Add an index or remove an N+1 and measure again.
7. **Deployment rehearsal.** In a fresh clone:
   ```bash
   npm ci
   npx prisma migrate deploy
   NODE_ENV=production npm start
   ```
   Write a `systemd` unit (lecture 15 §3) or a `start.sh` script, and document the steps in `DEPLOY.md`.
8. Behind a proxy (optional): run Caddy `caddy reverse-proxy --from :8080 --to :3000` and check that `Secure` cookies require HTTPS.

### Checkpoints (graded)
- [ ] Config validation, JSON logs and graceful shutdown work (1 pt)
- [ ] `DEPLOY.md` lets a colleague start your app from scratch (0.5 pt)
- [ ] Load test numbers before/after an optimisation in `lab15.md` (0.5 pt)

### Extra tasks
- gzip responses with `node:zlib` when `Accept-Encoding` allows it.
- Add a `Cache-Control: immutable` strategy with hashed static file names.
