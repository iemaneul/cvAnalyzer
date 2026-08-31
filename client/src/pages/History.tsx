import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalyses } from '../hooks/analyses';

export function History() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAnalyses(page, 10);
  return <div>
    <h1 className="text-3xl font-bold">Analysis history</h1>
    <p className="mt-2 text-slate-500">Review and compare your previous resume matches.</p>
    <div className="mt-7 overflow-hidden rounded-xl border bg-white">
      {isLoading ? <p className="p-6">Loading...</p> : error ? <p className="p-6 text-rose-600">Unable to load analyses.</p>
        : !data?.data.length ? <p className="p-10 text-center text-slate-500">No analyses yet.</p>
          : <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="p-4">Resume</th><th className="p-4">Score</th><th className="p-4">Date</th></tr></thead>
            <tbody>{data.data.map((item) => <tr key={item.id} className="border-t hover:bg-slate-50">
              <td className="p-4"><Link className="font-medium text-indigo-700" to={`/history/${item.id}`}>{item.fileName}</Link></td>
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
