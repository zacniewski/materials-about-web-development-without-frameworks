import { html } from './html.js';
import { csrfField, field } from './forms.js';

export const errorPage = (status, message) => html`
<div class="alert alert-danger" role="alert">
  <strong>${status}</strong> — ${message}
</div>`;

export const loginPage = ({ csrfToken, values = {}, error }) => html`
<div class="row justify-content-center">
  <div class="col-12 col-md-6 col-lg-4">
    <h1 class="h3 mb-3">Log in</h1>
    ${error && html`<div class="alert alert-danger" role="alert">${error}</div>`}
    <form method="post" action="/login" novalidate>
      ${csrfField(csrfToken)}
      ${field({ name: 'email', label: 'Email', type: 'email', value: values.email, attrs: 'required autocomplete="email"' })}
      ${field({ name: 'password', label: 'Password', type: 'password', attrs: 'required autocomplete="current-password"' })}
      <button class="btn btn-primary w-100">Log in</button>
    </form>
    <p class="mt-3 small">No account? <a href="/register">Register</a>. Demo: demo@example.com / password123</p>
  </div>
</div>`;

export const registerPage = ({ csrfToken, values = {}, errors = {} }) => html`
<div class="row justify-content-center">
  <div class="col-12 col-md-6 col-lg-4">
    <h1 class="h3 mb-3">Create an account</h1>
    <form method="post" action="/register" novalidate>
      ${csrfField(csrfToken)}
      ${field({ name: 'name', label: 'Name', value: values.name, error: errors.name, attrs: 'required' })}
      ${field({ name: 'email', label: 'Email', type: 'email', value: values.email, error: errors.email, attrs: 'required autocomplete="email"' })}
      ${field({ name: 'password', label: 'Password (min. 8 characters)', type: 'password', error: errors.password, attrs: 'required minlength="8" autocomplete="new-password"' })}
      <button class="btn btn-primary w-100">Register</button>
    </form>
  </div>
</div>`;

export const boardListItem = (b) => html`
<li class="list-group-item d-flex justify-content-between align-items-center" id="board-${b.id}">
  <a href="/boards/${b.id}">${b.name}</a>
  <span class="badge text-bg-secondary rounded-pill" title="tasks">${b._count?.tasks ?? 0}</span>
</li>`;

export const newBoardForm = ({ csrfToken, values = {}, errors = {}, oob = false }) => html`
<form id="new-board-form" method="post" action="/boards" class="d-flex gap-2 align-items-start" novalidate
      hx-post="/boards" hx-target="#board-list" hx-swap="beforeend" ${oob ? html`hx-swap-oob="true"` : ''}>
  ${csrfField(csrfToken)}
  <div class="flex-grow-1">
    <label class="visually-hidden" for="board-name">Board name</label>
    <input class="form-control ${errors.name ? 'is-invalid' : ''}" id="board-name" name="name"
           placeholder="New board name" value="${values.name}" required maxlength="100">
    ${errors.name && html`<div class="invalid-feedback">${errors.name}</div>`}
  </div>
  <button class="btn btn-primary">Create</button>
</form>`;

export const boardsPage = ({ boards, csrfToken, values, errors }) => html`
<h1 class="h3 mb-3">My boards</h1>
<div class="row g-4">
  <div class="col-12 col-lg-7">
    <ul class="list-group" id="board-list">
      ${boards.map(boardListItem)}
    </ul>
    ${boards.length === 0 && html`<p class="text-muted mt-2">No boards yet — create the first one.</p>`}
  </div>
  <div class="col-12 col-lg-5">
    ${newBoardForm({ csrfToken, values, errors })}
  </div>
</div>`;
