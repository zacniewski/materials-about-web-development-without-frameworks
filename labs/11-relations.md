# Lab 11 — Relations, N+1 and seeding

**Lecture:** [11 — Relations, transactions, N+1](../lectures/11-relations-transactions.md) · **Time:** 2 h

### Goals
- Extend the schema to the full Task board model: `User`, `Board`, `Task`, `Tag` (N–M) and `Session`.
- Load related data efficiently and seed the database idempotently.

### Steps
1. Extend `schema.prisma` to match [`examples/task-board/prisma/schema.prisma`](../examples/task-board/prisma/schema.prisma) (use `passwordHash` as a placeholder string for now; real hashing comes in lab 13). Migrate: `npx prisma migrate dev --name relations`.
2. Draw the ER diagram of your schema in Mermaid (`erDiagram`) inside `lab11.md`.
3. Routes:
   - `GET /boards` lists boards with a task count (`include: { _count: { select: { tasks: true } } }`)
   - `POST /boards` creates a board
   - `GET /boards/:id` shows the three columns of that board's tasks with tags
   - `POST /boards/:id/tasks` creates a task in the board
   - `POST /boards/:id` with `_method=DELETE` deletes a board (cascade)
   Until lab 13, use a fixed "current user" `ctx.state.user = { id: 1 }`.
4. Tags: an edit form with a comma-separated `tags` field. Save with `tags: { set: [], connectOrCreate: [...] }`.
5. **N+1 hunt.** Write `/boards` once with a loop of `findMany` per board, enable `log: ['query']`, and count the queries for 5 boards. Rewrite with `include`/`_count` and count again.
6. **Seed.** `prisma/seed.js` creates a demo user, a board, tasks and tags with `upsert`/`connectOrCreate`. Register it in `package.json` (`"prisma": { "seed": "node --env-file=.env prisma/seed.js" }`) and run `npx prisma db seed` twice. The second run must not fail.
7. **Transaction.** "Archive board": move all DONE tasks to an "Archive" board and delete them from the source in one `prisma.$transaction`.

### Simple exercises (warm-up)
Short, ungraded tasks to practise the basics before the main steps or if you finish early.
1. Draw (on paper or in Mermaid) the relations between `User`, `Board` and `Task`.
2. Create one user with one board using a nested `create`.
3. Load a board together with its tasks using `include`.
4. Select only the `title` of tasks with `select`.
5. Add a tag to a task and list all tasks with a given tag.
6. Turn on query logging and count how many queries a page makes.

### Checkpoints (graded)
- [ ] Migration with all relations; ER diagram in `lab11.md` (0.5 pt)
- [ ] Boards → tasks → tags displayed with a constant number of queries (1 pt)
- [ ] Seed is idempotent; the transaction demo works (0.5 pt)

### Extra tasks
- Add `assignee` to tasks with a `<select>` of users and filter "my tasks".
- Convert `Tag` to an explicit join model `TaskTag` with `addedAt`.
