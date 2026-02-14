import { Router } from 'express';
import * as scoresController from '../controllers/scoresController.js';

export const scoresRouter = Router();

scoresRouter.post('/', scoresController.submitScore);
scoresRouter.get('/leaderboard', scoresController.getLeaderboard);
scoresRouter.get('/', scoresController.getScore);
