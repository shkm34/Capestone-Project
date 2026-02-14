import { Request, Response } from 'express';
import { prisma } from '../db.js';

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body ?? {};
    const user = await prisma.user.create({
      data: { email: email ? String(email).trim() || null : null },
    });
    res.status(201).json(user);
  } catch (e) {
    console.error('[usersController.createUser]', e);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        stats: true,
        dailyScores: { take: 30, orderBy: { date: 'desc' } },
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (e) {
    console.error('[usersController.getUserById]', e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
