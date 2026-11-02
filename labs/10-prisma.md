# Lab 10 — Prisma: schema, migrations, CRUD

**Lecture:** [10 — ORM & Prisma](../lectures/10-orm-prisma.md) · **Time:** 2 h

### Goals
- Introduce Prisma, describe the model in `schema.prisma` and create migrations.
- Replace the `pg` repository with Prisma Client.

### Steps
1. Install and init:
   ```bash
   npm i @prisma/client && npm i -D prisma
   npx prisma init --datasource-provider postgresql
   ```
   Use a **new** database `taskboard_prisma` in `DATABASE_URL` (Prisma needs permission to create a shadow DB, see [setup](../resources/setup.md)).
2. In `prisma/schema.prisma` define `enum Status` and `model Task` (title, description, status, timestamps) with `@map/@@map` to snake_case. Priority is added in step 7 as a second migration.
3. `npx prisma migrate dev --name init`, then open `prisma/migrations/*/migration.sql` and compare it with your lab 9 SQL.
4. `src/db.js`: export a single `PrismaClient`.
5. Rewrite the repository/handlers with `findMany` (with `where`, `orderBy`), `findUnique`, `create`, `update`, `delete`. Turn `P2025` into 404 in your error handler.
6. Turn on `log: ['query']` and look at the generated SQL for the list page.
7. Add a field: `priority Priority @default(MEDIUM)` → `npx prisma migrate dev --name add_priority`. Show priority badges in `taskCard`.
8. `npx prisma studio`: edit a task and refresh your app.

### Simple exercises (warm-up)
Short, ungraded tasks to practise the basics before the main steps or if you finish early.
1. Add a simple model `Note { id Int @id @default(autoincrement()) text String }` and run a migration.
2. Open Prisma Studio and add two records by hand.
3. Use `prisma.note.create` to insert a note from a script.
4. List all notes with `findMany`, ordered by `id` descending.
5. Find one note by id with `findUnique`, then update its text with `update`.
6. Delete a note with `delete` and count the remaining ones with `count`.

### Checkpoints (graded)
- [ ] Two migrations committed; the app runs on Prisma only (1 pt)
- [ ] Missing task → 404 via `P2025` / `findUnique` returning `null` (0.5 pt)
- [ ] You can explain `migrate dev` vs `migrate deploy` and the shadow database (0.5 pt)

### Extra tasks
- Use `$queryRaw` for a status statistics query and compare it with `groupBy`.
- Add a `@@index([status])` and check the migration SQL.
