import express from 'express';
import { prisma } from './db.js';
import { usersRouter } from './routes/users.js';
import { scoresRouter } from './routes/scores.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 3000;

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/users', usersRouter);
app.use('/api/score', scoresRouter);

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Logic Looper API listening on http://localhost:${PORT} (DB connected)`);
  } catch (e) {
    console.error('Failed to connect to database:', e);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
