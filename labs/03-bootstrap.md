# Lab 3 — Styling with Bootstrap 5

**Lecture:** [3 — CSS & Bootstrap 5](../lectures/03-css-bootstrap.md) · **Time:** 2 h

### Goals
- Turn the lab 2 pages into a responsive Bootstrap UI.
- Write a little custom CSS and understand the cascade.

### Steps
1. Copy `lab02/` to `lab03/`. Add to `<head>`:
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
   <link rel="stylesheet" href="app.css">
   ```
2. Navbar: `navbar navbar-expand bg-body-tertiary border-bottom`, brand on the left and links `ms-auto`.
3. Board: `container` → `row g-3` → three `col-12 col-md-4` columns. Each task is a `card` with a `badge` for priority (`text-bg-danger` for HIGH, etc.).
4. New-task form in a row: `col-md-6` title, `col-md-3` priority (`form-select`), `col-md-3` button `btn btn-primary w-100`.
5. Login/register centred: `row justify-content-center` + `col-md-6 col-lg-4`.
6. Show a validation error state on the register page: `is-invalid` + `invalid-feedback`, connected with `aria-describedby`.
7. `app.css`: give columns a background (`var(--bs-tertiary-bg)`), rounded corners and `min-height`. Strike through done tasks.
8. Test with DevTools device toolbar: 375 px, 768 px and 1280 px.

### Simple exercises (warm-up)
Short, ungraded tasks to practise the basics before the main steps or if you finish early.
1. Include Bootstrap from a CDN in a blank page and add one `btn btn-primary` and one `btn btn-outline-danger` button.
2. Wrap the page content in a `.container` and compare it with `.container-fluid` by resizing the window.
3. Create a row with three columns (`col-md-4`) and check how they stack on a narrow screen.
4. Show a success message using an `alert alert-success` component.
5. Style a single task as a `card` with a title, a text and a badge.
6. Write one custom CSS rule in `app.css` that changes the colour of `h1`; verify in DevTools which rule wins.

### Checkpoints (graded)
- [ ] The board shows 1 column on a phone and 3 on a laptop (1 pt)
- [ ] Forms use Bootstrap form classes and an error state is shown accessibly (0.5 pt)
- [ ] You can explain why your `app.css` rule wins over a Bootstrap rule (specificity / order) (0.5 pt)

### Extra tasks
- Add a dark-mode toggle with `data-bs-theme="dark"` on `<html>`.
- Rebuild the three columns with CSS Grid only (no Bootstrap grid) and compare.
