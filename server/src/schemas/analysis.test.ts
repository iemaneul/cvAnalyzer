import { describe, expect, it } from 'vitest';
import { jobContextSchema } from './analysis.js';

describe('jobContextSchema', () => {
  it('requires a meaningful job title and accepts an optional company', () => {
    expect(jobContextSchema.parse({ jobTitle: ' Backend Developer ', company: '' })).toEqual({ jobTitle: 'Backend Developer', company: undefined });
    expect(jobContextSchema.parse({ jobTitle: 'Designer', company: ' Acme ' })).toEqual({ jobTitle: 'Designer', company: 'Acme' });
    expect(() => jobContextSchema.parse({ jobTitle: ' ' })).toThrow();
  });
});
