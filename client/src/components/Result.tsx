import type { Analysis } from '../types';
import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const labels = (score: number) =>
  score >= 90 ? 'Excellent Match' : score >= 75 ? 'Good Match' : score >= 50 ? 'Moderate Match' : 'Low Match';

const importanceLabels = {
  required: 'Required',
  standard: 'Standard',
  preferred: 'Nice to have',
};

function Skills({ title, items, kind = 'neutral' }: {
  title: string; items: string[]; kind?: 'good' | 'bad' | 'neutral';
}) {
  const style = kind === 'good'
    ? 'bg-emerald-50 text-emerald-700'
    : kind === 'bad' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700';
  return <section>
    <h3 className="mb-3 font-semibold">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {items.length
        ? items.map((item) => <span key={item} className={`rounded-full px-3 py-1 text-sm ${style}`}>
            {kind === 'good' ? '✓ ' : kind === 'bad' ? '× ' : ''}{item}
          </span>)
        : <span className="text-sm text-slate-400">None detected</span>}
    </div>
  </section>;
}

function ActionPlan({ analysis }: { analysis: Analysis }) {
  const storageKey = `resume-analyzer:actions:${analysis.id}`;
  const [completed, setCompleted] = useState<string[]>(() => {
    if (analysis.isSaved === false) return [];
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '[]'); } catch { return []; }
  });
  useEffect(() => { if (analysis.isSaved !== false) localStorage.setItem(storageKey, JSON.stringify(completed)); }, [analysis.isSaved, completed, storageKey]);
  if (!analysis.actionPlan?.length) return null;
  const toggle = (id: string) => setCompleted((current) => current.includes(id)
    ? current.filter((item) => item !== id) : [...current, id]);
  const priorityStyle = {
    high: 'bg-rose-100 text-rose-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-slate-100 text-slate-600',
  };
  return <section>
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h3 className="font-semibold">Prioritized action plan</h3>
        <p className="mt-1 text-sm text-slate-500">Work from top to bottom and only include claims you can support.</p>
      </div>
      <span className="text-sm font-medium text-indigo-700">{completed.length}/{analysis.actionPlan.length} done</span>
    </div>
    <div className="space-y-3">
      {analysis.actionPlan.map((action) => {
        const done = completed.includes(action.id);
        return <label key={action.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:border-indigo-200'}`}>
          <input type="checkbox" checked={done} onChange={() => toggle(action.id)} className="mt-1 h-4 w-4 accent-indigo-600" />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <strong className={done ? 'text-slate-400 line-through' : 'text-slate-900'}>{action.title}</strong>
              <small className={`rounded-full px-2 py-0.5 font-semibold uppercase ${priorityStyle[action.priority]}`}>{action.priority}</small>
            </span>
            <span className={`mt-1 block text-sm ${done ? 'text-slate-400' : 'text-slate-600'}`}>{action.description}</span>
          </span>
        </label>;
      })}
    </div>
  </section>;
}

export function Result({ analysis }: { analysis: Analysis }) {
  const [downloading, setDownloading] = useState(false);
  const downloadReport = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/analyses/${analysis.id}/report`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url; link.download = `${analysis.fileName.replace(/\.pdf$/i, '')}-analysis.pdf`; link.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(false); }
  };
  return <div className="mt-10 space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    {analysis.jobTitle && <div className="border-b border-slate-100 pb-5">
      <h2 className="text-xl font-semibold text-slate-900">{analysis.jobTitle}</h2>
      {analysis.company && <p className="mt-1 text-sm font-medium text-indigo-700">{analysis.company}</p>}
      <p className="mt-1 text-xs text-slate-500">{analysis.fileName}</p>
    </div>}
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">{analysis.isSaved === false && <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Private analysis · not saved</span>}{analysis.extractionMethod === 'ocr' && <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">Scanned PDF · OCR</span>}</div>
      {analysis.isSaved !== false &&
      <button onClick={downloadReport} disabled={downloading} className="flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50">
        {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download PDF report
      </button>}
    </div>
    <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-7">
      <div className="grid h-32 w-32 place-items-center rounded-full"
        style={{ background: `conic-gradient(#4f46e5 ${analysis.score}%, #e2e8f0 0)` }}>
        <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
          <div><strong className="text-3xl">{analysis.score}%</strong><div className="text-xs text-slate-500">Weighted score</div></div>
        </div>
      </div>
      <p className="mt-3 font-semibold text-indigo-700">{labels(analysis.score)}</p>
      <p className="mt-1 text-center text-xs text-slate-400">Required skills have greater impact than optional skills.</p>
    </div>

    {analysis.scoreBreakdown && <section>
      <h3 className="mb-3 font-semibold">Score breakdown</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(importanceLabels) as Array<keyof typeof importanceLabels>).map((key) =>
          <div key={key} className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{importanceLabels[key]}</p>
            <p className="mt-1 text-2xl font-bold">{analysis.scoreBreakdown?.[key]}%</p>
          </div>)}
      </div>
    </section>}

    {analysis.evidenceQuality !== undefined && <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-indigo-950">Evidence quality</h3>
          <p className="mt-1 text-sm text-indigo-700">How strongly matched skills are demonstrated in experience or projects.</p>
        </div>
        <strong className="text-2xl text-indigo-700">{analysis.evidenceQuality}%</strong>
      </div>
    </section>}

    {analysis.structure && <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold">Resume structure</h3>
          <p className="mt-1 text-sm text-slate-500">Section coverage, contact links, length, and measurable outcomes.</p>
        </div>
        <strong className="text-xl text-indigo-700">{analysis.structure.score}%</strong>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3"><small className="text-slate-500">Words</small><p className="text-xl font-bold">{analysis.structure.wordCount}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><small className="text-slate-500">Estimated pages</small><p className="text-xl font-bold">{analysis.structure.estimatedPages}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><small className="text-slate-500">Bullets</small><p className="text-xl font-bold">{analysis.structure.bulletCount}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><small className="text-slate-500">Measured results</small><p className="text-xl font-bold">{analysis.structure.quantifiedAchievements}</p></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {analysis.structure.sections.map((section) => <span key={section.key}
          className={`rounded-full px-3 py-1 text-sm ${section.detected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {section.detected ? '✓' : '×'} {section.label}
        </span>)}
      </div>
      {analysis.structure.issues.length > 0 && <div className="mt-4 space-y-2">
        {analysis.structure.issues.map((issue) => <p key={issue.code}
          className={`rounded-lg p-3 text-sm ${issue.severity === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
          {issue.message}
        </p>)}
      </div>}
    </section>}

    {analysis.skillRequirements?.length ? <section>
      <h3 className="mb-3 font-semibold">Job requirements by priority</h3>
      <div className="flex flex-wrap gap-2">
        {analysis.skillRequirements.map((item) => <span key={item.skill}
          className={`rounded-lg border px-3 py-2 text-sm ${item.matched ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          {item.matched ? '✓' : '×'} {item.skill}
          <small className="ml-2 text-slate-500">{importanceLabels[item.importance]}</small>
          {item.yearsRequired ? <small className="ml-2 text-slate-500">{item.yearsRequired}+ years</small> : null}
        </span>)}
      </div>
    </section> : null}

    {analysis.experienceComparisons?.length ? <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold">Experience alignment</h3>
          <p className="mt-1 text-sm text-slate-500">Only explicitly stated durations are compared.</p>
        </div>
        <strong className="text-xl text-indigo-700">
          {analysis.experienceAlignment === null || analysis.experienceAlignment === undefined
            ? 'Not enough data' : `${analysis.experienceAlignment}%`}
        </strong>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        {analysis.experienceComparisons.map((item) => <div key={item.skill} className="flex items-center justify-between border-b border-slate-100 p-3 last:border-0">
          <span className="font-medium">{item.skill}</span>
          <span className={`text-sm ${item.status === 'met' ? 'text-emerald-700' : item.status === 'gap' ? 'text-rose-700' : 'text-amber-700'}`}>
            {item.resumeYears === null ? 'Duration not stated' : `${item.resumeYears} years documented`}
            {' / '}{item.requiredYears} required
          </span>
        </div>)}
      </div>
    </section> : null}

    <div className="grid gap-7 md:grid-cols-2">
      <Skills title="Matched Skills" items={analysis.matchedSkills} kind="good" />
      <Skills title="Missing Skills" items={analysis.missingSkills} kind="bad" />
      <Skills title="Resume Skills" items={analysis.resumeSkills} />
      <Skills title="Job Skills" items={analysis.jobSkills} />
    </div>

    {analysis.competencies && <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold">Professional competencies</h3>
          <p className="mt-1 text-sm text-slate-500">Leadership, collaboration, engineering, product, and process capabilities.</p>
        </div>
        <strong className="text-xl text-indigo-700">
          {analysis.competencies.alignment === null ? 'No requirements' : `${analysis.competencies.alignment}%`}
        </strong>
      </div>
      {analysis.competencies.requirements.length > 0 ? <div className="flex flex-wrap gap-2">
        {analysis.competencies.requirements.map((item) => <span key={item.competency}
          className={`rounded-lg border px-3 py-2 text-sm ${item.matched ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {item.matched ? '✓' : '×'} {item.competency}
          <small className="ml-2 text-slate-500">{importanceLabels[item.importance]}</small>
        </span>)}
      </div> : <p className="text-sm text-slate-400">No supported competency requirements were detected.</p>}
      {analysis.competencies.evidence.some((item) => item.excerpts.length) && <div className="mt-4 grid gap-3 md:grid-cols-2">
        {analysis.competencies.evidence.filter((item) => item.excerpts.length).map((item) => <details key={item.competency} className="rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-indigo-700">
            {item.competency}<small className="ml-2 font-normal capitalize text-slate-400">{item.category}</small>
          </summary>
          {item.excerpts.map((excerpt) => <blockquote key={excerpt} className="mt-2 border-l-2 border-indigo-200 pl-3 text-sm text-slate-600">“{excerpt}”</blockquote>)}
        </details>)}
      </div>}
    </section>}

    {analysis.evidence?.some((item) => item.excerpts.length) ? <section>
      <h3 className="mb-3 font-semibold">Evidence found in your resume</h3>
      <div className="space-y-3">
        {analysis.evidence.filter((item) => item.excerpts.length).map((item) =>
          <details key={item.skill} className="rounded-xl border border-slate-200 p-4">
            <summary className="cursor-pointer font-medium text-indigo-700">
              {item.skill}
              <small className="ml-2 font-normal capitalize text-slate-500">
                {item.section}{item.years ? ` · ${item.years} years` : ''} · strength {item.strength}%
              </small>
            </summary>
            {item.excerpts.map((excerpt) => <blockquote key={excerpt} className="mt-3 border-l-2 border-indigo-200 pl-3 text-sm text-slate-600">
              “{excerpt}”
            </blockquote>)}
          </details>)}
      </div>
    </section> : null}

    {analysis.qualifications && <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold">Qualifications</h3>
          <p className="mt-1 text-sm text-slate-500">Education, language proficiency, and certifications detected explicitly.</p>
        </div>
        <strong className="text-xl text-indigo-700">
          {analysis.qualifications.alignment === null ? 'No requirements' : `${analysis.qualifications.alignment}%`}
        </strong>
      </div>
      <div className="space-y-3 rounded-xl border border-slate-200 p-4">
        {(analysis.qualifications.education.required || analysis.qualifications.education.resume) && <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Education</p>
          <p className="mt-1 text-sm">
            Resume: {analysis.qualifications.education.resume?.level ?? 'Not detected'}
            {analysis.qualifications.education.required && <> · Required: {analysis.qualifications.education.required.level}</>}
          </p>
        </div>}
        {analysis.qualifications.languages.length > 0 && <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Languages required</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysis.qualifications.languages.map((item) => <span key={item.language}
              className={`rounded-lg px-3 py-2 text-sm ${item.status === 'met' ? 'bg-emerald-50 text-emerald-700' : item.status === 'unknown' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
              {item.language}: {item.resumeLevel ?? 'level not stated'} / {item.requiredLevel ?? 'any level'}
            </span>)}
          </div>
        </div>}
        {analysis.qualifications.certifications.length > 0 && <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Certifications required</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysis.qualifications.certifications.map((item) => <span key={item.certification}
              className={`rounded-lg px-3 py-2 text-sm ${item.status === 'met' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {item.status === 'met' ? '✓' : '×'} {item.certification}
            </span>)}
          </div>
        </div>}
        {!analysis.qualifications.education.required && !analysis.qualifications.education.resume &&
          analysis.qualifications.languages.length === 0 && analysis.qualifications.certifications.length === 0 &&
          <p className="text-sm text-slate-400">No supported qualifications were detected.</p>}
      </div>
    </section>}

    <ActionPlan analysis={analysis} />

    <section>
      <h3 className="mb-3 font-semibold">Suggestions</h3>
      <ul className="space-y-2 text-sm text-slate-600">
        {analysis.suggestions.map((item) => <li key={item} className="rounded-lg bg-indigo-50 p-3">{item}</li>)}
      </ul>
    </section>
    <p className="border-t pt-4 text-xs text-slate-400">
      This score measures textual alignment with detected requirements. It does not predict hiring decisions.
    </p>
  </div>;
}
