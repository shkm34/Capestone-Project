import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

interface JwtPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user: { id: string };
}

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

/** Require valid Bearer JWT; set req.user. Responds 401 if missing or invalid. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    prisma.user
      .findUnique({
        where: { id: decoded.userId },
        select: { id: true },
      })
      .then((user) => {
        if (!user) {
          res.status(401).json({ error: 'User not found' });
          return;
        }
        (req as AuthenticatedRequest).user = { id: user.id };
        next();
      })
      .catch(() => {
        res.status(500).json({ error: 'Authentication check failed' });
      });
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}
