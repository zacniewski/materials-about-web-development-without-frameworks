import { html } from './html.js';

// Let htmx swap 4xx/5xx responses too (our error handler retargets them to #alerts).
const HTMX_CONFIG = JSON.stringify({
  responseHandling: [
    { code: '204', swap: false },
    { code: '[23]..', swap: true },
    { code: '[45]..', swap: true, error: true },
  ],
});

export const navbar = (user, csrfToken) => html`
<nav class="navbar navbar-expand bg-body-tertiary border-bottom">
  <div class="container">
    <a class="navbar-brand" href="/">📋 Task board</a>
    <div class="navbar-nav ms-auto align-items-center gap-2">
      ${user
        ? html`
          <a class="nav-link" href="/boards">My boards</a>
          <span class="navbar-text small">Signed in as <strong>${user.name}</strong></span>
          <form method="post" action="/logout" class="d-inline">
            <input type="hidden" name="_csrf" value="${csrfToken}">
            <button class="btn btn-sm btn-outline-secondary">Log out</button>
          </form>`
        : html`
          <a class="nav-link" href="/login">Log in</a>
          <a class="btn btn-sm btn-primary" href="/register">Register</a>`}
    </div>
  </div>
</nav>`;

export const layout = ({ title, user, csrfToken, body }) => html`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="htmx-config" content="${HTMX_CONFIG}">
  <title>${title} · Task board</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="/static/app.css">
  <script src="https://unpkg.com/htmx.org@2.0.3" defer></script>
</head>
<body hx-headers="${JSON.stringify({ 'X-CSRF-Token': csrfToken })}">
  ${navbar(user, csrfToken)}
  <main class="container py-4">
    <div id="alerts" aria-live="polite"></div>
    ${body}
  </main>
  <footer class="container py-3 small text-muted border-top">Built with node:http, Prisma, Bootstrap and htmx — no web framework.</footer>
</body>
</html>`;
