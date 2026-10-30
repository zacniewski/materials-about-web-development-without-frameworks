import { prisma } from '../db.js';
import { requireAuth } from '../middleware/session.js';
import { parseId, parseTags, validateStatus, validateTask } from '../validation.js';
import { columns, taskCard, taskEditForm } from '../views/board.js';
import { findTasks } from './boards.js';

// Loads a task only if it belongs to a board owned by the current user (prevents IDOR).
async function loadTask(ctx, next) {
  const id = parseId(ctx.params.id);
  const task = id && await prisma.task.findFirst({
    where: { id, board: { ownerId: ctx.state.user.id } },
    include: { tags: { orderBy: { name: 'asc' } } },
  });
  if (!task) ctx.throw(404, 'Task not found');
  ctx.state.task = task;
  await next();
}

export function taskRoutes(router) {
  const guard = [requireAuth, loadTask];

  router.get('/tasks/:id', ...guard, (ctx) => ctx.html(taskCard(ctx.state.task)));

  router.get('/tasks/:id/edit', ...guard, (ctx) => ctx.html(taskEditForm({ task: ctx.state.task })));

  router.put('/tasks/:id', ...guard, async (ctx) => {
    const { task } = ctx.state;
    const { ok, values, errors } = validateTask(ctx.body);
    if (!ok) return ctx.html(taskEditForm({ task, values, errors }));
    const names = parseTags(values.tags);
    const updated = await prisma.task.update({
      where: { id: task.id },
      data: {
        title: values.title,
        description: values.description,
        priority: values.priority,
        tags: {
          set: [],
          connectOrCreate: names.map((name) => ({ where: { name }, create: { name } })),
        },
      },
      include: { tags: { orderBy: { name: 'asc' } } },
    });
    ctx.html(taskCard(updated));
  });

  // Moving a task changes its column, so we re-render all columns.
  router.patch('/tasks/:id/status', ...guard, async (ctx) => {
    const status = validateStatus(ctx.body);
    if (!status) ctx.throw(400, 'Invalid status');
    await prisma.task.update({ where: { id: ctx.state.task.id }, data: { status } });
    ctx.html(columns(await findTasks(ctx.state.task.boardId)));
  });

  // 200 + empty body: htmx replaces the card with nothing (it ignores 204 bodies).
  router.delete('/tasks/:id', ...guard, async (ctx) => {
    await prisma.task.delete({ where: { id: ctx.state.task.id } });
    ctx.html('');
  });
}
