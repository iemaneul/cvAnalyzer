import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalyses } from '../hooks/analyses';
import { applicationStatuses, applicationStatusStyle } from '../application-status';
import type { Analysis } from '../types';

export function History() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [scoreRange, setScoreRange] = useState('all');
  const [status, setStatus] = useState<Analysis['applicationStatus'] | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const scoreFilters = scoreRange === 'excellent' ? { minScore: 75 }
    : scoreRange === 'moderate' ? { minScore: 50, maxScore: 74 }
      : scoreRange === 'low' ? { maxScore: 49 } : {};
  const filters = { search: deferredSearch || undefined, status: status === 'all' ? undefined : status, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, ...scoreFilters };
  const { data, isLoading, error } = useAnalyses(page, 10, filters);
  const hasFilters = Boolean(search || dateFrom || dateTo || scoreRange !== 'all' || status !== 'all');
  const resetFilters = () => { setSearch(''); setScoreRange('all'); setStatus('all'); setDateFrom(''); setDateTo(''); setPage(1); };
  return <div>
    <h1 className="text-3xl font-bold">Analysis history</h1>
    <p className="mt-2 text-slate-500">Review and compare your previous resume matches.</p>
    <div className="mt-7 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="relative lg:col-span-2">
          <span className="sr-only">Search by position or company</span>
          <Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} maxLength={120} placeholder="Search position or company..." className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </label>
        <select aria-label="Filter by score" value={scoreRange} onChange={(event) => { setScoreRange(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500">
          <option value="all">All scores</option><option value="excellent">75% and above</option><option value="moderate">50% to 74%</option><option value="low">Below 50%</option>
        </select>
        <select aria-label="Filter by application status" value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500">
          <option value="all">All stages</option>{applicationStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        {hasFilters && <button onClick={resetFilters} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><X size={16} /> Clear filters</button>}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 md:max-w-xl">
        <label className="text-sm font-medium text-slate-600">From<input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500" /></label>
        <label className="text-sm font-medium text-slate-600">To<input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500" /></label>
      </div>
    </div>
    <div className="mt-5 overflow-x-auto rounded-xl border bg-white">
      {isLoading ? <p className="p-6">Loading...</p> : error ? <p className="p-6 text-rose-600">Unable to load analyses.</p>
        : !data?.data.length ? <p className="p-10 text-center text-slate-500">{hasFilters ? 'No analyses match these filters.' : 'No analyses yet.'}</p>
          : <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="p-4">Position</th><th className="p-4">Company</th><th className="p-4">Stage</th><th className="p-4">Resume</th><th className="p-4">Score</th><th className="p-4">Date</th></tr></thead>
            <tbody>{data.data.map((item) => <tr key={item.id} className="border-t hover:bg-slate-50">
              <td className="p-4"><Link className="font-medium text-indigo-700" to={`/history/${item.id}`}>{item.jobTitle ?? 'Previous analysis'}</Link></td>
              <td className="p-4 text-slate-600">{item.company ?? '—'}</td>
              <td className="p-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${applicationStatusStyle[item.applicationStatus ?? 'planned']}`}>{applicationStatuses.find((status) => status.value === (item.applicationStatus ?? 'planned'))?.label}</span></td>
              <td className="p-4 text-slate-600">{item.fileName}</td>
              <td className="p-4 font-semibold">{item.score}%</td>
              <td className="p-4 text-slate-500">{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.createdAt))}</td>
            </tr>)}</tbody>
          </table>}
    </div>
    {data && data.meta.totalPages > 1 && <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-slate-500">Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} analyses</p>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border p-2 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={18} /></button>
        <button disabled={page >= data.meta.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border p-2 disabled:opacity-40" aria-label="Next page"><ChevronRight size={18} /></button>
      </div>
    </div>}
  </div>;
}
