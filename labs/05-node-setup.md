# Lab 5 — Node.js project setup

**Lecture:** [5 — Node.js fundamentals](../lectures/05-nodejs.md) · **Time:** 2 h

### Goals
- Create the `task-board` Node project that grows until lab 15.
- Practise ESM modules, async/await, the file system and the event loop.

### Steps
1. Check `node --version` (≥ 20). Create the project:
   ```bash
   mkdir task-board && cd task-board
   npm init -y
   npm pkg set type=module
   npm pkg set scripts.dev="node --watch --env-file=.env src/server.js"
   npm pkg set scripts.test="node --test"
   mkdir -p src/views src/routes src/middleware public test
   printf 'node_modules/\n.env\n' > .gitignore
   ```
2. **Event loop.** Write `playground/loop.js` with the snippet from lecture 5 §2, predict the output, then run it.
3. **Blocking.** Write `playground/block.js`: a `setInterval` printing a dot every 100 ms and, after 1 s, a synchronous loop running 3 s. Observe the gap. Then replace it with `await new Promise(r => setTimeout(r, 3000))`.
4. **Modules.** `src/util/slug.js` exporting `slugify()`, imported from `playground/use-slug.js`.
5. **Files.** `playground/tasks-cli.js`: `node playground/tasks-cli.js add "Buy milk"` / `list` / `done 1` storing tasks in `data/tasks.json` with `node:fs/promises` (`process.argv`).
6. **First test.** `test/slug.test.js`:
   ```js
   import { test } from 'node:test';
   import assert from 'node:assert/strict';
   import { slugify } from '../src/util/slug.js';
   test('slugify', () => assert.equal(slugify(' Hello World! '), 'hello-world-'));
   ```
   Run `npm test`.

### Checkpoints (graded)
- [ ] Project skeleton with `package.json` (`type: module`, scripts) and `.gitignore` committed (0.5 pt)
- [ ] Working `tasks-cli.js` using async file I/O (1 pt)
- [ ] You can explain the output order of `loop.js` and the gap in `block.js` (0.5 pt)

### Extra tasks
- Make the CLI handle a missing or corrupted JSON file gracefully.
- Read a large file with a stream and count its lines without loading it into memory.
