import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Analysis, AnalysisComparison } from '../types';

export function useAnalyzeResume() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ file, jobDescription, saveAnalysis = true }: { file: File; jobDescription: string; saveAnalysis?: boolean }) => {
    const form = new FormData(); form.append('resume', file); form.append('jobDescription', jobDescription); form.append('saveAnalysis', String(saveAnalysis));
    return (await api.post<{data: Analysis}>('/analyze', form)).data.data;
  }, onSuccess: (analysis) => { if (analysis.isSaved !== false) client.invalidateQueries({ queryKey: ['analyses'] }); } });
}
export function useExtractResumeText() { return useMutation({ mutationFn: async (file: File) => {
  const form = new FormData(); form.append('resume', file);
  return (await api.post<{data: {text: string; characters: number}}>('/extract', form)).data.data;
} }); }
export function useAnalyses() { return useQuery({ queryKey: ['analyses'], queryFn: async () => (await api.get<{data: Analysis[]}>('/analyses')).data.data }); }
export function useAnalysis(id?: string) { return useQuery({ queryKey: ['analyses', id], enabled: !!id, queryFn: async () => (await api.get<{data: Analysis}>(`/analyses/${id}`)).data.data }); }
export function useAnalysisComparison(id?: string, previousId?: string) { return useQuery({
  queryKey: ['analyses', id, 'compare', previousId], enabled: !!id && !!previousId,
  queryFn: async () => (await api.get<{data: AnalysisComparison}>(`/analyses/${id}/compare/${previousId}`)).data.data,
}); }
export function useDeleteAnalysis() { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => api.delete(`/analyses/${id}`), onSuccess: () => client.invalidateQueries({ queryKey: ['analyses'] }) }); }
