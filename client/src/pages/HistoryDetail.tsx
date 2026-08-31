import { GitCompareArrows, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Result } from '../components/Result';
import { useAnalyses, useAnalysis, useDeleteAnalysis } from '../hooks/analyses';

export function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [previousId, setPreviousId] = useState('');
  const { data, isLoading, error } = useAnalysis(id);
  const { data: analyses } = useAnalyses(1, 100);
  const remove = useDeleteAnalysis();
  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p className="text-rose-600">Analysis not found.</p>;
  const previousOptions = analyses?.data.filter((item) => item.id !== id && new Date(item.createdAt) < new Date(data.createdAt)) ?? [];
  return <div>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold">{data.fileName}</h1>
        <p className="mt-1 text-slate-500">{new Intl.DateTimeFormat('en', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(data.createdAt))}</p>
      </div>
      <button disabled={remove.isPending} onClick={() => {
        if (id && confirm('Delete this analysis?')) remove.mutate(id, { onSuccess: () => navigate('/history') });
      }} className="flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50">
        <Trash2 size={16} /> Delete
      </button>
    </div>
    {previousOptions.length > 0 && <div className="mt-6 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-end">
      <label className="flex-1 text-sm font-medium text-indigo-950">Compare with a previous version
        <select value={previousId} onChange={(event) => setPreviousId(event.target.value)} className="mt-2 w-full rounded-lg border border-indigo-200 bg-white p-2 text-slate-800">
          <option value="">Select an analysis...</option>
          {previousOptions.map((item) => <option key={item.id} value={item.id}>
            {item.fileName} — {item.score}% — {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.createdAt))}
          </option>)}
        </select>
      </label>
      <button disabled={!previousId} onClick={() => navigate(`/history/${id}/compare/${previousId}`)}
        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-40">
        <GitCompareArrows size={17} /> Compare versions
      </button>
    </div>}
    <Result analysis={data} />
  </div>;
}
