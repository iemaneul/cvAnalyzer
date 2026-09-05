import { describe, expect, it } from 'vitest';
import { changePasswordSchema, loginSchema, registerSchema, updateProfileSchema } from './auth.js';

describe('authentication schemas', () => {
  it('normalizes registration identity', () => {
    expect(registerSchema.parse({ name: ' Manu ', email: 'MANU@EXAMPLE.COM', password: 'password123' }))
      .toEqual({ name: 'Manu', email: 'manu@example.com', password: 'password123' });
  });

  it('rejects malformed credentials', () => {
    expect(() => loginSchema.parse({ email: 'invalid', password: 'short' })).toThrow();
  });

  it('validates profile and password changes', () => {
    expect(updateProfileSchema.parse({ name: ' Emanuel ', email: 'NEW@EXAMPLE.COM' })).toEqual({ name: 'Emanuel', email: 'new@example.com' });
    expect(changePasswordSchema.parse({ currentPassword: 'old-password', newPassword: 'new-password' })).toBeTruthy();
    expect(() => changePasswordSchema.parse({ currentPassword: 'same-password', newPassword: 'same-password' })).toThrow();
  });
});
