import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

export const authRouter = Router();
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8' });
authRouter.post('/register', authLimit, register);
authRouter.post('/login', authLimit, login);
authRouter.get('/me', authenticate, me);
