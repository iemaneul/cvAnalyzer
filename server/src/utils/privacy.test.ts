import { describe, expect, it } from 'vitest';
import { shouldSaveAnalysis } from './privacy.js';

describe('shouldSaveAnalysis', () => {
  it('opts out only when multipart form explicitly sends false', () => {
    expect(shouldSaveAnalysis('false')).toBe(false);
    expect(shouldSaveAnalysis('true')).toBe(true);
    expect(shouldSaveAnalysis(undefined)).toBe(true);
  });
});
