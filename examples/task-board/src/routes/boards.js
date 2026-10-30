import { prisma } from '../db.js';
import { requireAuth } from '../middleware/session.js';
import { parseId, validateBoard, validateTask } from '../validation.js';
import { boardsPage, boardListItem, newBoardForm } from '../views/pages.js';
import { boardPage, columns, taskCard, newTaskForm } from '../views/board.js';
import { html } from '../views/html.js';

const TASK_INCLUDE = { tags: { orderBy: { name: 'asc' } } };

// Per-route middleware: loads the board *and* checks ownership in one query.
export async function loadBoard(ctx, next) {
  const id = parseId(ctx.params.id);
  const board = id && await prisma.board.findFirst({ where: { id, ownerId: ctx.state.user.id } });
  if (!board) ctx.throw(404, 'Board not found');
  ctx.state.board = board;
  await next();
}

export function findTasks(boardId, q = '') {
  const where = { boardId };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { tags: { some: { name: { contains: q.toLowerCase() } } } },
    ];
  }
  return prisma.task.findMany({ where, include: TASK_INCLUDE, orderBy: [{ priority: 'desc' }, { id: 'asc' }] });
}

export function boardRoutes(router) {
  router.get('/boards', requireAuth, async (ctx) => {
    const boards = await prisma.board.findMany({
      where: { ownerId: ctx.state.user.id },
      include: { _count: { select: { tasks: true } } },   // one query, no N+1
      orderBy: { createdAt: 'asc' },
    });
    ctx.render('My boards', boardsPage({ boards, csrfToken: ctx.state.csrfToken }));
  });

  router.post('/boards', requireAuth, async (ctx) => {
    const { ok, values, errors } = validateBoard(ctx.body);
    const csrfToken = ctx.state.csrfToken;
    if (!ok) {
      if (ctx.isHtmx) return ctx.html(newBoardForm({ csrfToken, values, errors, oob: true }));
      const boards = await prisma.board.findMany({ where: { ownerId: ctx.state.user.id }, include: { _count: { select: { tasks: true } } } });
      return ctx.render('My boards', boardsPage({ boards, csrfToken, values, errors }), 422);
    }
    const board = await prisma.board.create({
      data: { name: values.name, ownerId: ctx.state.user.id },
      include: { _count: { select: { tasks: true } } },
    });
    if (!ctx.isHtmx) return ctx.redirect(`/boards/${board.id}`);
    ctx.html(html`${boardListItem(board)}${newBoardForm({ csrfToken, oob: true })}`);
  });

  router.get('/boards/:id', requireAuth, loadBoard, async (ctx) => {
    const q = String(ctx.query.q ?? '').trim();
    const tasks = await findTasks(ctx.state.board.id, q);
    ctx.render(ctx.state.board.name, boardPage({ board: ctx.state.board, tasks, q, csrfToken: ctx.state.csrfToken }));
  });

  router.delete('/boards/:id', requireAuth, loadBoard, async (ctx) => {
    await prisma.board.delete({ where: { id: ctx.state.board.id } });   // tasks cascade
    ctx.redirect('/boards');
  });

  // HTMX active search → returns only the #columns fragment
  router.get('/boards/:id/tasks', requireAuth, loadBoard, async (ctx) => {
    const q = String(ctx.query.q ?? '').trim();
    if (!ctx.isHtmx) return ctx.redirect(`/boards/${ctx.state.board.id}?q=${encodeURIComponent(q)}`);
    ctx.html(columns(await findTasks(ctx.state.board.id, q)));
  });

  router.post('/boards/:id/tasks', requireAuth, loadBoard, async (ctx) => {
    const board = ctx.state.board;
    const csrfToken = ctx.state.csrfToken;
    const { ok, values, errors } = validateTask(ctx.body);
    if (!ok) {
      // keep the column untouched, re-render only the form (out-of-band)
      if (ctx.isHtmx) return ctx.html(newTaskForm({ boardId: board.id, csrfToken, values, errors, oob: true }));
      const tasks = await findTasks(board.id);
      return ctx.render(board.name, boardPage({ board, tasks, csrfToken, values, errors }), 422);
    }
    const task = await prisma.task.create({
      data: { title: values.title, priority: values.priority, boardId: board.id },
      include: TASK_INCLUDE,
    });
    if (!ctx.isHtmx) return ctx.redirect(`/boards/${board.id}`);
    ctx.html(html`${taskCard(task)}${newTaskForm({ boardId: board.id, csrfToken, oob: true })}`, 201);
  });
}
