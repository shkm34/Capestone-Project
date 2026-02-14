import { Router } from 'express';
import * as usersController from '../controllers/usersController.js';

export const usersRouter = Router();

usersRouter.post('/', usersController.createUser);
usersRouter.get('/:id', usersController.getUserById);
