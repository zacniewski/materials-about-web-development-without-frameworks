// Minimal Koa-style middleware composition and a router (see lecture 7).

export function compose(middleware) {
  return function run(ctx, last) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      const fn = i === middleware.length ? last : middleware[i];
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}

export class Router {
  #routes = [];

  add(method, pattern, ...handlers) {
    const keys = [];
    const source = pattern.replace(/\/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '/([^/]+)';
    });
    this.#routes.push({ method, regex: new RegExp(`^${source}/?$`), keys, handlers });
    return this;
  }

  get(pattern, ...handlers) { return this.add('GET', pattern, ...handlers); }
  post(pattern, ...handlers) { return this.add('POST', pattern, ...handlers); }
  put(pattern, ...handlers) { return this.add('PUT', pattern, ...handlers); }
  patch(pattern, ...handlers) { return this.add('PATCH', pattern, ...handlers); }
  delete(pattern, ...handlers) { return this.add('DELETE', pattern, ...handlers); }

  match(method, path) {
    let pathMatched = false;
    for (const route of this.#routes) {
      const m = route.regex.exec(path);
      if (!m) continue;
      pathMatched = true;
      if (route.method !== method && !(route.method === 'GET' && method === 'HEAD')) continue;
      const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { route, params };
    }
    return { route: null, pathMatched };
  }

  middleware() {
    return async (ctx, next) => {
      const found = this.match(ctx.method, ctx.path);
      if (found.route) {
        ctx.params = found.params;
        return compose(found.route.handlers)(ctx);
      }
      if (found.pathMatched) ctx.throw(405, 'Method Not Allowed');
      return next();
    };
  }
}
