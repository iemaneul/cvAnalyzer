import { Award, BarChart3, BriefcaseBusiness, Building2, Loader2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalysisDashboard } from '../hooks/analyses';

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof BarChart3 }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><strong className="mt-2 block text-3xl text-slate-900">{value}</strong></div><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Icon size={22} /></span></div>
    <p className="mt-2 text-xs text-slate-400">{detail}</p>
  </article>;
}

function Ranking({ title, items, icon: Icon }: { title: string; items: Array<{ name: string; count: number }>; icon: typeof BriefcaseBusiness }) {
  const maximum = Math.max(...items.map((item) => item.count), 1);
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="flex items-center gap-2 font-semibold"><Icon size={19} className="text-indigo-600" /> {title}</h2>
    {items.length ? <div className="mt-5 space-y-4">{items.map((item) => <div key={item.name}>
      <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700">{item.name}</span><span className="text-slate-500">{item.count}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.count / maximum * 100}%` }} /></div>
    </div>)}</div> : <p className="mt-5 text-sm text-slate-400">Not enough information yet.</p>}
  </section>;
}

export function Dashboard() {
  const { data, isLoading, error } = useAnalysisDashboard();
  if (isLoading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={18} /> Loading dashboard...</div>;
  if (error || !data) return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">Unable to load dashboard.</p>;
  if (!data.summary.total) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
    <BarChart3 className="mx-auto text-indigo-500" size={38} /><h1 className="mt-4 text-2xl font-bold">Your dashboard starts with an analysis</h1><p className="mx-auto mt-2 max-w-md text-slate-500">Analyze a resume for a role to begin tracking your compatibility over time.</p><Link to="/" className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">Analyze a resume</Link>
  </div>;

  const points = data.trend.map((item, index) => ({
    ...item,
    x: data.trend.length === 1 ? 350 : 45 + index * (610 / (data.trend.length - 1)),
    y: 205 - item.score * 1.65,
  }));
  const improvement = data.summary.improvement;
  return <div>
    <h1 className="text-3xl font-bold">Progress dashboard</h1>
    <p className="mt-2 text-slate-500">Track how your resume matches evolve across applications.</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Total analyses" value={String(data.summary.total)} detail="Saved analyses" icon={BarChart3} />
      <Metric label="Average match" value={`${data.summary.averageScore}%`} detail="Across all applications" icon={TrendingUp} />
      <Metric label="Best match" value={`${data.summary.bestScore}%`} detail="Highest compatibility" icon={Award} />
      <Metric label="Overall change" value={`${improvement > 0 ? '+' : ''}${improvement} pts`} detail="First to latest analysis" icon={TrendingUp} />
    </div>

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">Match score evolution</h2><p className="mt-1 text-sm text-slate-500">Your latest {data.trend.length} saved analyses, from oldest to newest.</p></div>{data.bestAnalysis && <Link to={`/history/${data.bestAnalysis.id}`} className="text-sm font-medium text-indigo-700 hover:underline">View best analysis</Link>}</div>
      <div className="mt-5 overflow-x-auto"><svg viewBox="0 0 700 240" className="min-w-[650px]" role="img" aria-label="Line chart showing match score evolution">
        {[0, 25, 50, 75, 100].map((score) => { const y = 205 - score * 1.65; return <g key={score}><line x1="45" y1={y} x2="655" y2={y} stroke="#e2e8f0" strokeWidth="1" /><text x="8" y={y + 4} fill="#94a3b8" fontSize="11">{score}%</text></g>; })}
        {points.length > 1 && <polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((point) => <g key={point.id}><circle cx={point.x} cy={point.y} r="5" fill="#4f46e5"><title>{point.jobTitle ?? 'Previous analysis'}: {point.score}%</title></circle><text x={point.x} y={point.y - 11} textAnchor="middle" fill="#3730a3" fontSize="11" fontWeight="600">{point.score}%</text><text x={point.x} y="228" textAnchor="middle" fill="#64748b" fontSize="10">{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(point.createdAt))}</text></g>)}
      </svg></div>
    </section>

    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <Ranking title="Most analyzed positions" items={data.topJobTitles} icon={BriefcaseBusiness} />
      <Ranking title="Most analyzed companies" items={data.topCompanies} icon={Building2} />
    </div>
  </div>;
}
