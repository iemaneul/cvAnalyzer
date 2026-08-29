import { ArrowLeft, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAnalysisComparison } from '../hooks/analyses';

function Delta({ label, value }: { label: string; value: number | null }) {
  const positive = value !== null && value > 0, negative = value !== null && value < 0;
  return <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-2 flex items-center gap-1 text-2xl font-bold ${positive ? 'text-emerald-700' : negative ? 'text-rose-700' : 'text-slate-700'}`}>
      {positive ? <TrendingUp size={20} /> : negative ? <TrendingDown size={20} /> : null}
      {value === null ? 'N/A' : `${value > 0 ? '+' : ''}${value} pts`}
    </p>
  </div>;
}

function ChangeList({ title, items, good }: { title: string; items: string[]; good: boolean }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4">
    <h3 className="font-semibold">{title}</h3>
    {items.length ? <div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item}
      className={`rounded-full px-3 py-1 text-sm ${good ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{item}</span>)}</div>
      : <p className="mt-3 text-sm text-slate-400">No changes</p>}
  </div>;
}

export function Comparison() {
  const { id, previousId } = useParams();
  const { data, isLoading, error } = useAnalysisComparison(id, previousId);
  if (isLoading) return <p>Comparing versions...</p>;
  if (error || !data) return <p className="text-rose-600">Unable to compare these analyses.</p>;
  return <div>
    <Link to={`/history/${id}`} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700"><ArrowLeft size={16} /> Back to analysis</Link>
    <h1 className="mt-4 text-3xl font-bold">Version comparison</h1>
    <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:justify-between">
      <div><small className="text-slate-400">Previous</small><p className="font-semibold">{data.previous.fileName}</p><strong>{data.previous.score}%</strong></div>
      <ArrowRight className="rotate-90 text-indigo-500 sm:rotate-0" />
      <div className="text-right"><small className="text-slate-400">Current</small><p className="font-semibold">{data.current.fileName}</p><strong>{data.current.score}%</strong></div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Delta label="Match score" value={data.deltas.score} /><Delta label="Evidence quality" value={data.deltas.evidenceQuality} />
      <Delta label="Experience alignment" value={data.deltas.experienceAlignment} /><Delta label="Resume structure" value={data.deltas.structure} />
      <Delta label="Qualifications" value={data.deltas.qualifications} /><Delta label="Competencies" value={data.deltas.competencies} />
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <ChangeList title="Newly matched skills" items={data.skills.newlyMatched} good />
      <ChangeList title="Resolved missing skills" items={data.skills.resolvedMissing} good />
      <ChangeList title="No longer matched" items={data.skills.noLongerMatched} good={false} />
      <ChangeList title="New missing skills" items={data.skills.newMissing} good={false} />
      <ChangeList title="Resolved structure issues" items={data.structure.resolvedIssues} good />
      <ChangeList title="New structure issues" items={data.structure.newIssues} good={false} />
    </div>
    <p className="mt-6 text-xs text-slate-400">Compare versions analyzed against equivalent job requirements for the most meaningful result.</p>
  </div>;
}

