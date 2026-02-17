import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body ?? {};
    const user = await prisma.user.create({
      data: { email: email ? String(email).trim() || null : null },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ ...user, token });
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
        dailyScores: { take: 365, orderBy: { date: 'desc' } },
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
