# Lab 12 — HTMX interactions

**Lecture:** [12 — HTMX](../lectures/12-htmx.md) · **Time:** 2 h

### Goals
- Make the board interactive without page reloads by returning HTML fragments.
- Reuse the same view functions for full pages and partials.

### Steps
1. Add to `layout`: `<script src="https://unpkg.com/htmx.org@2.0.3" defer></script>`.
2. Add `ctx.isHtmx` (`req.headers['hx-request'] === 'true'`) and send `Vary: HX-Request` in `ctx.html`.
3. **Add task.** New-task form gets `hx-post="/boards/:id/tasks" hx-target="#col-TODO" hx-swap="beforeend"`. For HTMX requests the handler returns `taskCard(task)` + a fresh form with `hx-swap-oob="true"` (this resets the input). Non-HTMX requests still redirect (progressive enhancement).
4. **Move task.** Buttons `hx-patch="/tasks/:id/status" hx-vals='{"status":"DOING"}' hx-target="#columns" hx-swap="outerHTML"`. The handler returns `columns(tasks)`.
5. **Delete.** `hx-delete="/tasks/:id" hx-target="#task-:id" hx-swap="outerHTML" hx-confirm="Delete?"`. Respond `200` with an empty body.
6. **Inline edit.** `GET /tasks/:id/edit` returns the form, `PUT /tasks/:id` returns the card (or the form with errors), and Cancel uses `hx-get="/tasks/:id"`.
7. **Active search.** `<input type="search" name="q" hx-get="/boards/:id/tasks" hx-trigger="input changed delay:300ms, search" hx-target="#columns" hx-swap="outerHTML" hx-indicator="#spinner">`.
8. Watch the Network tab: compare response sizes of full pages and fragments, and look at the `HX-*` request headers.
9. Compare with lab 4: how many lines of client JS did you write this time?

The reference implementation is in [`examples/task-board/src/routes/`](../examples/task-board/src/routes/) and [`src/views/board.js`](../examples/task-board/src/views/board.js).

### Checkpoints (graded)
- [ ] Add, move, delete and inline edit work without reloads (1 pt)
- [ ] Active search with debouncing and an indicator (0.5 pt)
- [ ] The board still works (add/delete board, open board) with JavaScript disabled for full-page routes (0.5 pt)

### Extra tasks
- Show a Bootstrap toast after deleting, using the `HX-Trigger` response header and a small listener.
- Add `hx-boost="true"` to `<body>` and observe navigation.
- Infinite scroll for a long task list with `hx-trigger="revealed"`.
