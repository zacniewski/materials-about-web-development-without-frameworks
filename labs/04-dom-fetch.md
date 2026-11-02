# Lab 4 — DOM, events and fetch

**Lecture:** [4 — Browser JavaScript](../lectures/04-browser-javascript.md) · **Time:** 2 h

### Goals
- Add client-side behaviour to the static board with vanilla JS.
- Feel the cost of client-side rendering, which motivates HTMX later.

### Steps
1. Copy `lab03/` to `lab04/`, add `<script type="module" src="app.js"></script>`.
2. **Add task (DOM only).** On form `submit`: `preventDefault()`, read `new FormData(form)`, create an `<article class="card">` with `createElement` + `textContent`, append it to the To-do column, then `form.reset()`.
3. **Event delegation.** One `click` listener on `<main>` handles the buttons `data-action="move"` (moves the card to the next column) and `data-action="delete"` (removes the card after `confirm()`).
4. **XSS experiment.** Temporarily build the card with `innerHTML = \`<h3>${title}</h3>\`` and enter `<img src=x onerror=alert(1)>` as the title. Observe what happens, then switch back to `textContent`.
5. **Persistence.** Save the tasks to `localStorage` as JSON and render them on load.
6. **fetch.** Serve the folder (`npx http-server lab04` or `python3 -m http.server`) and load initial tasks from `tasks.json` with `fetch`. Handle `!res.ok`.
7. **POST.** Send the new task to `https://httpbin.org/post` as JSON with `fetch` and log the echoed body.

### Simple exercises (warm-up)
Short, ungraded tasks to practise the basics before the main steps or if you finish early.
1. In the browser console, select the first `<h1>` with `document.querySelector` and change its text.
2. Add a button that increments a counter shown on the page every time it is clicked.
3. Toggle a CSS class (e.g. `text-decoration-line-through`) on a task when it is clicked.
4. Create a new `<li>` with `document.createElement` and append it to a list.
5. Listen to `input` events on a text field and show the current number of characters below it.
6. Use `fetch('https://httpbin.org/get')`, `await` the JSON and `console.log` the `url` field.

### Checkpoints (graded)
- [ ] Add/move/delete work with a single delegated listener (1 pt)
- [ ] You demonstrate the XSS with `innerHTML` and the fix (0.5 pt)
- [ ] Tasks survive a page reload; `fetch` errors are handled (0.5 pt)

### Extra tasks
- Implement drag and drop between columns using the HTML Drag and Drop API.
- Count how many lines of JS you wrote. Keep the number for lab 12.
