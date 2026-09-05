interface ExportableAnalysis {
  jobTitle: string | null; company: string | null; applicationStatus: string; score: number;
  fileName: string; jobUrl: string | null; salary: string | null; workMode: string | null;
  notes: string | null; createdAt: Date;
}

const csvCell = (value: unknown) => {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export function buildApplicationsCsv(analyses: ExportableAnalysis[]) {
  const header = ['Job title', 'Company', 'Status', 'Score', 'Resume', 'Job URL', 'Salary', 'Work mode', 'Notes', 'Created at'];
  const rows = analyses.map((item) => [
    item.jobTitle, item.company, item.applicationStatus, item.score, item.fileName,
    item.jobUrl, item.salary, item.workMode, item.notes, item.createdAt.toISOString(),
  ]);
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
