import { timingSafeEqual } from 'node:crypto';
import { randomToken } from '../lib/password.js';
import { config } from '../config.js';

export const securityHeaders = async (ctx, next) => {
  const res = ctx.res;
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' https://unpkg.com",
    // htmx injects a small <style> for indicators, hence 'unsafe-inline' for styles only
    "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'",
    "img-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  await next();
};

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

// Double-submit cookie CSRF protection: the token lives in a cookie and must be
// echoed in a form field (_csrf) or the X-CSRF-Token header (set by hx-headers).
export const csrf = async (ctx, next) => {
  let token = ctx.cookies.csrf;
  if (!token) {
    token = randomToken(24);
    ctx.setCookie('csrf', token, { secure: config.isProd, sameSite: 'Lax' });
  }
  ctx.state.csrfToken = token;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(ctx.req.method)) {
    const sent = ctx.req.headers['x-csrf-token'] ?? ctx.body?._csrf;
    if (!ctx.cookies.csrf || !sent || !safeEqual(sent, ctx.cookies.csrf)) ctx.throw(403, 'Invalid CSRF token');
  }
  await next();
};

export function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  const hits = new Map();
  return async (ctx, next) => {
    const key = `${ctx.req.socket.remoteAddress}:${ctx.path}`;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || now > entry.reset) entry = { n: 0, reset: now + windowMs };
    entry.n += 1;
    hits.set(key, entry);
    if (entry.n > max) ctx.throw(429, 'Too many attempts, try again in a minute.');
    await next();
  };
}
