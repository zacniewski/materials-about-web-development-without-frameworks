import { createServer } from './app.js';
import { config } from './config.js';
import { prisma } from './db.js';

const server = createServer();

server.listen(config.port, () => {
  console.log(`Task board listening on http://localhost:${config.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
