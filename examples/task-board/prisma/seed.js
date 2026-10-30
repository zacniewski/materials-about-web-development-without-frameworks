import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';

const prisma = new PrismaClient();

const demo = await prisma.user.upsert({
  where: { email: 'demo@example.com' },
  update: {},
  create: { email: 'demo@example.com', name: 'Demo Student', passwordHash: await hashPassword('password123') },
});

const existing = await prisma.board.findFirst({ where: { ownerId: demo.id, name: 'Course preparation' } });
if (!existing) {
  const tag = (name) => ({ where: { name }, create: { name } });
  await prisma.board.create({
    data: {
      name: 'Course preparation',
      owner: { connect: { id: demo.id } },
      tasks: {
        create: [
          { title: 'Install Node.js and PostgreSQL', status: 'DONE', priority: 'HIGH', tags: { connectOrCreate: [tag('setup')] } },
          { title: 'Read lecture 7 about middleware', status: 'DOING', tags: { connectOrCreate: [tag('reading')] } },
          { title: 'Design the project data model', priority: 'HIGH', description: 'At least 3 related models.', tags: { connectOrCreate: [tag('project')] } },
          { title: 'Try HTMX active search', priority: 'LOW', tags: { connectOrCreate: [tag('htmx')] } },
        ],
      },
    },
  });
}

console.log('Seed finished. Log in as demo@example.com / password123');
await prisma.$disconnect();
