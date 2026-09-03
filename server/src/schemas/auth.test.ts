import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.js';

describe('authentication schemas', () => {
  it('normalizes registration identity', () => {
    expect(registerSchema.parse({ name: ' Manu ', email: 'MANU@EXAMPLE.COM', password: 'password123' }))
      .toEqual({ name: 'Manu', email: 'manu@example.com', password: 'password123' });
  });

  it('rejects malformed credentials', () => {
    expect(() => loginSchema.parse({ email: 'invalid', password: 'short' })).toThrow();
  });
});
