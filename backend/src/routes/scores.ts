import { Router, type RequestHandler } from 'express';
import * as scoresController from '../controllers/scoresController.js';
import { requireAuth } from '../middleware/auth.js';

export const scoresRouter = Router();

// requireAuth sets req.user; submitScore expects AuthenticatedRequest (safe at runtime)
scoresRouter.post('/', requireAuth, scoresController.submitScore as unknown as RequestHandler);
scoresRouter.get('/leaderboard', scoresController.getLeaderboard);
scoresRouter.get('/', scoresController.getScore);
