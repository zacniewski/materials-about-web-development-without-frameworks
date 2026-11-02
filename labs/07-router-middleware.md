# Lab 7 — Router and middleware chain

**Lecture:** [7 — Building a mini-framework](../lectures/07-mini-framework.md) · **Time:** 2 h

### Goals
- Replace the `if`-chain from lab 6 with your own `Router`, `compose` and context object.
- Move cross-cutting concerns into middleware.

### Steps
1. `src/router.js`: implement `compose(middleware)` and `class Router` with `get/post/put/patch/delete` and `:param` matching (lecture 7 §2–3). Reference: [`examples/task-board/src/router.js`](../examples/task-board/src/router.js).
2. `src/http-error.js`: `HttpError(status, message)`.
3. `src/context.js`: `createContext(req, res)` returning `{ req, res, method, path, query, params, body, state, cookies, html(), json(), redirect(), throw() }`.
4. `src/application.js`: `createApplication()` with `use(fn)` and `handler()` returning `(req, res) => …`.
5. Middleware (one file each in `src/middleware/`):
   - `logger` — logs method, path, status, duration
   - `errorHandler` — catches errors, renders an error page; 5xx are logged and hidden
   - `serveStatic('/static', 'public')`
   - `bodyParser({ limit })` and `methodOverride` (`_method` field)
6. `src/app.js`: build the stack in this order: logger → errorHandler → static → bodyParser → methodOverride → router.
7. Port all lab 6 routes to the router. Use per-route middleware `loadTask` which sets `ctx.state.task` or throws 404.
8. Tests in `test/router.test.js`: params extraction, 404 fall-through, 405, onion order of `compose`. Use [`examples/task-board/test/unit.test.js`](../examples/task-board/test/unit.test.js) as inspiration.

### Simple exercises (warm-up)
Short, ungraded tasks to practise the basics before the main steps or if you finish early.
1. Write a function `logger(ctx, next)` that prints the request time and calls `next()`.
2. Register two routes `GET /` and `GET /about` in your router and test both.
3. Add a route with a parameter, e.g. `GET /hello/:name`, and print `ctx.params.name`.
4. Make the router answer `405 Method Not Allowed` for `POST /about`.
5. Write a middleware that adds an `X-Lab: 7` header to every response.
6. Compose three middlewares that each print a number before and after `next()`; explain the output order.

### Checkpoints (graded)
- [ ] All routes go through your router; no `if (req.url === …)` left (1 pt)
- [ ] Throwing `HttpError(404)` in a handler renders your error page; a `TypeError` gives a generic 500 (0.5 pt)
- [ ] `npm test` passes with at least 4 router tests (0.5 pt)

### Extra tasks
- Add `router.use(prefix, subRouter)` for mounting routers.
- Measure the router with 1000 routes and think about how a trie would help.
