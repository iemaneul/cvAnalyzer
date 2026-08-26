import axios from 'axios';
export const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api`, timeout: 20_000 });
export function errorMessage(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.data?.error?.message ?? 'Unable to analyze your resume. Please try again.' : 'Something went wrong.';
}

