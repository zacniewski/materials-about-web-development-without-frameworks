import { prisma } from '../db.js';
import { randomToken } from '../lib/password.js';
import { config } from '../config.js';

const COOKIE = 'sid';

export const session = async (ctx, next) => {
  const sid = ctx.cookies[COOKIE];
  if (sid) {
    const s = await prisma.session.findUnique({ where: { id: sid }, include: { user: true } });
    if (s && s.expiresAt > new Date()) {
      ctx.state.session = s;
      ctx.state.user = { id: s.user.id, name: s.user.name, email: s.user.email };
    } else if (s) {
      await prisma.session.delete({ where: { id: sid } }).catch(() => {});
    }
  }
  await next();
};

export async function startSession(ctx, userId) {
  // a brand-new id on every login prevents session fixation
  const id = randomToken(32);
  await prisma.session.create({
    data: { id, userId, expiresAt: new Date(Date.now() + config.sessionTtlSeconds * 1000) },
  });
  ctx.setCookie(COOKIE, id, { maxAge: config.sessionTtlSeconds, secure: config.isProd });
}

export async function endSession(ctx) {
  if (ctx.state.session) await prisma.session.deleteMany({ where: { id: ctx.state.session.id } });
  ctx.setCookie(COOKIE, '', { maxAge: 0, secure: config.isProd });
}

export const requireAuth = async (ctx, next) => {
  if (!ctx.state.user) return ctx.redirect('/login');
  await next();
};
