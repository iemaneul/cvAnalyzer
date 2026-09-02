import { describe, expect, it } from 'vitest';
import { analysisListQuerySchema, jobContextSchema } from './analysis.js';

describe('jobContextSchema', () => {
  it('requires a meaningful job title and accepts an optional company', () => {
    expect(jobContextSchema.parse({ jobTitle: ' Backend Developer ', company: '' })).toEqual({ jobTitle: 'Backend Developer', company: undefined });
    expect(jobContextSchema.parse({ jobTitle: 'Designer', company: ' Acme ' })).toEqual({ jobTitle: 'Designer', company: 'Acme' });
    expect(() => jobContextSchema.parse({ jobTitle: ' ' })).toThrow();
  });
});

describe('analysisListQuerySchema', () => {
  it('normalizes valid history filters', () => {
    expect(analysisListQuerySchema.parse({
      page: '2', search: ' Acme ', minScore: '50', maxScore: '74', dateFrom: '2026-08-01', dateTo: '2026-08-31',
    })).toMatchObject({ page: 2, limit: 10, search: 'Acme', minScore: 50, maxScore: 74 });
  });

  it('rejects inverted ranges and invalid calendar dates', () => {
    expect(() => analysisListQuerySchema.parse({ minScore: '80', maxScore: '20' })).toThrow();
    expect(() => analysisListQuerySchema.parse({ dateFrom: '2026-02-31' })).toThrow();
    expect(() => analysisListQuerySchema.parse({ dateFrom: '2026-09-02', dateTo: '2026-09-01' })).toThrow();
  });
});
