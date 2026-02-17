import { Router } from 'express';
import * as scoresController from '../controllers/scoresController.js';
import { requireAuth } from '../middleware/auth.js';

export const scoresRouter = Router();

scoresRouter.post('/', requireAuth, scoresController.submitScore);
scoresRouter.get('/leaderboard', scoresController.getLeaderboard);
scoresRouter.get('/', scoresController.getScore);
