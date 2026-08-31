import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const requestId = req.header('x-request-id')?.slice(0, 100) || randomUUID();
  const startedAt = performance.now();
  res.setHeader('x-request-id', requestId);
  res.on('finish', () => {
    if (process.env.NODE_ENV === 'test') return;
    console.info(JSON.stringify({
      level: 'info', event: 'http_request', requestId, method: req.method,
      path: req.originalUrl, status: res.statusCode,
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      timestamp: new Date().toISOString(),
    }));
  });
  next();
};
