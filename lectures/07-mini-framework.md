# Lecture 7 — Building a mini-framework: router, middleware, errors

**Goals:** see what Express/Koa really do by writing it ourselves in ~150 lines. That code becomes `examples/task-board/src/router.js` and `src/app.js`.

### 1. Design
- A **context object** `ctx` per request: `{ req, res, method, url, path, query, params, body, state }` plus helpers `ctx.html()`, `ctx.redirect()`, `ctx.json()`.
- **Middleware** is `async (ctx, next) => {...}`, the "onion" model.
- A **router** maps `METHOD + path pattern` to handler chains and extracts `:params`.

```mermaid
graph LR
  R[request] --> L[logger] --> E[error handler] --> S[static] --> B[body parser] --> Ses[session] --> Rt[router] --> H[handler]
  H -.response.-> Rt -.-> Ses -.-> B -.-> S -.-> E -.-> L -.-> Out[response]
```

### 2. Composing middleware
```js
export function compose(middleware) {
  return function run(ctx) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called twice'));
      index = i;
      const fn = middleware[i];
      if (!fn) return Promise.resolve();
      try { return Promise.resolve(fn(ctx, () => dispatch(i + 1))); }
      catch (err) { return Promise.reject(err); }
    }
    return dispatch(0);
  };
}
```
```mermaid
sequenceDiagram
  participant L as logger
  participant E as errors
  participant R as router
  participant H as handler
  L->>E: await next()
  E->>R: await next()
  R->>H: handler(ctx)
  H-->>R: ctx.html(...)
  R-->>E: returns
  E-->>L: returns
  L->>L: log "GET /tasks 200 12ms"
```

### 3. The router
```js
export class Router {
  #routes = [];
  add(method, pattern, ...handlers) {
    const keys = [];
    const regex = new RegExp('^' + pattern
      .replace(/\/:(\w+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }) + '/?$');
    this.#routes.push({ method, regex, keys, handlers });
    return this;
  }
  get(p, ...h) { return this.add('GET', p, ...h); }
  post(p, ...h) { return this.add('POST', p, ...h); }
  put(p, ...h) { return this.add('PUT', p, ...h); }
  patch(p, ...h) { return this.add('PATCH', p, ...h); }
  delete(p, ...h) { return this.add('DELETE', p, ...h); }

  middleware() {
    return async (ctx, next) => {
      let pathMatched = false;
      for (const r of this.#routes) {
        const m = r.regex.exec(ctx.path);
        if (!m) continue;
        pathMatched = true;
        if (r.method !== ctx.method && !(r.method === 'GET' && ctx.method === 'HEAD')) continue;
        ctx.params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        return compose(r.handlers)(ctx);
      }
      if (pathMatched) ctx.throw(405, 'Method Not Allowed');
      return next();
    };
  }
}
```
Usage:
```js
const router = new Router();
router.get('/tasks', listTasks);
router.get('/tasks/:id', loadTask, showTask);   // per-route middleware
router.post('/tasks', requireAuth, createTask);
```

### 4. Context and the application
```js
export function createApp() {
  const stack = [];
  const app = {
    use(fn) { stack.push(fn); return app; },
    handler() {
      const run = compose(stack);
      return async (req, res) => {
        const ctx = createContext(req, res);
        try {
          await run(ctx);
          if (!res.writableEnded) ctx.throw(404, 'Not Found');
        } catch (err) { /* last-resort error handler, see below */ }
      };
    },
  };
  return app;
}
```

### 5. Error handling
```js
export class HttpError extends Error {
  constructor(status, message, expose = status < 500) { super(message); this.status = status; this.expose = expose; }
}
export const errorHandler = async (ctx, next) => {
  try { await next(); }
  catch (err) {
    const status = err.status ?? 500;
    if (status >= 500) console.error(err);
    ctx.html(errorPage(status, err.expose ? err.message : 'Internal Server Error'), status);
  }
};
```
Operational errors (404, validation) are expected, while programmer errors (`TypeError`) should be logged and answered with 500 without leaking details.

### 6. Typical middleware
| Middleware | Responsibility |
|-----------|----------------|
| `logger` | method, path, status, duration |
| `errorHandler` | turns exceptions into pages |
| `serveStatic('/static', dir)` | files |
| `bodyParser` | urlencoded / JSON with limit |
| `methodOverride` | `_method` field → real method |
| `session` | cookie → `ctx.state.session` |
| `csrf` | token check on unsafe methods |
| `requireAuth` | 401/redirect when no user |

### 7. What frameworks add on top
Route trees (faster matching), content negotiation, streaming helpers, plugins, validation schemas. Now you know what is under the hood, so you can choose a framework consciously later.

### Recap questions
1. Explain the onion model. In what order does code before and after `await next()` run?
2. Why does `compose` guard against calling `next()` twice?
3. How does the router turn `/tasks/:id` into a regular expression?
4. When should the server reply 405 and when 404?
5. Why must error messages of 5xx errors not be shown to users?
