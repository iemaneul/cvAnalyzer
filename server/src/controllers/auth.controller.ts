import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { loginSchema, registerSchema } from '../schemas/auth.js';
import { createAccessToken } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';

const publicUser = (user: { id: string; name: string; email: string }) => ({ id: user.id, name: user.name, email: user.email });

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({ data: { name: input.name, email: input.email, passwordHash } });
    const safeUser = publicUser(user);
    res.status(201).json({ data: { user: safeUser, token: createAccessToken(safeUser) } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return next(new AppError(409, 'An account with this email already exists.'));
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !await bcrypt.compare(input.password, user.passwordHash)) throw new AppError(401, 'Invalid email or password.');
    const safeUser = publicUser(user);
    res.json({ data: { user: safeUser, token: createAccessToken(safeUser) } });
  } catch (error) { next(error); }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true } });
    if (!user) throw new AppError(401, 'Account not found.');
    res.json({ data: user });
  } catch (error) { next(error); }
}
