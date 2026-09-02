import { Check, GitCompareArrows, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Result } from '../components/Result';
import { useAnalyses, useAnalysis, useDeleteAnalysis, useUpdateAnalysisContext } from '../hooks/analyses';
import { errorMessage } from '../services/api';

export function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [previousId, setPreviousId] = useState('');
  const [editing, setEditing] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const { data, isLoading, error } = useAnalysis(id);
  const { data: analyses } = useAnalyses(1, 100);
  const remove = useDeleteAnalysis();
  const updateContext = useUpdateAnalysisContext();

  useEffect(() => {
    if (data && !editing) { setJobTitle(data.jobTitle ?? ''); setCompany(data.company ?? ''); }
  }, [data, editing]);

  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p className="text-rose-600">Analysis not found.</p>;
  const previousOptions = analyses?.data.filter((item) => item.id !== id && new Date(item.createdAt) < new Date(data.createdAt)) ?? [];

  return <div>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      {editing ? <form className="w-full max-w-xl rounded-xl border border-indigo-100 bg-indigo-50 p-4" onSubmit={(event) => {
        event.preventDefault();
        if (id) updateContext.mutate({ id, jobTitle, company }, { onSuccess: () => setEditing(false) });
      }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Job title <span className="text-rose-500">*</span>
            <input autoFocus required minLength={2} maxLength={120} value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Company <span className="font-normal text-slate-400">(optional)</span>
            <input maxLength={120} value={company} onChange={(event) => setCompany(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-indigo-500" />
          </label>
        </div>
        {updateContext.error && <p className="mt-3 text-sm text-rose-700">{errorMessage(updateContext.error)}</p>}
        <div className="mt-4 flex gap-2">
          <button disabled={jobTitle.trim().length < 2 || updateContext.isPending} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{updateContext.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Save</button>
          <button type="button" disabled={updateContext.isPending} onClick={() => setEditing(false)} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600"><X size={16} /> Cancel</button>
        </div>
      </form> : <div>
        <h1 className="text-3xl font-bold">{data.jobTitle ?? data.fileName}</h1>
        {data.company && <p className="mt-1 text-lg font-medium text-indigo-700">{data.company}</p>}
        <p className="mt-1 text-slate-500">{data.fileName} · {new Intl.DateTimeFormat('en', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(data.createdAt))}</p>
      </div>}
      <div className="flex flex-wrap gap-2">
        <button disabled={editing || updateContext.isPending} onClick={() => { updateContext.reset(); setEditing(true); }} className="flex items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-40"><Pencil size={16} /> Edit details</button>
        <button disabled={remove.isPending} onClick={() => {
          if (id && confirm('Delete this analysis?')) remove.mutate(id, { onSuccess: () => navigate('/history') });
        }} className="flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"><Trash2 size={16} /> Delete</button>
      </div>
    </div>
    {previousOptions.length > 0 && <div className="mt-6 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-end">
      <label className="flex-1 text-sm font-medium text-indigo-950">Compare with a previous version
        <select value={previousId} onChange={(event) => setPreviousId(event.target.value)} className="mt-2 w-full rounded-lg border border-indigo-200 bg-white p-2 text-slate-800">
          <option value="">Select an analysis...</option>
          {previousOptions.map((item) => <option key={item.id} value={item.id}>{item.jobTitle ?? item.fileName}{item.company ? ` at ${item.company}` : ''} — {item.score}% — {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.createdAt))}</option>)}
        </select>
      </label>
      <button disabled={!previousId} onClick={() => navigate(`/history/${id}/compare/${previousId}`)} className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-40"><GitCompareArrows size={17} /> Compare versions</button>
    </div>}
    <Result analysis={data} />
  </div>;
}
