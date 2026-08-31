import axios from 'axios';
import { prisma } from '../lib/prisma.js';

export interface ReadinessChecks {
  database: () => Promise<unknown>;
  python: () => Promise<unknown>;
}

const defaultChecks: ReadinessChecks = {
  database: () => prisma.$queryRaw`SELECT 1`,
  python: () => axios.get(`${process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000'}/health`, { timeout: 2_000 }),
};

export async function checkReadiness(checks: ReadinessChecks = defaultChecks) {
  const [database, python] = await Promise.allSettled([checks.database(), checks.python()]);
  const dependencies = {
    database: database.status === 'fulfilled' ? 'up' : 'down',
    python: python.status === 'fulfilled' ? 'up' : 'down',
  };
  return { ready: dependencies.database === 'up' && dependencies.python === 'up', dependencies };
}
