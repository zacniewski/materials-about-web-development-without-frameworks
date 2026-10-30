export const logger = async (ctx, next) => {
  const start = performance.now();
  try {
    await next();
  } finally {
    console.log(JSON.stringify({
      t: new Date().toISOString(),
      method: ctx.method,
      path: ctx.path,
      status: ctx.res.statusCode,
      ms: Math.round(performance.now() - start),
      htmx: ctx.isHtmx || undefined,
    }));
  }
};
