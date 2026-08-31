import { describe, expect, it } from 'vitest';
import { checkReadiness } from './readiness.service.js';

describe('checkReadiness', () => {
  it('is ready only when both dependencies respond', async () => {
    expect((await checkReadiness({ database: async () => true, python: async () => true })).ready).toBe(true);
    const failed = await checkReadiness({ database: async () => true, python: async () => { throw new Error('offline'); } });
    expect(failed).toEqual({ ready: false, dependencies: { database: 'up', python: 'down' } });
  });
});
