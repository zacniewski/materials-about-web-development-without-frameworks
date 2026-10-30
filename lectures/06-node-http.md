# Lecture 6 — The `node:http` server

**Goals:** handle HTTP requests with nothing but Node core: routing by hand, query strings, request bodies, static files, correct status codes and headers.

### 1. Hello, HTTP
```js
import http from 'node:http';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Hello from node:http\n');
});
server.listen(3000, () => console.log('http://localhost:3000'));
```
`req` is an `http.IncomingMessage` (readable stream: `method`, `url`, `headers`); `res` is an `http.ServerResponse` (writable: `statusCode`, `setHeader`, `writeHead`, `write`, `end`).

```mermaid
sequenceDiagram
  participant C as Client
  participant N as Node (libuv)
  participant H as Your handler
  C->>N: TCP connection + request bytes
  N->>N: parse request line & headers
  N->>H: 'request' event (req, res)
  H->>H: read body chunks (stream)
  H->>N: res.writeHead / res.end
  N-->>C: response bytes
```

### 2. Manual routing
```js
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/') return sendHtml(res, '<h1>Home</h1>');
  if (req.method === 'GET' && url.pathname === '/tasks') {
    const q = url.searchParams.get('q') ?? '';
    return sendHtml(res, `<p>Searching for ${escapeHtml(q)}</p>`);
  }
  const m = url.pathname.match(/^\/tasks\/(\d+)$/);
  if (req.method === 'GET' && m) return sendHtml(res, `<p>Task #${m[1]}</p>`);
  res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
});

function sendHtml(res, html, status = 200) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}
```
Already in lecture 6 this `if`-chain gets ugly, which motivates the router in lecture 7.

### 3. Reading the body
The body arrives in chunks. Always set a **size limit**.
```js
export async function readBody(req, limit = 1_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Payload too large'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function parseBody(req) {
  const type = (req.headers['content-type'] ?? '').split(';')[0].trim();
  const raw = await readBody(req);
  if (type === 'application/x-www-form-urlencoded') return Object.fromEntries(new URLSearchParams(raw));
  if (type === 'application/json') return raw ? JSON.parse(raw) : {};
  return {};
}
```
`Object.fromEntries` keeps only the last value for repeated keys. Use `params.getAll('tag')` for multi-value fields.

### 4. Post/Redirect/Get
```mermaid
sequenceDiagram
  Browser->>Server: POST /tasks (form)
  Server->>Server: validate + save
  Server-->>Browser: 303 See Other, Location: /tasks
  Browser->>Server: GET /tasks
  Server-->>Browser: 200 list
  Note over Browser: Refresh repeats the GET, not the POST
```
```js
res.writeHead(303, { Location: '/tasks' }).end();
```

### 5. Static files (safely)
```js
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const PUBLIC = path.resolve('public');
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

async function serveStatic(req, res, pathname) {
  const file = path.join(PUBLIC, decodeURIComponent(pathname.replace(/^\/static\//, '')));
  if (!file.startsWith(PUBLIC + path.sep)) return res.writeHead(403).end();   // path traversal guard
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error();
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'public, max-age=3600',
    });
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end('Not found'); }
}
```
Without the guard, `GET /static/../../etc/passwd` would leak files.

### 6. Method override for HTML forms
HTML forms only send GET/POST. Either use `POST /tasks/7/delete`, or add `<input type="hidden" name="_method" value="DELETE">` and rewrite `req.method` after parsing. With HTMX (lecture 12) we can send real `DELETE`/`PUT`.

### 7. Errors and robustness
- Wrap handlers in `try/catch`; on error answer `500` and log the stack (never send it to the user).
- `server.on('clientError', ...)` handles malformed requests.
- `server.headersTimeout`, `server.requestTimeout` protect against slow clients.
- `process.on('SIGTERM', () => server.close())` gives a graceful shutdown.

### Recap questions
1. Why is `new URL(req.url, base)` needed instead of `req.url` directly?
2. Why must a body reader enforce a size limit? What status do you return?
3. Explain Post/Redirect/Get and the problem it solves.
4. Show a request that exploits a static server without a path-traversal guard.
5. What is the difference between `res.write` and `res.end`?
