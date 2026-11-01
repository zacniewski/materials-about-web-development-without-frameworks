# Lecture 2 — HTML5 semantics, forms, accessibility

**Goals:** write valid, semantic HTML; understand how forms become HTTP requests; build accessible pages.

### In plain words
HTML is the **skeleton and labels of a building**. Semantic tags like `<header>`, `<nav>`, `<main>` and `<footer>` are like the signs "Reception", "Elevators", "Exit" — they tell everyone (including blind visitors using a screen reader and search engines) what each part **is**, not how it looks. A **form** is like a paper form at the post office: each box has a printed label, some boxes are required, and when you hand it in at the counter (the `action` URL) the clerk checks it. **Accessibility** means the building has ramps and braille signs so *everyone* can use it. See the [glossary](../resources/glossary.md) for terms.

### 1. Document structure
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Task board</title>
  <link rel="stylesheet" href="/static/app.css">
</head>
<body>
  <header><nav>…</nav></header>
  <main>
    <h1>My tasks</h1>
    <section aria-labelledby="todo-h"><h2 id="todo-h">To do</h2> … </section>
  </main>
  <footer>© 2026</footer>
</body>
</html>
```

The browser parses HTML into the **DOM tree**:
```mermaid
graph TD
  html --> head
  html --> body
  head --> title
  body --> header --> nav
  body --> main
  main --> h1
  main --> section --> h2
  body --> footer
```

### 2. Semantic elements
| Element | Use |
|---------|-----|
| `header`, `footer` | page or section header/footer |
| `nav` | main navigation |
| `main` | the unique main content (one per page) |
| `article` | self-contained item (a task card, a post) |
| `section` | thematic group with a heading |
| `aside` | related, secondary content |
| `button` vs `a` | **button = action**, **link = navigation** |

Semantics give free accessibility, SEO and keyboard support.

### 3. Forms — the original hypermedia control
```html
<form action="/tasks" method="post">
  <label for="title">Title</label>
  <input id="title" name="title" required maxlength="200">

  <label for="priority">Priority</label>
  <select id="priority" name="priority">
    <option value="LOW">Low</option>
    <option value="HIGH">High</option>
  </select>

  <fieldset>
    <legend>Tags</legend>
    <label><input type="checkbox" name="tag" value="home"> home</label>
    <label><input type="checkbox" name="tag" value="work"> work</label>
  </fieldset>

  <button type="submit">Add task</button>
</form>
```

```mermaid
sequenceDiagram
  participant U as User
  participant B as Browser
  participant S as Server
  U->>B: fills form, clicks "Add task"
  B->>B: built-in validation (required, maxlength)
  B->>S: POST /tasks<br/>title=Buy+milk&priority=HIGH&tag=home&tag=work
  S-->>B: 303 See Other, Location: /tasks
  B->>S: GET /tasks
  S-->>B: 200 HTML
```

Key points:
- Only fields with a `name` are sent. Repeated names (`tag`) produce multiple values.
- `method="get"` puts the data into the query string, which is right for search/filter forms.
- Encodings: `application/x-www-form-urlencoded` (default), `multipart/form-data` (file uploads).
- HTML forms support only GET and POST; other methods need a hidden `_method` field or HTMX.
- **Client-side validation is UX, not security.** The server must validate again.

Input types: `text, email, password, number, date, checkbox, radio, file, hidden, search, url, color, range`.

### 4. Accessibility (a11y)
- Every input has a `<label>` (or `aria-label`).
- Keep the heading hierarchy (`h1` → `h2` → `h3`) without skipping levels.
- Images get meaningful `alt`; decorative images get `alt=""`.
- Prefer native elements to `div` + JS (`<button>`, not `<div onclick>`).
- Colour contrast ≥ 4.5:1; never use colour alone to convey state.
- Live regions (`aria-live="polite"`) announce dynamic updates (important with HTMX).
- Test with the keyboard only (Tab, Shift+Tab, Enter, Space) and Lighthouse/axe.

### 5. Validation
Use https://validator.w3.org/ and the DevTools *Issues* tab.

### Deeper dive: how the browser turns HTML into an accessible page
The browser parses HTML into the **DOM tree**. From the DOM it builds the **accessibility tree** — a simplified version containing roles (button, link, heading), names (from labels or text) and states (checked, invalid). Screen readers read this second tree. That is why a `<div onclick>` "button" is invisible as a button: it has no role, is not focusable, and does not react to the keyboard.

```mermaid
graph LR
  H["HTML source"] --> P["Parser"]
  P --> DOM["DOM tree"]
  DOM --> R["Render tree - what you see"]
  DOM --> A["Accessibility tree - what screen readers hear"]
  A --> SR["Screen reader / voice control"]
```

### Worked example: building an accessible "New task" form step by step
Step 1 — the page skeleton with landmarks:
```html
<!doctype html>
<html lang="en"> <!-- lang lets screen readers pick the right voice -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- mobile friendly -->
  <title>New task — Task Board</title> <!-- unique, descriptive title per page -->
</head>
<body>
  <header><nav aria-label="Main"><a href="/">Home</a></nav></header>
  <main>
    <h1>New task</h1> <!-- exactly one h1 that describes the page -->
    <!-- the form goes here (step 2) -->
  </main>
  <footer>© 2026 Task Board</footer>
</body>
</html>
```
Step 2 — the form with labels, hints and validation:
```html
<form method="post" action="/tasks"> <!-- POST because it creates data -->
  <!-- "for" must match the input "id": clicking the label focuses the input -->
  <label for="title">Title</label>
  <input id="title" name="title" required maxlength="100"
         aria-describedby="title-hint"> <!-- links the hint text to the field -->
  <small id="title-hint">Up to 100 characters.</small>

  <fieldset> <!-- groups related radio buttons -->
    <legend>Priority</legend> <!-- the group's label, read before each option -->
    <input type="radio" id="p-low" name="priority" value="low" checked>
    <label for="p-low">Low</label>
    <input type="radio" id="p-high" name="priority" value="high">
    <label for="p-high">High</label>
  </fieldset>

  <label for="due">Due date</label>
  <input id="due" name="due" type="date"> <!-- native date picker for free -->

  <button type="submit">Create task</button> <!-- a real button: focusable, Enter works -->
</form>
```
Step 3 — what is sent when the user submits:
```http
POST /tasks HTTP/1.1
Content-Type: application/x-www-form-urlencoded

title=Buy+milk&priority=high&due=2026-11-05
```
Only fields with a `name` are sent. Unchecked checkboxes are **not** sent at all.

### The life of a form submission
```mermaid
sequenceDiagram
  participant U as User
  participant B as Browser
  participant S as Server
  U->>B: Fills fields, presses Create task
  B->>B: Built-in validation - required, maxlength, type
  alt invalid
    B-->>U: Shows message, focuses first invalid field
  else valid
    B->>S: POST /tasks with urlencoded body
    S->>S: Validates again - never trust the client
    S-->>B: 303 redirect or 422 with errors
  end
```

### Choosing the right element
```mermaid
graph TD
  Q["Does clicking it change the URL?"] -->|Yes| L["Use a link: a href"]
  Q -->|No| Q2["Does it submit or change data?"]
  Q2 -->|Yes| BTN["Use button type=submit inside a form"]
  Q2 -->|No| BTN2["Use button type=button plus JS"]
```

### Common beginner mistakes
- **Using `placeholder` instead of a `<label>`.** The placeholder disappears when typing and is not a reliable accessible name.
- **Missing `name` on inputs** — the browser silently does not send that field.
- **Clickable `<div>`s and `<span>`s** instead of `<button>`/`<a>`.
- **Skipping heading levels** (`h1` → `h4`) because of font size. Use CSS for size, headings for structure.
- **Images without `alt`** — or with `alt="image"`. Describe the content, or use `alt=""` for decoration.
- **Relying only on client-side validation.** Anyone can bypass it with `curl`; the server must validate too.
- **Indicating errors only with red colour** — colour-blind users miss it; add text.

### Try it yourself
1. Build the form above, submit it to `https://httpbin.org/post` and look at the `form` field in the response.
2. Change `method` to `get` and observe where the data goes now (the URL!).
3. Navigate the whole page with **Tab / Shift+Tab / Enter / Space** only. Can you do everything?
4. Run Lighthouse → Accessibility in DevTools and fix every reported issue.
5. Add a checkbox "Urgent" and verify what is sent when it is checked vs unchecked.

### Recap questions
1. When should you use `<button>` and when `<a>`?
2. How is a form with two checked checkboxes named `tag` encoded?
3. Why is client-side validation not enough?
4. Why must a page have a `lang` attribute and a viewport meta tag?
5. Name four practices that improve accessibility.
