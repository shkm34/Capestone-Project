import { Router } from 'express';
import * as authController from '../controllers/authController.js';

export const authRouter = Router();

authRouter.get('/session', authController.getSession);
authRouter.get('/signin/google', authController.signinGoogle);
authRouter.get('/callback/google', authController.callbackGoogle);
authRouter.post('/signout', authController.signOut);
authRouter.get('/config-check', authController.configCheck);
