import { describe, expect, it } from 'vitest';
import { buildApplicationsCsv } from './csv.service.js';

describe('buildApplicationsCsv', () => {
  it('escapes commas, quotes, newlines, and spreadsheet formulas', () => {
    const csv = buildApplicationsCsv([{
      jobTitle: 'Developer, Senior', company: 'Acme "Labs"', applicationStatus: 'interview', score: 82,
      fileName: 'resume.pdf', jobUrl: 'https://example.com', salary: '=1+1', workMode: 'remote',
      notes: 'First line\nSecond line', createdAt: new Date('2026-09-05T12:00:00.000Z'),
    }]);
    expect(csv).toContain('"Developer, Senior"');
    expect(csv).toContain('"Acme ""Labs"""');
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('"First line\nSecond line"');
  });
});
