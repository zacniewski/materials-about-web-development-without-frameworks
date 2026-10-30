import { compose } from './router.js';
import { createContext } from './context.js';

// A tiny application object: a middleware stack turned into a node:http handler.
export function createApplication() {
  const stack = [];
  const app = {
    use(fn) {
      stack.push(fn);
      return app;
    },
    handler() {
      const run = compose(stack);
      return async (req, res) => {
        const ctx = createContext(req, res);
        try {
          await run(ctx, async () => ctx.throw(404, 'Page not found'));
        } catch (err) {
          // last resort: errorHandler middleware should normally catch everything
          console.error(err);
          if (!res.headersSent) res.writeHead(err.status ?? 500, { 'Content-Type': 'text/plain' });
          res.end(err.expose ? err.message : 'Internal Server Error');
        }
      };
    },
  };
  return app;
}
