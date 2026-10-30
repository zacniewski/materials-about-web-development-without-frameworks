# Environment setup

### 1. Node.js ≥ 20
```bash
node --version   # v20.x or newer
npm --version
```
If missing, install via [nvm](https://github.com/nvm-sh/nvm): `nvm install 22 && nvm use 22`.

### 2. PostgreSQL (lab machines)
PostgreSQL is already installed in the laboratory — **no Docker needed**. Ask the lab admin for your account or use the local server:

```bash
psql --version
# connect as your lab user
psql -h localhost -U <student> -d postgres
```

Create your own databases (one for development, one for tests):
```sql
CREATE DATABASE taskboard_dev;
CREATE DATABASE taskboard_test;
```

Prisma's `migrate dev` needs a *shadow database*. If your user cannot create databases, ask for `CREATEDB` permission or create one manually and set `SHADOW_DATABASE_URL`.

### 3. Connection string
Every project uses a `.env` file (never committed):
```
DATABASE_URL="postgresql://student:secret@localhost:5432/taskboard_dev?schema=public"
SESSION_SECRET="change-me-to-a-long-random-string"
PORT=3000
```
Node ≥ 20 loads it with `node --env-file=.env src/server.js`.

### 4. Editor
Any editor works (WebStorm, VS Code, vim). Useful: the Prisma plugin, a Mermaid preview, an EditorConfig plugin.

### 5. Tools
- `curl` — making raw HTTP requests
- Browser DevTools — Network tab, Elements, Console
- `git` — every lab and the project are versioned

### 6. Verify
```bash
cd examples/task-board
cp .env.example .env   # edit DATABASE_URL
npm install
npx prisma generate    # newer npm versions may skip Prisma's install scripts
npx prisma migrate dev
npm run seed
npm start              # http://localhost:3000
npm test
```
