import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Analysis } from '../types';

export function useAnalyzeResume() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ file, jobDescription }: { file: File; jobDescription: string }) => {
    const form = new FormData(); form.append('resume', file); form.append('jobDescription', jobDescription);
    return (await api.post<{data: Analysis}>('/analyze', form)).data.data;
  }, onSuccess: () => client.invalidateQueries({ queryKey: ['analyses'] }) });
}
export function useAnalyses() { return useQuery({ queryKey: ['analyses'], queryFn: async () => (await api.get<{data: Analysis[]}>('/analyses')).data.data }); }
export function useAnalysis(id?: string) { return useQuery({ queryKey: ['analyses', id], enabled: !!id, queryFn: async () => (await api.get<{data: Analysis}>(`/analyses/${id}`)).data.data }); }
export function useDeleteAnalysis() { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => api.delete(`/analyses/${id}`), onSuccess: () => client.invalidateQueries({ queryKey: ['analyses'] }) }); }

