# Lab 13 — Registration, login, sessions, CSRF

**Lecture:** [13 — Sessions, auth, CSRF](../lectures/13-auth-sessions.md) · **Time:** 2 h

### Goals
- Implement registration and login with scrypt, DB-backed sessions and logout.
- Protect routes, enforce ownership and add CSRF protection.

### Steps
1. `src/lib/password.js`: `hashPassword`, `verifyPassword` (scrypt + salt + `timingSafeEqual`), `randomToken`. Unit-test them.
2. Cookies: `parseCookies`, `serializeCookie` (`HttpOnly`, `SameSite=Lax`, `Secure` in production), `ctx.cookies`, `ctx.setCookie`.
3. Routes `GET/POST /register`, `GET/POST /login`, `POST /logout` (lecture 13 §4). Use the generic error "Invalid email or password." and handle `P2002` (email taken).
4. `src/middleware/session.js`: read the `sid` cookie, then load `Session` + `User` and check `expiresAt`. `startSession` creates a **new** random id on login.
5. `requireAuth`: anonymous users are redirected to `/login` (for HTMX requests, send `HX-Redirect`).
6. Remove the fixed user from lab 11. Every query filters by owner:
   ```js
   prisma.board.findFirst({ where: { id, ownerId: ctx.state.user.id } })
   prisma.task.findFirst({ where: { id, board: { ownerId: ctx.state.user.id } } })
   ```
7. **IDOR test.** Register two users. As user B, try `GET /boards/<A's id>` and `curl -X DELETE` on A's task. Both must return 404.
8. **CSRF.** Implement the double-submit cookie from [`src/middleware/security.js`](../examples/task-board/src/middleware/security.js): a `csrf` cookie, a hidden `_csrf` field in every form, `hx-headers='{"X-CSRF-Token": …}'` on `<body>`, and a 403 on mismatch. Test it with an `evil.html` page on another port that auto-submits a form to your app.
9. Update the seed to use `hashPassword('password123')`.

### Simple exercises (warm-up)
Short, ungraded tasks to practise the basics before the main steps or if you finish early.
1. Hash a password with `crypto.scrypt` and print the result in hex.
2. Verify a password against the hash with `timingSafeEqual`.
3. Set a cookie `hello=world; HttpOnly` from a route and read it back on the next request.
4. Generate a random session id with `crypto.randomBytes(32).toString('hex')`.
5. Write a middleware that returns `401` if no user is logged in.
6. Show the logged-in user’s name in the navbar, or a “Log in” link otherwise.

### Checkpoints (graded)
- [ ] Register/login/logout with hashed passwords and DB sessions (1 pt)
- [ ] Other users' boards and tasks return 404 (0.5 pt)
- [ ] CSRF attack from `evil.html` fails with 403 (0.5 pt)

### Extra tasks
- Rate-limit `POST /login` (10/min per IP) and log failed logins.
- "Log out everywhere": delete all sessions of the user.
- A scheduled cleanup that deletes expired sessions.
