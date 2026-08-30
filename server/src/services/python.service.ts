import axios from 'axios';
import FormData from 'form-data';
import { analysisResultSchema } from '../schemas/analysis.js';
import { AppError } from '../utils/AppError.js';

export async function analyzeWithPython(file: Express.Multer.File, jobDescription: string) {
  const form = new FormData();
  form.append('resume', file.buffer, { filename: file.originalname, contentType: 'application/pdf' });
  form.append('jobDescription', jobDescription);
  try {
    const response = await axios.post(`${process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000'}/analyze`, form, {
      headers: form.getHeaders(), timeout: 15_000, maxBodyLength: 6 * 1024 * 1024,
    });
    return analysisResultSchema.parse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') throw new AppError(504, 'The analysis service timed out.');
      if (!error.response) throw new AppError(503, 'The analysis service is temporarily unavailable.');
      const detail = error.response.data?.detail;
      throw new AppError(error.response.status === 422 ? 422 : 502, typeof detail === 'string' ? detail : 'Unable to analyze your resume. Please try again.');
    }
    throw new AppError(502, 'The analysis service returned an invalid response.');
  }
}

export async function generateReportWithPython(analysis: unknown): Promise<Buffer> {
  try {
    const response = await axios.post(
      `${process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000'}/report`, analysis,
      { timeout: 15_000, responseType: 'arraybuffer' },
    );
    const content = Buffer.from(response.data);
    if (!content.subarray(0, 4).equals(Buffer.from('%PDF'))) throw new Error('Invalid PDF response');
    return content;
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) throw new AppError(503, 'The report service is temporarily unavailable.');
    throw new AppError(502, 'Unable to generate the PDF report.');
  }
}
