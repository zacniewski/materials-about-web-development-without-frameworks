# Lab 2 — Static Task board pages

**Lecture:** [2 — HTML5, forms, accessibility](../lectures/02-html-forms-accessibility.md) · **Time:** 2 h

### Goals
- Write the static HTML prototypes of the Task board (they become our templates in lab 8).
- Build accessible forms and check them with a validator and with the keyboard.

### Steps
1. Create `lab02/` with `index.html` (board), `login.html`, `register.html`.
2. `index.html` structure:
   ```html
   <header><nav>Task board · My boards · Log out</nav></header>
   <main>
     <h1>Course preparation</h1>
     <form action="https://httpbin.org/post" method="post"> <!-- new task form --> </form>
     <section aria-labelledby="todo-h"><h2 id="todo-h">To do</h2>
       <article><h3>Read lecture 2</h3><p>Priority: HIGH</p><button type="button">Done</button></article>
     </section>
     <!-- "In progress" and "Done" sections -->
   </main>
   <footer>…</footer>
   ```
3. New-task form fields: `title` (required, maxlength 200), `priority` (`select` LOW/MEDIUM/HIGH), `description` (`textarea`), `tags` (checkboxes `home`, `work`, `study`). Submit it to `https://httpbin.org/post` and read what was sent.
4. Change the form to `method="get"` and look at the URL. Switch back.
5. `register.html`: name, email (`type=email`), password (`minlength=8`, `autocomplete="new-password"`).
6. Validate all pages at https://validator.w3.org/ (0 errors).
7. Keyboard test: reach every control with Tab; the focus must be visible.
8. Run Lighthouse → Accessibility in DevTools.

### Checkpoints (graded)
- [ ] Three valid HTML pages using semantic elements, with every input labelled (1 pt)
- [ ] httpbin output of the task form pasted into `lab02.md`, showing repeated `tags` (0.5 pt)
- [ ] Lighthouse accessibility score ≥ 95 (0.5 pt)

### Extra tasks
- Add a `<dialog>` for "Delete board?" confirmation (with a few lines of JS: `dialog.showModal()`).
- Add `aria-live="polite"` region for status messages and explain when it is announced.
