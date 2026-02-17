import './config/loadEnv.js';

import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { scoresRouter } from './routes/scores.js';

const app = express();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/score', scoresRouter);

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`API http://localhost:${PORT} (DB connected)`);
  } catch (e) {
    console.error('DB connect failed:', e);
    process.exit(1);
  }
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
