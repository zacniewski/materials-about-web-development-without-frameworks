import { html } from './html.js';
import { csrfField } from './forms.js';
import { PRIORITIES } from '../validation.js';

export const COLUMNS = [
  ['TODO', 'To do'],
  ['DOING', 'In progress'],
  ['DONE', 'Done'],
];

const PRIORITY_CLASS = { LOW: 'text-bg-secondary', MEDIUM: 'text-bg-info', HIGH: 'text-bg-danger' };

export const taskCard = (task) => html`
<article class="card task-card shadow-sm" id="task-${task.id}">
  <div class="card-body p-2">
    <div class="d-flex justify-content-between align-items-start gap-2">
      <h3 class="h6 mb-1 ${task.status === 'DONE' ? 'text-decoration-line-through text-muted' : ''}">${task.title}</h3>
      <span class="badge ${PRIORITY_CLASS[task.priority]}">${task.priority}</span>
    </div>
    ${task.description && html`<p class="small text-muted mb-1">${task.description}</p>`}
    <div class="mb-2">${(task.tags ?? []).map((t) => html`<span class="badge rounded-pill text-bg-light border me-1">#${t.name}</span>`)}</div>
    <div class="d-flex flex-wrap gap-1">
      ${COLUMNS.filter(([s]) => s !== task.status).map(([s, label]) => html`
        <button class="btn btn-sm btn-outline-primary" type="button"
                hx-patch="/tasks/${task.id}/status" hx-vals="${JSON.stringify({ status: s })}"
                hx-target="#columns" hx-swap="outerHTML">→ ${label}</button>`)}
      <button class="btn btn-sm btn-outline-secondary" type="button"
              hx-get="/tasks/${task.id}/edit" hx-target="#task-${task.id}" hx-swap="outerHTML">Edit</button>
      <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Delete ${task.title}"
              hx-delete="/tasks/${task.id}" hx-target="#task-${task.id}" hx-swap="outerHTML"
              hx-confirm="Delete this task?">Delete</button>
    </div>
  </div>
</article>`;

const prioritySelect = (selected) => html`
<select class="form-select form-select-sm" name="priority" aria-label="Priority">
  ${PRIORITIES.map((p) => html`<option value="${p}" ${p === selected ? 'selected' : ''}>${p}</option>`)}
</select>`;

export const taskEditForm = ({ task, values, errors = {} }) => {
  const v = values ?? { ...task, tags: (task.tags ?? []).map((t) => t.name).join(', ') };
  return html`
<form class="card border-primary" id="task-${task.id}" novalidate
      hx-put="/tasks/${task.id}" hx-target="this" hx-swap="outerHTML">
  <div class="card-body p-2 vstack gap-2">
    <div>
      <label class="visually-hidden" for="title-${task.id}">Title</label>
      <input class="form-control form-control-sm ${errors.title ? 'is-invalid' : ''}" id="title-${task.id}"
             name="title" value="${v.title}" required maxlength="200">
      ${errors.title && html`<div class="invalid-feedback">${errors.title}</div>`}
    </div>
    <textarea class="form-control form-control-sm ${errors.description ? 'is-invalid' : ''}" name="description"
              rows="2" aria-label="Description" placeholder="Description">${v.description}</textarea>
    ${prioritySelect(v.priority)}
    <div>
      <input class="form-control form-control-sm ${errors.tags ? 'is-invalid' : ''}" name="tags" value="${v.tags}"
             aria-label="Tags" placeholder="tags, comma, separated">
      ${errors.tags && html`<div class="invalid-feedback">${errors.tags}</div>`}
    </div>
    <div class="d-flex gap-1">
      <button class="btn btn-sm btn-primary">Save</button>
      <button class="btn btn-sm btn-outline-secondary" type="button"
              hx-get="/tasks/${task.id}" hx-target="#task-${task.id}" hx-swap="outerHTML">Cancel</button>
    </div>
  </div>
</form>`;
};

export const newTaskForm = ({ boardId, csrfToken, values = {}, errors = {}, oob = false }) => html`
<form id="new-task-form" class="row g-2 align-items-start mb-4" method="post" action="/boards/${boardId}/tasks" novalidate
      hx-post="/boards/${boardId}/tasks" hx-target="#col-TODO" hx-swap="beforeend"
      ${oob ? html`hx-swap-oob="true"` : ''}>
  ${csrfField(csrfToken)}
  <div class="col-12 col-md-6">
    <label class="visually-hidden" for="new-title">New task title</label>
    <input class="form-control ${errors.title ? 'is-invalid' : ''}" id="new-title" name="title"
           placeholder="What needs to be done?" value="${values.title}" required maxlength="200">
    ${errors.title && html`<div class="invalid-feedback">${errors.title}</div>`}
  </div>
  <div class="col-6 col-md-3">${prioritySelect(values.priority ?? 'MEDIUM')}</div>
  <div class="col-6 col-md-3"><button class="btn btn-primary w-100">Add task</button></div>
</form>`;

export const columns = (tasks) => html`
<div class="row g-3" id="columns">
  ${COLUMNS.map(([status, label]) => {
    const list = tasks.filter((t) => t.status === status);
    return html`
    <section class="col-12 col-md-4" aria-labelledby="h-${status}">
      <h2 class="h6 text-uppercase text-muted" id="h-${status}">${label}
        <span class="badge text-bg-light border">${list.length}</span></h2>
      <div class="vstack gap-2 column" id="col-${status}">${list.map(taskCard)}</div>
    </section>`;
  })}
</div>`;

export const boardPage = ({ board, tasks, q = '', csrfToken, values, errors }) => html`
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
  <h1 class="h3 mb-0">${board.name}</h1>
  <form method="post" action="/boards/${board.id}">
    ${csrfField(csrfToken)}
    <input type="hidden" name="_method" value="DELETE">
    <button class="btn btn-sm btn-outline-danger">Delete board</button>
  </form>
</div>
${newTaskForm({ boardId: board.id, csrfToken, values, errors })}
<div class="mb-3 position-relative">
  <label class="visually-hidden" for="search">Search tasks</label>
  <input class="form-control" type="search" id="search" name="q" value="${q}" placeholder="Search tasks…"
         hx-get="/boards/${board.id}/tasks" hx-trigger="input changed delay:300ms, search"
         hx-target="#columns" hx-swap="outerHTML" hx-indicator="#search-spinner">
  <span id="search-spinner" class="htmx-indicator spinner-border spinner-border-sm position-absolute top-50 end-0 me-3 translate-middle-y" role="status"></span>
</div>
${columns(tasks)}`;
