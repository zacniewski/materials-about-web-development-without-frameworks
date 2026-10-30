import { html, raw } from './html.js';

export const csrfField = (token) => html`<input type="hidden" name="_csrf" value="${token}">`;

// `attrs` is a trusted, developer-written string such as 'required autocomplete="email"'.
export const field = ({ name, label, type = 'text', value = '', error, attrs = '' }) => html`
<div class="mb-3">
  <label class="form-label" for="f-${name}">${label}</label>
  <input class="form-control ${error ? 'is-invalid' : ''}" id="f-${name}" name="${name}" type="${type}"
         value="${type === 'password' ? '' : value}" ${raw(attrs)}
         ${error ? html`aria-describedby="f-${name}-err" aria-invalid="true"` : ''}>
  ${error && html`<div class="invalid-feedback" id="f-${name}-err">${error}</div>`}
</div>`;
