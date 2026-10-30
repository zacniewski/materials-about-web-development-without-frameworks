export const config = {
  port: Number(process.env.PORT ?? 3000),
  isProd: process.env.NODE_ENV === 'production',
  sessionTtlSeconds: 60 * 60 * 24 * 7,
};
