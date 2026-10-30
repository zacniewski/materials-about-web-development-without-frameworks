import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { startSession, endSession } from '../middleware/session.js';
import { rateLimit } from '../middleware/security.js';
import { validateRegistration } from '../validation.js';
import { loginPage, registerPage } from '../views/pages.js';

// A fixed hash so that "unknown email" takes as long as "wrong password".
const DUMMY_HASH = await hashPassword('dummy-password');

export function authRoutes(router) {
  router.get('/login', (ctx) => {
    if (ctx.state.user) return ctx.redirect('/boards');
    ctx.render('Log in', loginPage({ csrfToken: ctx.state.csrfToken }));
  });

  router.post('/login', rateLimit({ max: 10 }), async (ctx) => {
    const email = String(ctx.body.email ?? '').trim().toLowerCase();
    const password = String(ctx.body.password ?? '');
    const user = await prisma.user.findUnique({ where: { email } });
    const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) {
      console.warn(JSON.stringify({ event: 'login_failed', email }));
      return ctx.render('Log in', loginPage({
        csrfToken: ctx.state.csrfToken, values: { email }, error: 'Invalid email or password.',
      }), 401);
    }
    await startSession(ctx, user.id);
    ctx.redirect('/boards');
  });

  router.get('/register', (ctx) => {
    ctx.render('Register', registerPage({ csrfToken: ctx.state.csrfToken }));
  });

  router.post('/register', rateLimit({ max: 5 }), async (ctx) => {
    const { ok, values, errors, password } = validateRegistration(ctx.body);
    if (ok) {
      try {
        const user = await prisma.user.create({
          data: { ...values, passwordHash: await hashPassword(password) },
        });
        await startSession(ctx, user.id);
        return ctx.redirect('/boards');
      } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
        errors.email = 'This email is already registered.';
      }
    }
    ctx.render('Register', registerPage({ csrfToken: ctx.state.csrfToken, values, errors }), 422);
  });

  router.post('/logout', async (ctx) => {
    await endSession(ctx);
    ctx.redirect('/login');
  });
}
