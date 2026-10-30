# Syllabus — Web Development without Frameworks

### Course data
| Item | Value |
|------|-------|
| Lectures | 30 h (15 × 2 h) |
| Laboratories | 30 h (15 × 2 h) |
| Project | 15 h (team of 2–3) |
| Prerequisites | Basic programming (any language), basic command line |
| Language | English |

### Philosophy
Frameworks hide the mechanics of the Web. In this course students build everything a framework normally provides — routing, body parsing, middleware, templating, sessions, CSRF protection — on top of Node.js `node:http`. The only "big" library is **Prisma**, because the course explicitly covers ORMs. HTMX and Bootstrap are used on the front end because they keep the application *hypermedia-driven* and server-rendered.

### Learning outcomes
After the course a student can:
1. **LO1** Explain the HTTP request/response cycle, URLs, headers, status codes, cookies and caching.
2. **LO2** Write semantic, accessible HTML and responsive layouts with Bootstrap 5.
3. **LO3** Manipulate the DOM and use `fetch` in browser JavaScript.
4. **LO4** Build an HTTP server with `node:http` including a custom router, middleware chain, body parsing and static files.
5. **LO5** Render HTML on the server safely (escaping, XSS prevention).
6. **LO6** Design a relational schema, write SQL, and use Prisma for migrations, relations and transactions.
7. **LO7** Build interactive pages with HTMX partial updates.
8. **LO8** Implement session-based authentication, password hashing and CSRF protection.
9. **LO9** Validate input, apply OWASP Top 10 guidance and write automated tests with `node:test`.
10. **LO10** Configure, log and deploy a Node.js application.

### Weekly plan
| Week | Lecture | Lab | LOs |
|------|---------|-----|-----|
| 1 | How the Web works | HTTP by hand (curl, DevTools) | LO1 |
| 2 | HTML5, forms, accessibility | Static task board pages | LO2 |
| 3 | CSS & Bootstrap 5 | Bootstrap layout | LO2 |
| 4 | Browser JavaScript | DOM & fetch | LO3 |
| 5 | Node.js fundamentals | Node project setup | LO4 |
| 6 | `node:http` server | First HTTP server | LO1, LO4 |
| 7 | Mini-framework | Router & middleware | LO4 |
| 8 | Templating, XSS | Views | LO5 |
| 9 | SQL & PostgreSQL (`pg`) | Raw SQL | LO6 |
| 10 | ORM & Prisma | Prisma schema & CRUD | LO6 |
| 11 | Relations, transactions, N+1 | Relations & seeding | LO6 |
| 12 | HTMX | HTMX interactions | LO7 |
| 13 | Sessions, auth, CSRF | Login & sessions | LO8 |
| 14 | Validation, security, testing | Validation & tests | LO9 |
| 15 | Deployment & recap | Production readiness | LO10 |

Project work runs in parallel from week 6 (see [project/README.md](project/README.md)).

### Grading
| Component | Weight | Notes |
|-----------|--------|-------|
| Labs | 30 % | 15 labs, each graded on checkpoints (0–2 pts). At most 2 missed labs. |
| Project | 40 % | Rubric in `project/README.md`. |
| Final test | 30 % | Written/online test from lecture material (recap questions are representative). |

Grade scale: ≥ 91 % — 5.0, ≥ 81 % — 4.5, ≥ 71 % — 4.0, ≥ 61 % — 3.5, ≥ 51 % — 3.0, otherwise 2.0.

### Rules
- No web frameworks (Express, Fastify, Koa, Hapi, Nest, Next…) and no SPA frameworks. Allowed libraries: `@prisma/client`, `prisma`, `pg`, `dotenv` (optional — Node ≥ 20 has `--env-file`), testing helpers from Node core.
- Using AI assistants is allowed if declared; students must be able to explain every line they submit.

### Literature
- MDN Web Docs — https://developer.mozilla.org
- Node.js documentation — https://nodejs.org/docs/latest/api/
- Prisma documentation — https://www.prisma.io/docs
- C. Gross, A. Stepinski, D. Akşimşek, *Hypermedia Systems* — https://hypermedia.systems
- OWASP Top 10 — https://owasp.org/www-project-top-ten/
- PostgreSQL documentation — https://www.postgresql.org/docs/
