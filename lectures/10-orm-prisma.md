# Lecture 10 — ORM concepts and Prisma

**Goals:** understand what an ORM is, its trade-offs, and use Prisma for schema, migrations and CRUD.

### In plain words
Writing raw SQL is like phoning a restaurant and dictating every recipe step to the chef. An **ORM** is more like a waiter with a menu. You say "one task, with its tags, please", and the waiter turns that into the precise instructions (SQL) the kitchen (PostgreSQL) understands. **Prisma** goes further: you describe your data once in a *blueprint* (`schema.prisma`), and Prisma builds both the database tables (migrations) and a ready-made JavaScript client with autocomplete. The kitchen is still there, though, and sometimes you need to talk to the chef directly (`$queryRaw`). Terms used here are in the [glossary](../resources/glossary.md).

```mermaid
flowchart LR
  JS["prisma.task.findMany({ where })"] --> PC["Prisma Client"] --> SQL["SELECT ... FROM tasks WHERE ..."] --> DB[("PostgreSQL")]
  DB --> Rows["rows"] --> PC --> Obj["JS objects in camelCase"]
```

### 1. What is an ORM?
An **Object-Relational Mapper** maps tables to objects or classes and generates SQL for you.

| Pattern | Examples | Idea |
|---------|----------|------|
| Active Record | Rails AR, Django ORM | objects save themselves (`task.save()`) |
| Data Mapper | Hibernate, SQLAlchemy, TypeORM | a separate mapper/session persists plain objects |
| Query builder / schema-first client | **Prisma**, Drizzle, Knex | typed client generated from a schema |

**Pros:** productivity, migrations, type safety, portability. **Cons:** hidden SQL, N+1 traps, leaky abstraction for complex queries (an escape hatch is `$queryRaw`).

### 2. Prisma architecture
```mermaid
graph LR
  S[schema.prisma] -->|prisma migrate dev| M[SQL migrations]
  M --> DB[(PostgreSQL)]
  S -->|prisma generate| C["@prisma/client"]
  App[Node app] --> C
  C -->|query engine| DB
```

### 3. Setup
```bash
npm i @prisma/client
npm i -D prisma
npx prisma init --datasource-provider postgresql
```

### 4. The schema
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Status {
  TODO
  DOING
  DONE
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(200)
  status    Status   @default(TODO)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("tasks")
}
```
`@map`/`@@map` keep SQL `snake_case` while JS uses `camelCase`.

### 5. Migrations
```bash
npx prisma migrate dev --name init      # dev: create + apply + generate
npx prisma migrate deploy               # prod/CI: apply existing ones
npx prisma migrate reset                # drop, re-apply, seed (dev only!)
npx prisma studio                       # GUI browser
```
```mermaid
sequenceDiagram
  Dev->>Prisma CLI: migrate dev --name add_priority
  Prisma CLI->>Shadow DB: replay existing migrations
  Prisma CLI->>Prisma CLI: diff schema vs shadow
  Prisma CLI->>Dev: writes migrations/2026..._add_priority/migration.sql
  Prisma CLI->>Dev DB: apply
  Prisma CLI->>Prisma CLI: prisma generate
```
Migrations are **committed**: they are the history of your schema.

### 6. The client and CRUD
```js
// src/db.js
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient({ log: ['warn', 'error'] });   // ONE instance per process
```
```js
const task = await prisma.task.create({ data: { title: 'Write lab 10' } });
const all  = await prisma.task.findMany({ where: { status: { not: 'DONE' } }, orderBy: { createdAt: 'desc' }, take: 20, skip: 0 });
const one  = await prisma.task.findUnique({ where: { id: 7 } });          // null if missing
const upd  = await prisma.task.update({ where: { id: 7 }, data: { status: 'DONE' } });
await prisma.task.delete({ where: { id: 7 } });
const n    = await prisma.task.count({ where: { title: { contains: 'lab', mode: 'insensitive' } } });
const sel  = await prisma.task.findMany({ select: { id: true, title: true } });
```
Generated SQL (with `log: ['query']`):
```sql
SELECT "public"."tasks"."id", "public"."tasks"."title" FROM "public"."tasks" WHERE 1=1 OFFSET $1
```

### 7. Error handling
```js
import { Prisma } from '@prisma/client';
try { await prisma.task.update({ where: { id }, data }); }
catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') ctx.throw(404, 'Task not found');
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') ctx.throw(409, 'Already exists');
  throw e;
}
```

### 8. Raw SQL when needed
```js
const stats = await prisma.$queryRaw`SELECT status, count(*)::int AS n FROM tasks GROUP BY status`;
```
Tagged templates are parameterised. Never use `$queryRawUnsafe` with user input.

### 9. More theory: schema-first workflow and the type mapping
Prisma's **single source of truth** is `schema.prisma`. You never edit tables by hand. Instead you:

1. change the schema,
2. run `migrate dev`, which writes a new SQL migration file and applies it,
3. let `generate` rebuild the client so new fields show up in autocomplete.

```mermaid
flowchart TB
  A["Edit schema.prisma"] --> B["npx prisma migrate dev --name xyz"]
  B --> C["migrations/..._xyz/migration.sql (commit it!)"]
  B --> D["Dev DB updated"]
  B --> E["Client regenerated"]
  C --> F["CI / prod: npx prisma migrate deploy"]
```

| Prisma type | PostgreSQL type | JS value |
|-------------|-----------------|----------|
| `Int` | `integer` | `number` |
| `String` | `text` (or `@db.VarChar(n)`) | `string` |
| `Boolean` | `boolean` | `boolean` |
| `DateTime` | `timestamp(3)` | `Date` |
| `enum Status` | PostgreSQL enum | `'TODO'` string |
| `Field?` | nullable column | `null` allowed |

The life of one `findUnique` call:
```mermaid
sequenceDiagram
  participant H as Route handler
  participant C as PrismaClient
  participant E as Query engine
  participant DB as PostgreSQL
  H->>C: task.findUnique({ where: { id: 7 } })
  C->>E: validated query
  E->>DB: SELECT ... WHERE id = $1 LIMIT 1
  DB-->>E: row or nothing
  E-->>C: object or null
  C-->>H: { id: 7, title, createdAt: Date }
```

### 10. Worked example: adding a `priority` field end to end
**Step 1: change the schema.**
```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
}

model Task {
  // ...existing fields...
  priority Priority @default(MEDIUM)   // default so existing rows stay valid
}
```
**Step 2: create and apply the migration.**
```bash
npx prisma migrate dev --name add_priority
# creates prisma/migrations/<timestamp>_add_priority/migration.sql
```
**Step 3: use it in code.** The client now knows `priority`:
```js
// src/routes/tasks.js (simplified from the task-board app)
import { prisma } from '../db.js';                 // the ONE shared client

export async function createTask(ctx) {
  const boardId = Number(ctx.params.id);            // params are strings, so convert
  const priority = ['LOW', 'MEDIUM', 'HIGH'].includes(ctx.body.priority)
    ? ctx.body.priority                             // accept only known values
    : 'MEDIUM';
  const task = await prisma.task.create({
    data: { title: ctx.body.title.trim(), priority, boardId },
    select: { id: true, title: true, priority: true },   // return only what the view needs
  });
  return ctx.html(`<li id="task-${task.id}">${task.title}</li>`); // real app: html`` tag escapes!
}
```
**Step 4: query by it.**
```js
const urgent = await prisma.task.findMany({
  where: { boardId, priority: 'HIGH', status: { not: 'DONE' } }, // AND of all conditions
  orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],          // several sort keys
});
```

### 11. Worked example: "update or 404" helper
```js
import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

// Updates a task's status; turns "record not found" into a clean HTTP 404.
export async function setStatus(ctx, id, status) {
  try {
    return await prisma.task.update({ where: { id }, data: { status } });
  } catch (e) {
    // P2025 = "An operation failed because it depends on one or more records that were required but not found"
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      ctx.throw(404, 'Task not found');           // HttpError handled by the error middleware
    }
    throw e;                                       // anything else is a real 500
  }
}
```

### More theory: ORM patterns and trade-offs

| Pattern | Idea | Example tools |
|---------|------|---------------|
| Active Record | Objects save themselves (`task.save()`) | Rails AR, Sequelize |
| Data Mapper | Separate mapper/repository persists plain objects | TypeORM (data mapper mode), Doctrine |
| Query builder | Fluent SQL in code, no models | Knex |
| Schema-first client | Schema file generates a typed client | Prisma |
| Raw SQL | You write SQL | `pg` |

| | Raw SQL (`pg`) | Prisma |
|---|----------------|--------|
| Control over SQL | Full | Partial (`$queryRaw` escape hatch) |
| Type safety | Manual | Generated from schema |
| Migrations | Hand-written | `prisma migrate` |
| Relations | Manual JOINs | `include` / `select` |
| Learning curve | SQL | Prisma API + SQL basics |

See [Prisma: What is Prisma ORM?](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma) and [Prisma: Why Prisma ORM?](https://www.prisma.io/docs/orm/overview/introduction/why-prisma).

### More theory: relations in the Prisma schema

Relations are declared on both sides with [`@relation`](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations). The side holding the foreign key has the `fields`/`references` arguments. Full syntax: [Prisma schema reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference).

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  tasks Task[]
}

model Task {
  id     Int  @id @default(autoincrement())
  title  String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId Int
  @@index([userId])
}
```

```mermaid
erDiagram
    User ||--o{ Task : "tasks / user"
    User {
        Int id PK
        String email UK
    }
    Task {
        Int id PK
        String title
        Int userId FK
    }
```

### More theory: the migration workflow

```mermaid
flowchart LR
    A[Edit schema.prisma] --> B[prisma migrate dev]
    B --> C[SQL file in prisma/migrations]
    B --> D[Applied to dev DB]
    B --> E[prisma generate → typed client]
    C --> F[git commit]
    F --> G[prisma migrate deploy in production]
```

| Command | Where | What it does |
|---------|-------|--------------|
| `prisma migrate dev` | Development | Create + apply migration, regenerate client |
| `prisma migrate deploy` | CI / production | Apply pending migrations only |
| `prisma migrate reset` | Development | Drop DB, re-apply all, run seed |
| `prisma db push` | Prototyping | Sync schema without migration files |
| `prisma generate` | Anywhere | Regenerate the client |
| `prisma studio` | Development | GUI to browse data |

Docs: [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate), [Prisma CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference).

### More theory: querying relations and the N+1 problem

Loading a list and then one query per item is the "N+1" problem. Prisma solves it with [`include`/`select`](https://www.prisma.io/docs/orm/prisma-client/queries/select-fields) and [relation queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries).

```js
// N+1: 1 query for users + N for tasks
for (const u of await prisma.user.findMany()) {
  u.tasks = await prisma.task.findMany({ where: { userId: u.id } });
}
// Better: one call
const users = await prisma.user.findMany({ include: { tasks: true } });
```

Filtering, sorting and pagination: [Filtering and sorting](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting), [Pagination](https://www.prisma.io/docs/orm/prisma-client/queries/pagination).

### More theory: transactions and error codes

Use [`prisma.$transaction`](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) for atomic work — either an array of queries or an interactive callback:

```js
await prisma.$transaction(async (tx) => {
  await tx.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } });
  await tx.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } });
});
```

| Prisma code | Meaning | Typical HTTP |
|-------------|---------|--------------|
| `P2002` | Unique constraint failed | 409 / form error |
| `P2003` | Foreign key constraint failed | 400 |
| `P2025` | Record to update/delete not found | 404 |

Full list: [Prisma error reference](https://www.prisma.io/docs/orm/reference/error-reference). Raw SQL with tagged templates (`$queryRaw`) is parameterized; `$queryRawUnsafe` is not — see [Raw queries](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries).

### Common beginner mistakes
- **Calling `new PrismaClient()` in every file or request**, which opens too many connections. Export one instance from `src/db.js`.
- **Editing the database by hand** (in psql or Studio) instead of through migrations. The schema and the DB then drift apart.
- **Editing an already-applied migration file.** Create a new migration instead.
- **Running `migrate dev` or `migrate reset` in production.** Use `migrate deploy`.
- **Forgetting `await`**, so you get a pending Promise instead of data.
- **Using `findUnique` on a non-unique field.** It only accepts `@id`/`@unique` fields, so use `findFirst` otherwise.
- **Passing `req` strings straight into `where: { id }`.** Convert them to numbers first.
- **Reaching for `$queryRawUnsafe` with string concatenation**, which brings SQL injection right back.

### Try it yourself
1. Add a `description String?` field to `Task`, migrate, and look at the generated `migration.sql`.
2. Enable `log: ['query']` and write down the SQL for `findMany`, `count` and `update`.
3. Write a function `renameTask(id, title)` that returns 404 on `P2025`.
4. Add a `@unique` to a field, insert a duplicate, and catch `P2002` as 409.
5. Use `prisma studio` to browse the data, then compare it with `psql`.
6. Rewrite the "open tasks per user" query of Lecture 9 using `$queryRaw` with a tagged template.

### Recap questions
1. Compare Active Record and Data Mapper.
2. What do `prisma migrate dev` and `prisma migrate deploy` each do, and where do you use them?
3. Why should the app create only one `PrismaClient`?
4. What is the shadow database used for?
5. How do you turn Prisma error `P2025` into an HTTP 404?
6. Why should a new non-null column usually get a `@default`?
7. When would you choose `select` over returning the full model?

### Further reading / documentation

- [Prisma ORM documentation](https://www.prisma.io/docs/orm)
- [Prisma: What is Prisma ORM?](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma)
- [Prisma schema reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma: Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)
- [Prisma Client: CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Prisma Client: Relation queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)
- [Prisma Client: Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [Prisma Client: Raw queries](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries)
- [Prisma error reference](https://www.prisma.io/docs/orm/reference/error-reference)
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
