import { Response } from 'express';
import { prisma } from '../db.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

/** Create or update daily score. Requires auth (userId from JWT). Body: date, puzzleId, score, timeTakenMs?, streak?. */
export async function submitScore(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { date, puzzleId, score, timeTakenMs, streak } = req.body ?? {};
    if (!date || puzzleId == null || score == null) {
      res.status(400).json({
        error: 'Missing required fields: date, puzzleId, score',
      });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const scoreNum = Number(score);
    const timeMs = timeTakenMs != null ? Number(timeTakenMs) : null;
    const streakCount = typeof streak === 'number' && streak >= 0 ? streak : user.streakCount;

    await prisma.dailyScore.upsert({
      where: {
        userId_date: { userId, date: String(date) },
      },
      create: {
        userId,
        date: String(date),
        puzzleId: String(puzzleId),
        score: scoreNum,
        timeTakenMs: timeMs ?? undefined,
      },
      update: {
        puzzleId: String(puzzleId),
        score: scoreNum,
        timeTakenMs: timeMs ?? undefined,
      },
    });

    const totalFromScores = await prisma.dailyScore.aggregate({
      where: { userId },
      _sum: { score: true },
    });
    const totalPoints = totalFromScores._sum.score ?? 0;

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints,
        lastPlayed: new Date(),
        streakCount,
      },
    });

    const stats = await prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        puzzlesSolved: 1,
        avgSolveTimeMs: timeMs ?? 0,
      },
      update: {
        puzzlesSolved: { increment: 1 },
        avgSolveTimeMs: timeMs != null ? undefined : undefined,
      },
    });

    if (timeMs != null && stats) {
      const prevAvg = stats.avgSolveTimeMs ?? 0;
      const prevCount = stats.puzzlesSolved - 1;
      const newAvg =
        prevCount <= 0 ? timeMs : Math.round((prevAvg * prevCount + timeMs) / stats.puzzlesSolved);
      await prisma.userStats.update({
        where: { userId },
        data: { avgSolveTimeMs: newAvg },
      });
    }

    res.status(200).json({ accepted: true, streak: streakCount });
  } catch (e) {
    console.error('[scoresController.submitScore]', e);
    res.status(500).json({ error: 'Failed to save score' });
  }
}

export async function getScore(req: Request, res: Response): Promise<void> {
  try {
    const { userId, date } = req.query;
    if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
      res.status(400).json({ error: 'Query params required: userId, date' });
      return;
    }
    const score = await prisma.dailyScore.findUnique({
      where: { userId_date: { userId, date } },
      include: { user: { select: { id: true, email: true, streakCount: true } } },
    });
    if (!score) {
      res.status(404).json({ error: 'Score not found' });
      return;
    }
    res.json(score);
  } catch (e) {
    console.error('[scoresController.getScore]', e);
    res.status(500).json({ error: 'Failed to fetch score' });
  }
}

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const date = req.query.date as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    if (!date) {
      res.status(400).json({ error: 'Query param required: date' });
      return;
    }
    const scores = await prisma.dailyScore.findMany({
      where: { date },
      orderBy: { score: 'desc' },
      take: limit,
      include: { user: { select: { id: true, email: true } } },
    });
    res.json({ date, scores });
  } catch (e) {
    console.error('[scoresController.getLeaderboard]', e);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
