import { Building2, Columns3, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applicationStatuses, applicationStatusStyle } from '../application-status';
import { useAnalyses, useUpdateApplicationStatus } from '../hooks/analyses';

export function Board() {
  const { data, isLoading, error } = useAnalyses(1, 100);
  const updateStatus = useUpdateApplicationStatus();
  if (isLoading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={18} /> Loading application board...</div>;
  if (error || !data) return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">Unable to load application board.</p>;
  return <div>
    <h1 className="flex items-center gap-3 text-3xl font-bold"><Columns3 className="text-indigo-600" /> Application board</h1>
    <p className="mt-2 text-slate-500">Review your pipeline and move opportunities between stages.</p>
    <div className="mt-7 overflow-x-auto pb-4"><div className="grid min-w-[1180px] grid-cols-5 gap-4">
      {applicationStatuses.map((stage) => {
        const items = data.data.filter((item) => (item.applicationStatus ?? 'planned') === stage.value);
        return <section key={stage.value} className="min-h-96 rounded-2xl bg-slate-100 p-3">
          <header className="flex items-center justify-between gap-2 px-1 py-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${applicationStatusStyle[stage.value]}`}>{stage.label}</span><strong className="text-sm text-slate-500">{items.length}</strong></header>
          <div className="mt-2 space-y-3">{items.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Link to={`/history/${item.id}`} className="font-semibold text-indigo-700 hover:underline">{item.jobTitle ?? 'Previous analysis'}</Link>
            <p className="mt-1 flex items-center gap-1 truncate text-sm text-slate-500"><Building2 size={13} /> {item.company ?? 'Company not specified'}</p>
            <div className="mt-3 flex items-center justify-between"><strong>{item.score}%</strong><span className="text-xs text-slate-400">{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(item.createdAt))}</span></div>
            <select aria-label={`Move ${item.jobTitle ?? item.fileName}`} disabled={updateStatus.isPending} value={item.applicationStatus ?? 'planned'} onChange={(event) => updateStatus.mutate({ id: item.id, status: event.target.value as NonNullable<typeof item.applicationStatus> })} className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-indigo-500">
              {applicationStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </article>)}{!items.length && <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-400">No applications</p>}</div>
        </section>;
      })}
    </div></div>
    {data.meta.total > 100 && <p className="text-xs text-amber-700">Showing the 100 most recent applications.</p>}
  </div>;
}
