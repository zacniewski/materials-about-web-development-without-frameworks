# Lecture 3 — CSS basics and Bootstrap 5

**Goals:** understand the cascade, the box model and layout; build responsive UIs with Bootstrap 5 without writing a front-end build.

### In plain words
If HTML is the skeleton of a house, **CSS is the paint, furniture and layout**. A CSS rule is an instruction like "all doors (selector) should be red (property: value)". When two instructions conflict — "all doors red" vs "the front door blue" — the **cascade** decides who wins, usually the *more specific* one. **Bootstrap** is like buying a furniture set from IKEA: ready-made, matching pieces (buttons, cards, a grid) that you assemble with class names instead of building everything from scratch. See the [glossary](../resources/glossary.md).

### 1. CSS essentials
```css
/* selector { property: value; } */
.task-card { padding: 1rem; border: 1px solid #ddd; }
.task-card.done h3 { text-decoration: line-through; }
#main > ul li:hover { background: #f5f5f5; }
```
**Cascade order:** origin & `!important` → specificity (inline > id > class/attr/pseudo-class > element) → source order.

**Box model:**
```mermaid
graph LR
  M[margin] --> B[border] --> P[padding] --> C[content]
```
Use `box-sizing: border-box` (Bootstrap sets this globally).

**Layout:** Flexbox (1-D) and Grid (2-D).
```css
.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
@media (max-width: 768px) { .board { grid-template-columns: 1fr; } }
```
Custom properties: `:root { --brand: #0d6efd; } a { color: var(--brand); }`

### 2. Why Bootstrap here?
Students focus on the server. Bootstrap gives a consistent, accessible UI from plain HTML classes with no build step:
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
```

### 3. The grid
Container → row → columns; 12 columns; breakpoints `sm ≥576`, `md ≥768`, `lg ≥992`, `xl ≥1200`, `xxl ≥1400`.
```html
<div class="container">
  <div class="row g-3">
    <div class="col-12 col-md-4">To do</div>
    <div class="col-12 col-md-4">Doing</div>
    <div class="col-12 col-md-4">Done</div>
  </div>
</div>
```
```mermaid
graph TD
  C[.container] --> R[.row]
  R --> C1[.col-md-4]
  R --> C2[.col-md-4]
  R --> C3[.col-md-4]
```

### 4. Components used in the course
| Component | Classes |
|-----------|---------|
| Navbar | `navbar navbar-expand-lg bg-body-tertiary` |
| Card | `card`, `card-body`, `card-title` |
| Forms | `form-label`, `form-control`, `form-select`, `form-check`, `is-invalid`, `invalid-feedback` |
| Buttons | `btn btn-primary`, `btn-outline-danger`, `btn-sm` |
| Alerts | `alert alert-success alert-dismissible` |
| Badges | `badge text-bg-warning` |
| Modal | `modal`, `data-bs-toggle="modal"` |
| Utilities | `d-flex`, `gap-2`, `mt-3`, `text-muted`, `visually-hidden` |

Example task card:
```html
<article class="card mb-2">
  <div class="card-body d-flex justify-content-between align-items-start">
    <div>
      <h3 class="h6 card-title mb-1">Write lecture 3</h3>
      <span class="badge text-bg-danger">HIGH</span>
    </div>
    <button class="btn btn-sm btn-outline-success" type="button">Done</button>
  </div>
</article>
```

Form with server-side validation errors:
```html
<div class="mb-3">
  <label class="form-label" for="title">Title</label>
  <input class="form-control is-invalid" id="title" name="title" aria-describedby="title-err">
  <div class="invalid-feedback" id="title-err">Title is required.</div>
</div>
```

### 5. Customising
Override CSS variables (`--bs-primary`, `data-bs-theme="dark"`) in your own stylesheet loaded **after** Bootstrap. Avoid editing `bootstrap.min.css`.

### Deeper dive: how the browser decides the final style
For each element and property the browser:
1. Collects every matching declaration (browser defaults, your CSS, inline styles).
2. Sorts by **origin and `!important`**.
3. Then by **specificity** — inline > id > class/attribute/pseudo-class > element.
4. Then by **order** — later wins.
5. If nothing is set, **inherits** from the parent (for inheritable props like `color`, `font`) or uses the initial value.

```mermaid
graph TD
  A["All matching declarations"] --> B["Origin and important"]
  B --> C["Specificity - id, class, element"]
  C --> D["Source order - last wins"]
  D --> E["Winner = computed value"]
  E -.no value.-> F["Inherited or initial value"]
```

Specificity is counted as three numbers `(ids, classes, elements)`: `#main .card p` = `(1,1,1)` beats `.card .title p` = `(0,2,1)`.

### Worked example: a task card, plain CSS then Bootstrap
Step 1 — plain CSS:
```html
<article class="task">
  <h2 class="task__title">Buy milk</h2>
  <p class="task__meta">Due tomorrow</p>
  <button class="task__btn">Done</button>
</article>
```
```css
/* Make padding and border count inside width — easier maths */
*, *::before, *::after { box-sizing: border-box; }

.task {
  border: 1px solid #ddd;   /* thin grey frame */
  border-radius: 8px;       /* rounded corners */
  padding: 1rem;            /* space INSIDE the border */
  margin-bottom: 1rem;      /* space OUTSIDE, between cards */
  display: flex;            /* lay children in a row */
  align-items: center;      /* vertically centre them */
  gap: 1rem;                /* space between children */
}
.task__title { margin: 0; flex: 1; } /* flex: 1 = take the remaining width */
.task__meta  { margin: 0; color: #666; }
.task__btn:hover { background: #e7f1ff; } /* pseudo-class: only while hovered */
```
Step 2 — the same with Bootstrap 5 utility and component classes, no custom CSS:
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<div class="container py-4">            <!-- centred, responsive width + vertical padding -->
  <div class="row g-3">                 <!-- grid row with gutters -->
    <div class="col-12 col-md-6 col-lg-4"> <!-- full width on phones, 1/2 on tablets, 1/3 on desktops -->
      <article class="card shadow-sm">
        <div class="card-body d-flex align-items-center gap-3"> <!-- flex utilities -->
          <h2 class="h5 card-title mb-0 flex-grow-1">Buy milk</h2>
          <span class="badge text-bg-warning">Due tomorrow</span>
          <button class="btn btn-sm btn-success">Done</button>
        </div>
      </article>
    </div>
  </div>
</div>
```

### The Bootstrap grid on different screens
```mermaid
graph LR
  XS["Phone below 576px - col-12 - 1 per row"] --> MD["Tablet 768px and up - col-md-6 - 2 per row"]
  MD --> LG["Desktop 992px and up - col-lg-4 - 3 per row"]
```

### Flexbox vs Grid — which one?
```mermaid
graph TD
  Q["Layout in one direction - a row OR a column?"] -->|Yes| F["Flexbox: navbars, toolbars, card content"]
  Q -->|No, rows AND columns| G["CSS Grid or Bootstrap row/col: page layout, galleries"]
```

### Common beginner mistakes
- **Forgetting the viewport meta tag** — Bootstrap's responsive grid will not work on phones.
- **Putting `.col` directly inside `.container` without a `.row`.** Gutters and alignment break.
- **Fighting specificity with `!important`** everywhere. Use a more specific selector or fix the order instead.
- **Mixing up padding and margin** — padding is inside the border, margin is outside.
- **Using `id` selectors for styling** — they are hard to override; prefer classes.
- **Loading Bootstrap JS without the bundle** — dropdowns/modals need Popper, included in `bootstrap.bundle.min.js`.
- **Low contrast text** (light grey on white). Check contrast in DevTools.

### Try it yourself
1. Build the plain CSS card, then use DevTools → Computed to see which rule won for `margin`.
2. Write two conflicting rules and predict the winner by specificity before checking.
3. Rebuild the card with Bootstrap and resize the window to watch it go 1 → 2 → 3 per row.
4. Add a Bootstrap navbar that collapses into a hamburger menu on small screens.
5. Override Bootstrap's primary colour using a CSS variable `--bs-primary` in your own stylesheet.

### Recap questions
1. Compute the specificity of `#main .card h3` vs `.board .card .title`.
2. When should you use Grid rather than Flexbox?
3. What does `col-12 col-md-6 col-xl-4` mean on phone, tablet and desktop?
4. How does Bootstrap show validation errors and keep them accessible?
5. Why load Bootstrap's JS with `defer`?


### Extra theory: the box model
Every element is a rectangle made of **content**, **padding**, **border** and **margin** ([MDN: box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)). With the default `box-sizing: content-box`, `width` covers only the content; with [`box-sizing: border-box`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing) (which Bootstrap's Reboot sets for everything) `width` includes padding and border, which is much easier to reason about.

```mermaid
graph LR
  M[margin] --> B[border] --> P[padding] --> C[content]
```

### Extra theory: specificity in numbers
[Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) is counted as three columns (IDs, classes/attributes/pseudo-classes, elements/pseudo-elements). Compare column by column from the left.

| Selector | Specificity | Wins against |
|---|---|---|
| `li` | 0-0-1 | — |
| `ul li` | 0-0-2 | `li` |
| `.task` | 0-1-0 | any number of element selectors |
| `.task.done` | 0-2-0 | `.task` |
| `#main .task` | 1-1-0 | any number of classes |
| `style="..."` | inline | all selectors |
| `!important` | special layer | normal declarations (avoid) |

Newer CSS also has [cascade layers (`@layer`)](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer), which are compared *before* specificity.

```mermaid
flowchart TD
  D[Several declarations for one property] --> O{Origin and importance}
  O --> L{Cascade layer}
  L --> S{Specificity}
  S --> R{Order in source}
  R --> W[Winning value]
  W --> I{No value at all?}
  I -- inherited property --> Inh[Take parent value]
  I -- otherwise --> Init[Use initial value]
```

### Extra theory: units
| Unit | Relative to | Good for |
|---|---|---|
| `px` | the CSS pixel | borders, small fixed details |
| `rem` | root font size | font sizes, spacing (Bootstrap uses it) |
| `em` | current font size | padding that grows with text |
| `%` | parent size | fluid widths |
| `vw` / `vh` | viewport width / height | full-screen sections |
| `fr` | free space in a grid | grid tracks |

See [MDN: CSS values and units](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units).

### Extra theory: display, positioning and layout modes
| Value | Behaviour |
|---|---|
| `display: block` | full width, starts on a new line |
| `display: inline` | flows in text, ignores width/height |
| `display: inline-block` | flows in text, but respects width/height |
| [`display: flex`](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout) | one-dimensional layout of children |
| [`display: grid`](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) | two-dimensional layout of children |
| [`position: relative / absolute / fixed / sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position) | take a box out of (or nudge it within) normal flow |

### Extra theory: responsive design and media queries
[Media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) apply CSS only when a condition is true. Bootstrap is **mobile first**: base styles are for small screens, and `@media (min-width: ...)` adds rules for bigger ones. Don't forget `<meta name="viewport" content="width=device-width, initial-scale=1">`, otherwise phones pretend to be desktop-wide.

| Bootstrap [breakpoint](https://getbootstrap.com/docs/5.3/layout/breakpoints/) | Class infix | Min width |
|---|---|---|
| Extra small | (none) | <576px |
| Small | `sm` | ≥576px |
| Medium | `md` | ≥768px |
| Large | `lg` | ≥992px |
| Extra large | `xl` | ≥1200px |
| Extra extra large | `xxl` | ≥1400px |

### Extra theory: Bootstrap utilities and variables
Bootstrap 5.3 ships [utility classes](https://getbootstrap.com/docs/5.3/utilities/api/) for spacing (`m-*`, `p-*`), [flex](https://getbootstrap.com/docs/5.3/utilities/flex/), [display](https://getbootstrap.com/docs/5.3/utilities/display/) and colours, and exposes [CSS variables](https://getbootstrap.com/docs/5.3/customize/css-variables/) like `--bs-primary`. You can override a variable in your own stylesheet without recompiling Sass, and switch themes with [color modes](https://getbootstrap.com/docs/5.3/customize/color-modes/) (`data-bs-theme="dark"`).

| Spacing class | Meaning |
|---|---|
| `mt-3` | margin-top: 1rem |
| `px-2` | padding left and right: 0.5rem |
| `mb-0` | margin-bottom: 0 |
| `gap-2` | gap between flex/grid items: 0.5rem |
| `ms-auto` | margin-left: auto (push to the right) |

```mermaid
flowchart LR
  Need[Need a style] --> U{Utility class exists?}
  U -- yes --> UC[Use utility in HTML]
  U -- no --> V{Is it a theme value?}
  V -- yes --> CV[Override --bs-* variable]
  V -- no --> OC[Write own class in app.css]
```

### Further reading / documentation
- [MDN: CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)
- [MDN: Cascade, specificity and inheritance](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance)
- [MDN: The box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)
- [MDN: Flexbox](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox)
- [MDN: CSS Grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
- [MDN: Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries)
- [W3C CSS specifications overview](https://www.w3.org/Style/CSS/)
- [Bootstrap 5.3: Introduction](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Bootstrap 5.3: Grid system](https://getbootstrap.com/docs/5.3/layout/grid/)
- [Bootstrap 5.3: Forms](https://getbootstrap.com/docs/5.3/forms/overview/)
- [Bootstrap 5.3: Components (cards)](https://getbootstrap.com/docs/5.3/components/card/)
- [Bootstrap 5.3: Accessibility](https://getbootstrap.com/docs/5.3/getting-started/accessibility/)
