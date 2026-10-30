# Lab 6 — First HTTP server with `node:http`

**Lecture:** [6 — The node:http server](../lectures/06-node-http.md) · **Time:** 2 h

### Goals
- Serve the Task board pages from Node without any framework.
- Parse query strings and form bodies, implement Post/Redirect/Get and serve static files safely.

### Steps
1. `src/server.js`: create the server with `http.createServer`, listen on `process.env.PORT ?? 3000`. Run `npm run dev` (needs a `.env` file, which can be empty for now).
2. Manual routing with `new URL(req.url, 'http://localhost')`:
   - `GET /` → redirect `303` to `/tasks`
   - `GET /tasks` → HTML list of tasks from an in-memory array
   - `GET /tasks?q=milk` → filtered list
   - `GET /tasks/:id` (use a regex) → one task or `404`
   - anything else → `404` page
3. `src/middleware/body.js` (from lecture 6 §3): `readBody(req, limit)` and `parseUrlEncoded(raw)`. Return `413` if the body exceeds 100 kB.
4. `POST /tasks` → validate `title` (non-empty) → push → `303 /tasks`. On error re-render the form with status `422` and keep the value.
5. `POST /tasks/:id/delete` → remove → `303 /tasks`.
6. Static files: copy `app.css` from lab 3 to `public/`, and serve `/static/*` with correct `Content-Type`. Add the path-traversal guard and test it:
   ```bash
   curl -i --path-as-is http://localhost:3000/static/../package.json
   curl -i http://localhost:3000/static/..%2fpackage.json
   ```
7. Use your Bootstrap HTML from lab 3 as template strings (escaping comes in lab 8, so for now use only your own input).
8. Test everything with `curl -i` and the browser. Press F5 after adding a task and notice that nothing is posted twice.

### Checkpoints (graded)
- [ ] List, filter, add and delete tasks work with PRG (1 pt)
- [ ] Unknown routes give 404, too-large bodies give 413 (0.5 pt)
- [ ] Static files are served; path traversal returns 403/404 (0.5 pt)

### Extra tasks
- Add `ETag` + `If-None-Match` → `304` for static files.
- Support `HEAD` requests.
- Log `METHOD path status ms` for every request.
