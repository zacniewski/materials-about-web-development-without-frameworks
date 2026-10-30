import { HttpError } from '../http-error.js';

export async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'Payload too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// Repeated keys (checkboxes) become arrays.
export function parseUrlEncoded(raw) {
  const out = {};
  for (const [k, v] of new URLSearchParams(raw)) {
    if (k in out) out[k] = [].concat(out[k], v);
    else out[k] = v;
  }
  return out;
}

export function bodyParser({ limit = 100_000 } = {}) {
  return async (ctx, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(ctx.method)) {
      const type = (ctx.req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
      const raw = await readBody(ctx.req, limit);
      if (type === 'application/x-www-form-urlencoded') ctx.body = parseUrlEncoded(raw);
      else if (type === 'application/json' && raw) {
        try { ctx.body = JSON.parse(raw); } catch { ctx.throw(400, 'Invalid JSON'); }
      }
    }
    await next();
  };
}

// <input type="hidden" name="_method" value="DELETE"> in a POST form → DELETE
export const methodOverride = async (ctx, next) => {
  const m = String(ctx.body?._method ?? '').toUpperCase();
  if (ctx.method === 'POST' && ['PUT', 'PATCH', 'DELETE'].includes(m)) ctx.method = m;
  await next();
};
