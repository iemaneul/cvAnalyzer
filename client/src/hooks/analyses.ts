import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Analysis, AnalysisComparison, AnalysisDashboard, PaginatedAnalyses } from '../types';

export function useAnalyzeResume() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ file, jobTitle, company, jobDescription, saveAnalysis = true }: { file: File; jobTitle: string; company?: string; jobDescription: string; saveAnalysis?: boolean }) => {
    const form = new FormData(); form.append('resume', file); form.append('jobTitle', jobTitle); form.append('company', company ?? ''); form.append('jobDescription', jobDescription); form.append('saveAnalysis', String(saveAnalysis));
    return (await api.post<{data: Analysis}>('/analyze', form)).data.data;
  }, onSuccess: (analysis) => { if (analysis.isSaved !== false) client.invalidateQueries({ queryKey: ['analyses'] }); } });
}
export function useExtractResumeText() { return useMutation({ mutationFn: async (file: File) => {
  const form = new FormData(); form.append('resume', file);
  return (await api.post<{data: {text: string; characters: number; method: 'native' | 'ocr'; pages: number}}>('/extract', form)).data.data;
} }); }
export type AnalysisFilters = { search?: string; status?: Analysis['applicationStatus']; minScore?: number; maxScore?: number; dateFrom?: string; dateTo?: string };
export function useAnalyses(page = 1, limit = 10, filters: AnalysisFilters = {}) { return useQuery({
  queryKey: ['analyses', { page, limit, ...filters }],
  queryFn: async () => (await api.get<PaginatedAnalyses>('/analyses', { params: { page, limit, ...filters } })).data,
}); }
export function useAnalysis(id?: string) { return useQuery({ queryKey: ['analyses', id], enabled: !!id, queryFn: async () => (await api.get<{data: Analysis}>(`/analyses/${id}`)).data.data }); }
export function useUpdateAnalysisContext() { const client = useQueryClient(); return useMutation({
  mutationFn: async ({ id, jobTitle, company }: { id: string; jobTitle: string; company?: string }) => (await api.patch<{data: Analysis}>(`/analyses/${id}/context`, { jobTitle, company })).data.data,
  onSuccess: (analysis) => { client.setQueryData(['analyses', analysis.id], analysis); client.invalidateQueries({ queryKey: ['analyses'] }); },
}); }
export function useUpdateApplicationStatus() { const client = useQueryClient(); return useMutation({
  mutationFn: async ({ id, status }: { id: string; status: NonNullable<Analysis['applicationStatus']> }) => (await api.patch<{data: Analysis}>(`/analyses/${id}/status`, { status })).data.data,
  onSuccess: (analysis) => { client.setQueryData(['analyses', analysis.id], analysis); client.invalidateQueries({ queryKey: ['analyses'] }); },
}); }
export function useAnalysisDashboard() { return useQuery({ queryKey: ['analyses', 'dashboard'], queryFn: async () => (await api.get<{data: AnalysisDashboard}>('/analyses/dashboard')).data.data }); }
export function useAnalysisComparison(id?: string, previousId?: string) { return useQuery({
  queryKey: ['analyses', id, 'compare', previousId], enabled: !!id && !!previousId,
  queryFn: async () => (await api.get<{data: AnalysisComparison}>(`/analyses/${id}/compare/${previousId}`)).data.data,
}); }
export function useDeleteAnalysis() { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => api.delete(`/analyses/${id}`), onSuccess: () => client.invalidateQueries({ queryKey: ['analyses'] }) }); }
