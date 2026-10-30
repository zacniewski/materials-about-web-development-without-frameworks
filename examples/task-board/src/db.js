import { PrismaClient } from '@prisma/client';

// One PrismaClient per process (lecture 10). It connects lazily on the first query.
export const prisma = new PrismaClient({
  log: process.env.PRISMA_LOG_QUERIES === 'true' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});
