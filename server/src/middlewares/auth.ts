import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) throw new AppError(401, 'Authentication required.');
    req.user = verifyAccessToken(authorization.slice(7));
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired session.'));
  }
}
