import { describe, expect, it } from 'vitest';
import { createAccessToken, verifyAccessToken } from './auth.service.js';

describe('authentication tokens', () => {
  it('round-trips a signed user identity and rejects tampering', () => {
    const user = { id: 'user-1', name: 'Manu', email: 'manu@example.com' };
    const token = createAccessToken(user);
    expect(verifyAccessToken(token)).toEqual(user);
    expect(() => verifyAccessToken(`${token}x`)).toThrow();
  });
});
