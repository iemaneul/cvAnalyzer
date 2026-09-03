import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';
import { createAccessToken } from './services/auth.service.js';

const authorization = `Bearer ${createAccessToken({ id: 'test-user', name: 'Test User', email: 'test@example.com' })}`;

describe('API validation', () => {
  it('reports health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('requires a PDF on POST /api/analyze', async () => {
    const response = await request(app).post('/api/analyze').set('Authorization', authorization).field('jobDescription', 'A sufficiently long job description requiring React and TypeScript skills.');
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('A PDF resume is required.');
  });

  it('rejects non-PDF uploads', async () => {
    const response = await request(app).post('/api/analyze').set('Authorization', authorization).field('jobDescription', 'A sufficiently long job description requiring React and TypeScript skills.').attach('resume', Buffer.from('text'), 'resume.txt');
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('The selected file must be a PDF.');
  });

  it('requires a PDF for extracted-text preview', async () => {
    const response = await request(app).post('/api/extract').set('Authorization', authorization);
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('A PDF resume is required.');
  });

  it('protects analysis endpoints', async () => {
    const response = await request(app).get('/api/analyses');
    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('Authentication required.');
  });
});
