import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

export function serveStatic(prefix, dir) {
  const root = path.resolve(dir);
  return async (ctx, next) => {
    if (!ctx.path.startsWith(prefix + '/') || !['GET', 'HEAD'].includes(ctx.method)) return next();
    let rel;
    try { rel = decodeURIComponent(ctx.path.slice(prefix.length + 1)); } catch { ctx.throw(400, 'Bad path'); }
    const file = path.join(root, rel);
    if (!file.startsWith(root + path.sep)) ctx.throw(403, 'Forbidden');
    let info;
    try { info = await stat(file); } catch { info = null; }
    if (!info?.isFile()) ctx.throw(404, 'File not found');
    const etag = `"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`;
    ctx.res.setHeader('ETag', etag);
    ctx.res.setHeader('Cache-Control', 'public, max-age=3600');
    if (ctx.req.headers['if-none-match'] === etag) {
      ctx.res.statusCode = 304;
      return ctx.res.end();
    }
    ctx.res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'Content-Length': info.size,
    });
    if (ctx.method === 'HEAD') return ctx.res.end();
    await new Promise((resolve, reject) => {
      createReadStream(file).on('error', reject).on('end', resolve).pipe(ctx.res);
    });
  };
}
