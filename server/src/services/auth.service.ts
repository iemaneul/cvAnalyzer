import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET ?? 'development-only-change-me';

export function createAccessToken(user: { id: string; name: string; email: string }) {
  return jwt.sign({ name: user.name, email: user.email }, secret(), { subject: user.id, expiresIn: '7d' });
}

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, secret());
  if (typeof payload === 'string' || typeof payload.sub !== 'string' || typeof payload.name !== 'string' || typeof payload.email !== 'string') throw new Error('Invalid token payload.');
  return { id: payload.sub, name: payload.name, email: payload.email };
}
