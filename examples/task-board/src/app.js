import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApplication } from './application.js';
import { Router } from './router.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errors.js';
import { serveStatic } from './middleware/static.js';
import { bodyParser, methodOverride } from './middleware/body.js';
import { securityHeaders, csrf } from './middleware/security.js';
import { session } from './middleware/session.js';
import { layout } from './views/layout.js';
import { authRoutes } from './routes/auth.js';
import { boardRoutes } from './routes/boards.js';
import { taskRoutes } from './routes/tasks.js';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Adds ctx.render(title, body, status, { partial }) — full page or fragment.
const renderer = async (ctx, next) => {
  ctx.render = (title, body, status = 200, { partial = false } = {}) => {
    if (partial) return ctx.html(body, status);
    ctx.html(layout({ title, user: ctx.state.user, csrfToken: ctx.state.csrfToken, body }), status);
  };
  await next();
};

export function buildRouter() {
  const router = new Router();
  router.get('/health', (ctx) => ctx.json({ status: 'ok' }));
  router.get('/', (ctx) => ctx.redirect(ctx.state.user ? '/boards' : '/login'));
  authRoutes(router);
  boardRoutes(router);
  taskRoutes(router);
  return router;
}

export function createApp({ logRequests = true } = {}) {
  const app = createApplication();
  if (logRequests) app.use(logger);
  app
    .use(renderer)
    .use(errorHandler)
    .use(securityHeaders)
    .use(serveStatic('/static', PUBLIC_DIR))
    .use(bodyParser())
    .use(methodOverride)
    .use(csrf)
    .use(session)
    .use(buildRouter().middleware());
  return app;
}

export function createServer(options) {
  const server = http.createServer(createApp(options).handler());
  server.headersTimeout = 10_000;
  server.requestTimeout = 30_000;
  return server;
}
