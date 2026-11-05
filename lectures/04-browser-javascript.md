# Lecture 4 — Browser JavaScript: DOM, events, fetch

**Goals:** know just enough browser JS to understand what HTMX does for us, and when a few lines of JS are still useful.

### In plain words
The **DOM** is a live **family tree** of your page: `<html>` is the grandparent, `<body>` a parent, each `<li>` a child. JavaScript can walk this tree, read it and change it — like a stage manager moving props during a play. **Events** are the doorbell: you tell the browser "when someone rings (clicks, types, submits), call this function". **`fetch`** is sending a courier to the server for more data without leaving the page — you keep doing other things while you wait (that is what `async`/`await` expresses). See the [glossary](../resources/glossary.md).

### 1. Language refresher
```js
const tasks = [{ id: 1, title: 'A', done: false }];
const open = tasks.filter(t => !t.done).map(t => t.title);
const { title, ...rest } = tasks[0];           // destructuring
const copy = { ...tasks[0], done: true };       // spread
const label = `Task: ${title}`;                 // template literal
```
Modules: `<script type="module" src="/static/app.js"></script>` (deferred by default, strict mode, `import`/`export`).

### 2. The DOM
```js
const list = document.querySelector('#todo');
const items = document.querySelectorAll('.task');
const li = document.createElement('li');
li.textContent = 'New task';     // safe: never parses HTML
li.classList.add('task');
li.dataset.id = '7';             // -> data-id="7"
list.append(li);
// list.innerHTML = userInput;   // DANGER: XSS (lecture 8)
```

### 3. Events
```js
document.querySelector('#todo').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="delete"]');
  if (!btn) return;
  btn.closest('li').remove();
});
```
Event flow: **capture → target → bubble**. *Event delegation* (one listener on the parent) works for elements added later.
```mermaid
graph TD
  doc[document] -->|capture| ul[ul#todo]
  ul -->|capture| li
  li --> button[button - target]
  button -.bubble.-> li
  li -.bubble.-> ul
  ul -.bubble.-> doc
```
`e.preventDefault()` stops the default action (e.g. form submit); `e.stopPropagation()` stops bubbling.

### 4. Asynchrony and fetch
```js
async function addTask(title) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```
```mermaid
sequenceDiagram
  participant JS as Page JS
  participant S as Server
  JS->>S: fetch POST /api/tasks (JSON)
  S-->>JS: 201 {"id":7,"title":"..."}
  JS->>JS: build DOM nodes from JSON
```
Note: `fetch` only rejects on network errors. A 404/500 still resolves, so check `res.ok`.

### 5. Progressive enhancement
Start with a form that works without JS, then enhance it:
```js
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
  list.insertAdjacentHTML('beforeend', await res.text()); // server returns an HTML fragment
});
```
Here the server returns **HTML** rather than JSON. That is exactly the idea HTMX generalises (lecture 12): *hypermedia as the engine of application state*.

### 6. JSON API vs HTML fragments
| | JSON + client rendering | HTML fragments |
|---|---|---|
| Rendering | in browser | on server |
| Client code | lots | almost none |
| Templates | duplicated | one place |
| Good for | mobile apps, public APIs | server-rendered web apps |

### Deeper dive: how events travel
When you click a button inside a list, the event does not happen only on the button. It travels **down** from `window` to the target (*capture phase*) and then **bubbles up** back to `window`. That is why one listener on the `<ul>` can handle clicks on all its `<li>` buttons — *event delegation*.

```mermaid
graph TD
  W["window"] --> D["document"] --> B["body"] --> U["ul#tasks - listener here"] --> L["li"] --> BTN["button - you clicked"]
  BTN -.bubbles up.-> L -.-> U
```

`async`/`await` does not block the page: while `await fetch(...)` waits for the network, the browser keeps handling scrolling and clicks.

```mermaid
sequenceDiagram
  participant JS as Your code
  participant B as Browser
  participant S as Server
  JS->>B: fetch POST /tasks
  Note over JS: function pauses at await, page stays responsive
  B->>S: HTTP request
  S-->>B: 201 + HTML fragment
  B-->>JS: Response object
  JS->>JS: check res.ok, read res.text
  JS->>B: insert fragment into DOM
```

### Worked example: a to-do list with delegation and fetch
Step 1 — the HTML (works without JS: the form posts normally):
```html
<form id="new-task" method="post" action="/tasks">
  <label for="title">Task</label>
  <input id="title" name="title" required>
  <button>Add</button>
</form>
<p id="error" role="alert" hidden></p> <!-- role=alert: screen readers announce it -->
<ul id="tasks"></ul>
<script type="module" src="/app.js"></script> <!-- modules are deferred automatically -->
```
Step 2 — the script:
```js
// app.js — ES module, runs after the HTML is parsed
const form  = document.querySelector('#new-task'); // find elements once
const list  = document.querySelector('#tasks');
const error = document.querySelector('#error');

form.addEventListener('submit', async (event) => {
  event.preventDefault();          // stop the normal full-page submit
  error.hidden = true;             // clear an old error message
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),    // collects all named fields automatically
      headers: { Accept: 'text/html' },
    });
    // fetch only rejects on network failure — 4xx/5xx must be checked manually
    if (!res.ok) throw new Error(`Server said ${res.status}`);
    list.insertAdjacentHTML('beforeend', await res.text()); // server-made, escaped HTML
    form.reset();                  // empty the inputs
    form.title.focus();            // ready for the next task
  } catch (err) {
    error.textContent = err.message; // textContent never interprets HTML — safe
    error.hidden = false;
  }
});

// Event delegation: ONE listener handles delete buttons, even ones added later
list.addEventListener('click', async (event) => {
  const btn = event.target.closest('button[data-delete]'); // was a delete button clicked?
  if (!btn) return;                                       // no — ignore the click
  const li = btn.closest('li');
  const res = await fetch(`/tasks/${btn.dataset.delete}`, { method: 'DELETE' });
  if (res.ok) li.remove();                                 // remove from the page
});
```

### Common beginner mistakes
- **Running the script before the element exists** → `null` errors. Use `type="module"` or `defer`.
- **Assuming `fetch` throws on 404/500.** It does not — always check `res.ok`.
- **Forgetting `await`** and getting a `Promise` instead of data.
- **Inserting user input with `innerHTML`** — an XSS hole. Use `textContent` or escape on the server.
- **Attaching a listener to each item** and losing it when items are re-rendered; use delegation.
- **Setting `Content-Type` manually with `FormData`** — the browser must set the multipart boundary itself.
- **Forgetting `preventDefault()`** so the page reloads and your JS result disappears.

### Try it yourself
1. In the console, select all links on a page and print their `href`s.
2. Add a click listener on `document` and log `event.target` and `event.currentTarget`.
3. Make the to-do form show a "Saving…" text and disable the button while waiting.
4. Fetch `https://httpbin.org/status/500` and display a friendly error.
5. Add a "mark as done" toggle using `data-id` and delegation.

### Recap questions
1. Why is `textContent` safer than `innerHTML`?
2. What is event delegation and why does it help with dynamic content?
3. Does `fetch` reject on a 500 response? How do you handle it?
4. What does "progressive enhancement" mean?
5. Compare returning JSON vs HTML fragments from the server.


### Extra theory: the browser event loop
Browser JavaScript runs on one main thread, driven by the [event loop defined in the HTML Standard](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops). After each **task** (a click handler, a timer, a network callback) the browser drains the whole **microtask queue** (Promise callbacks, [`queueMicrotask`](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)), and then may **render** a frame. A long task blocks clicks *and* painting. See [MDN: microtask guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide).

```mermaid
flowchart LR
  T[Take one task] --> R[Run it to completion]
  R --> M[Run all microtasks]
  M --> F{Time to render?}
  F -- yes --> RAF[requestAnimationFrame callbacks] --> P[Style, layout, paint]
  F -- no --> T
  P --> T
```

```js
console.log('1 sync');
setTimeout(() => console.log('4 task'), 0);
Promise.resolve().then(() => console.log('3 microtask'));
console.log('2 sync');
```

### Extra theory: scope, closures and `this`
- `let`/`const` are **block-scoped**; `var` is function-scoped and hoisted — avoid it ([MDN: `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)).
- A [closure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) is a function that remembers the variables around it, which is why event handlers can use variables from where they were created.
- [`this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) in a normal function depends on *how it is called*; [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) take `this` from the surrounding code.

| | `function` | arrow `=>` |
|---|---|---|
| Own `this` | yes (depends on call) | no (lexical) |
| In `addEventListener` | `this` is the element | `this` is outer `this` |
| Can be a constructor | yes | no |
| `arguments` object | yes | no |

### Extra theory: selecting and changing the DOM
| Task | API | Note |
|---|---|---|
| find one | [`querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) | first match or `null` |
| find many | [`querySelectorAll`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll) | static `NodeList` |
| create | [`createElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement) | then append it |
| insert | [`append` / `prepend` / `before` / `after`](https://developer.mozilla.org/en-US/docs/Web/API/Element/append) | accept nodes or strings |
| set text safely | [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) | never parses HTML |
| set HTML | [`innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) | XSS risk with user data |
| toggle classes | [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) | `add`, `remove`, `toggle` |
| custom data | [`dataset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) | reads `data-*` attributes |
| remove | [`remove()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) | removes the element itself |

### Extra theory: Promises and error handling with fetch
A [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) is *pending*, then either *fulfilled* or *rejected*. [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) only rejects on **network** errors — a `404` or `500` still resolves, so always check `response.ok`.

```mermaid
stateDiagram-v2
  [*] --> Pending
  Pending --> Fulfilled: resolve(value)
  Pending --> Rejected: reject(error)
  Fulfilled --> [*]
  Rejected --> [*]
```

```js
async function loadTasks() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch('/api/tasks', { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
```
[`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) cancels a request; [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) reads a whole form in one line.

| Combinator | Resolves when | Rejects when |
|---|---|---|
| [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) | all fulfil | any rejects |
| [`Promise.allSettled`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) | all finish | never |
| [`Promise.race`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) | first settles (fulfil) | first settles (reject) |
| [`Promise.any`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) | first fulfils | all reject |

### Extra theory: security basics in the browser
- **XSS**: inserting user text with `innerHTML` lets attackers run scripts. Use `textContent` ([MDN: XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS)).
- **CSP**: a [`Content-Security-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) header limits where scripts may come from.
- **CSRF**: cookies are sent automatically, so state-changing requests need protection such as `SameSite` cookies or tokens ([MDN: CSRF](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF)).

### Extra theory: storing data in the browser
| Storage | Size | Lifetime | Sent to server | API |
|---|---|---|---|---|
| Cookies | ~4 KB | set by `Expires`/`Max-Age` | yes, every request | [`document.cookie`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) |
| `localStorage` | ~5 MB | until cleared | no | [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) |
| `sessionStorage` | ~5 MB | until the tab closes | no | [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) |
| IndexedDB | large | until cleared | no | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) |

### Further reading / documentation
- [MDN: JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [MDN: Introduction to the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)
- [MDN: Introduction to events](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events)
- [MDN: `addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [MDN: Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [MDN: async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN: Progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)
- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)
- [WHATWG HTML: event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [ECMAScript Language Specification (TC39)](https://tc39.es/ecma262/)
