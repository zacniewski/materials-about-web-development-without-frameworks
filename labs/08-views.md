# Lab 8 — Views: layout, partials, escaping

**Lecture:** [8 — Server-side templating & XSS](../lectures/08-templating.md) · **Time:** 2 h

### Goals
- Write a safe-by-default `html` tagged template and organise views as functions.
- Prove that stored XSS is impossible in your app.

### Steps
1. `src/views/html.js`: `escapeHtml`, `SafeHtml`, `raw`, `html` (lecture 8 §3). Reference: [`examples/task-board/src/views/html.js`](../examples/task-board/src/views/html.js).
2. `test/html.test.js`: escaping, nested templates, arrays, `null`/`false`.
3. `src/views/layout.js`: `layout({ title, user, body })` with the Bootstrap navbar from lab 3.
4. `src/views/board.js`: `taskCard(task)`, `columns(tasks)` (three columns by status), `newTaskForm({ values, errors })`, `boardPage(...)`.
5. Add `ctx.render(title, body, status)` via a small `renderer` middleware that wraps `body` in `layout`.
6. Rewrite all handlers to use views. Add tasks with `status` (`TODO/DOING/DONE`) and a "move" action: `POST /tasks/:id/status`.
7. **XSS test.** Create a task titled `<script>alert(1)</script>` and another with `" onmouseover="alert(1)` in a field rendered inside an attribute. Nothing may execute. View the page source and find the escaped entities.
8. Forms with errors: `is-invalid`, message, and the user's value kept (status 422).

### Simple exercises (warm-up)
Short, ungraded tasks to practise the basics before the main steps or if you finish early.
1. Write a view function `hello(name)` that returns an `<h1>` with the name.
2. Call your `html` tag with `<b>hi</b>` as a value and check that it is escaped.
3. Render an array of three task titles as a `<ul>` using `map`.
4. Create a `layout(title, body)` function and use it for two different pages.
5. Make a partial `taskItem(task)` and reuse it on two pages.
6. Show a message “No tasks yet” when the task list is empty.

### Checkpoints (graded)
- [ ] All HTML produced through `html`; no string concatenation with user data (1 pt)
- [ ] XSS attempts from step 7 are rendered harmlessly (0.5 pt)
- [ ] Validation errors shown with Bootstrap styles and value kept (0.5 pt)

### Extra tasks
- Add `Content-Security-Policy: default-src 'self'; style-src 'self' https://cdn.jsdelivr.net` and check the console.
- Write a `safeUrl(href)` helper allowing only `http:`, `https:` and relative URLs.
