# Lab 14 — Validation, security headers and tests

**Lecture:** [14 — Validation, security, testing](../lectures/14-security-testing.md) · **Time:** 2 h

### Goals
- Centralise input validation, add security headers and run an OWASP-style self-review.
- Build a test suite with `node:test`: unit tests and HTTP integration tests.

### Steps
1. `src/validation.js`: `validateTask`, `validateBoard`, `validateRegistration`, `parseId`, `parseTags`, returning `{ ok, values, errors }`. Use them in every handler. Bad ids give 404.
2. `securityHeaders` middleware: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`. Open the browser console and fix any CSP violations.
3. Make `src/app.js` export `createServer({ logRequests })` without calling `listen`. `src/server.js` only starts it.
4. Unit tests (`test/unit.test.js`): html escaping, router, validation, passwords, cookie parsing.
5. Integration tests (`test/http.test.js`) on port `0`:
   - `/health` → 200 JSON
   - unknown route → 404
   - `/boards` anonymous → 303 to `/login`; with `HX-Request` → `HX-Redirect`
   - POST without CSRF → 403
   - static file → ETag → 304; path traversal → 403
   - body > limit → 413
   Reference: [`examples/task-board/test/`](../examples/task-board/test/).
6. **DB tests (optional but recommended).** Create `taskboard_test`, run `DATABASE_URL=…/taskboard_test npx prisma migrate reset --force`, then test register → login → create board → create task with `fetch` and cookies.
7. Coverage: `node --test --experimental-test-coverage`.
8. **Self-review.** Fill in the OWASP table from lecture 14 §2 for *your* app in `lab14.md`.

### Checkpoints (graded)
- [ ] All handlers use the validation module; invalid input never reaches Prisma (0.5 pt)
- [ ] At least 15 passing tests including ≥ 5 HTTP integration tests (1 pt)
- [ ] OWASP self-review in `lab14.md` (0.5 pt)

### Extra tasks
- Add SRI (`integrity="sha384-…"`, `crossorigin`) to the CDN tags.
- Fuzz the forms with very long and Unicode inputs; fix what breaks.
