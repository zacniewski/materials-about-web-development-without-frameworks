import { Prisma } from '@prisma/client';
import { errorPage } from '../views/pages.js';

export const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    let status = err.status ?? 500;
    let message = err.expose ? err.message : 'Internal Server Error';
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      status = 404;
      message = 'Not found';
    }
    if (status >= 500) console.error(err);
    if (ctx.res.headersSent) return ctx.res.end();
    if (ctx.isHtmx) {
      // HTMX does not swap error responses by default; show a toast-like alert instead.
      ctx.res.setHeader('HX-Retarget', '#alerts');
      ctx.res.setHeader('HX-Reswap', 'innerHTML');
    }
    ctx.render(`Error ${status}`, errorPage(status, message), status, { partial: ctx.isHtmx });
  }
};
