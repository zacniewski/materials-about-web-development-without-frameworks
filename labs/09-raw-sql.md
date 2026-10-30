# Lab 9 — PostgreSQL and raw SQL with `pg`

**Lecture:** [9 — SQL & PostgreSQL](../lectures/09-sql-postgresql.md) · **Time:** 2 h

### Goals
- Connect to the lab PostgreSQL server and design the first tables by hand.
- Replace the in-memory array with SQL queries via `pg`, using parameters only.

### Steps
1. Connect: `psql -h localhost -U <you> -d postgres`, then `CREATE DATABASE taskboard_dev;` (see [setup](../resources/setup.md)).
2. `.env`: `DATABASE_URL="postgresql://<you>:<pass>@localhost:5432/taskboard_dev"`.
3. Write `sql/schema.sql` with `users`, `boards`, `tasks` (lecture 9 §2) and run it: `psql "$DATABASE_URL" -f sql/schema.sql`.
4. Seed manually with `INSERT … RETURNING id`. Practise queries in `psql`:
   - open tasks of board 1 with the assignee name (`LEFT JOIN`)
   - number of tasks per status (`GROUP BY`)
   - `EXPLAIN ANALYZE` the first query, before and after `CREATE INDEX … (board_id, status)`
5. `npm i pg`; `src/pg.js` exports a `Pool`. Create `src/repositories/tasks.js` with `listTasks(boardId, q)`, `getTask(id)`, `createTask(data)`, `updateStatus(id, status)`, `deleteTask(id)`, all with `$1` placeholders.
6. Use the repository in your handlers (they become `async`).
7. **SQL injection demo.** Write (in a scratch file, never in the app) a string-concatenated query `WHERE title LIKE '%${q}%'` and break it with `q = %' OR '1'='1`. Explain why the parameterised version is safe.
8. Transaction: `moveAllTasks(fromBoard, toBoard)` + delete the old board inside `BEGIN … COMMIT` with `ROLLBACK` on error.

### Checkpoints (graded)
- [ ] Schema with PK/FK/CHECK constraints and the index committed in `sql/schema.sql` (0.5 pt)
- [ ] The app works against PostgreSQL with parameterised queries only (1 pt)
- [ ] You demonstrate the injection and the transaction rollback (0.5 pt)

### Extra tasks
- Add search with `ILIKE` and pagination `LIMIT/OFFSET` (`?page=2`).
- Write down every pain point you hit (mapping names, migrations…). We fix them in lab 10.
