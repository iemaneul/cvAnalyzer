import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: { message: 'Maximum file size is 5MB.' } }); return;
  }
  if (error instanceof ZodError) { res.status(400).json({ error: { message: error.issues[0]?.message ?? 'Invalid input.' } }); return; }
  if (error instanceof AppError) { res.status(error.statusCode).json({ error: { message: error.message } }); return; }
  console.error(error);
  res.status(500).json({ error: { message: 'Internal server error.' } });
};

