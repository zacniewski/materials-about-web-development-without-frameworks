import { HttpError } from './http-error.js';

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const key = part.slice(0, i).trim();
    if (!key) continue;
    try { out[key] = decodeURIComponent(part.slice(i + 1).trim()); } catch { /* ignore malformed */ }
  }
  return out;
}

export function serializeCookie(name, value, opts = {}) {
  let s = `${name}=${encodeURIComponent(value)}; Path=${opts.path ?? '/'}`;
  if (opts.maxAge !== undefined) s += `; Max-Age=${opts.maxAge}`;
  if (opts.httpOnly !== false) s += '; HttpOnly';
  if (opts.secure) s += '; Secure';
  s += `; SameSite=${opts.sameSite ?? 'Lax'}`;
  return s;
}

export function createContext(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const ctx = {
    req,
    res,
    method: req.method,
    url,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    params: {},
    body: {},
    state: {},
    cookies: parseCookies(req.headers.cookie),

    get isHtmx() {
      return req.headers['hx-request'] === 'true';
    },

    throw(status, message) {
      throw new HttpError(status, message);
    },

    setCookie(name, value, opts) {
      const prev = res.getHeader('Set-Cookie') ?? [];
      res.setHeader('Set-Cookie', [...[].concat(prev), serializeCookie(name, value, opts)]);
    },

    html(body, status = 200) {
      res.statusCode = status;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Vary', 'HX-Request');
      res.end(ctx.method === 'HEAD' ? undefined : String(body));
    },

    json(data, status = 200) {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(data));
    },

    redirect(location, status = 303) {
      if (ctx.isHtmx) {
        res.setHeader('HX-Redirect', location);
        res.statusCode = 200;
        return res.end();
      }
      res.writeHead(status, { Location: location });
      res.end();
    },
  };
  return ctx;
}
