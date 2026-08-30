import { Eye, FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { Result } from '../components/Result';
import { useAnalyzeResume, useExtractResumeText } from '../hooks/analyses';
import { errorMessage } from '../services/api';

export function Home() {
  const [file, setFile] = useState<File>();
  const [job, setJob] = useState('');
  const [localError, setLocalError] = useState('');
  const analysis = useAnalyzeResume();
  const extraction = useExtractResumeText();

  const pick = (next?: File) => {
    setLocalError(''); extraction.reset(); analysis.reset();
    if (!next) return;
    if (next.type !== 'application/pdf' || !next.name.toLowerCase().endsWith('.pdf')) {
      setLocalError('The selected file must be a PDF.'); return;
    }
    if (next.size > 5 * 1024 * 1024) { setLocalError('Maximum file size is 5MB.'); return; }
    setFile(next);
  };
  const removeFile = () => { setFile(undefined); extraction.reset(); analysis.reset(); };
  const submit = () => { if (file) analysis.mutate({ file, jobDescription: job }); };
  const error = localError || (extraction.error ? errorMessage(extraction.error) : '') || (analysis.error ? errorMessage(analysis.error) : '');

  return <>
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">Smarter applications</p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">cvAnalyzer</h1>
      <p className="mx-auto mt-4 max-w-2xl text-slate-600">Compare your resume with a job description and discover how well your profile matches the role.</p>
    </div>
    <div className="mt-10 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
      <div>
        <label className="mb-2 block font-semibold">Upload your resume</label>
        {file ? <div className="flex min-h-56 items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-5">
          <div className="flex items-center gap-3 overflow-hidden"><FileText className="shrink-0 text-indigo-600" />
            <div className="truncate"><p className="truncate font-medium">{file.name}</p><p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
          </div>
          <button aria-label="Remove file" onClick={removeFile} className="rounded-full p-2 hover:bg-white"><X size={18} /></button>
        </div> : <label className="grid min-h-56 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-300 p-5 text-center hover:border-indigo-400 hover:bg-indigo-50/40">
          <div><UploadCloud className="mx-auto mb-3 text-indigo-600" size={34} /><p className="font-medium">Choose a resume</p><p className="mt-1 text-sm text-slate-500">PDF only · Maximum 5MB</p></div>
          <input className="hidden" type="file" accept="application/pdf,.pdf" onChange={(event) => pick(event.target.files?.[0])} />
        </label>}
      </div>
      <div>
        <div className="mb-2 flex justify-between"><label className="font-semibold">Job description</label><span className="text-xs text-slate-400">{job.length} characters</span></div>
        <textarea value={job} onChange={(event) => setJob(event.target.value)} placeholder="Paste the job description here..."
          className="min-h-56 w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      </div>
      <div className="md:col-span-2">
        {error && <p className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          <button disabled={!file || extraction.isPending} onClick={() => file && extraction.mutate(file)}
            className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-40">
            {extraction.isPending ? <Loader2 className="animate-spin" size={18} /> : <Eye size={18} />} Preview extracted text
          </button>
          <button disabled={!file || job.trim().length < 50 || analysis.isPending} onClick={submit}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
            {analysis.isPending ? <><Loader2 className="animate-spin" size={18} />Analyzing your resume...</> : 'Analyze Resume'}
          </button>
        </div>
        {job.length > 0 && job.trim().length < 50 && <p className="mt-2 text-center text-xs text-slate-400">Enter at least 50 characters.</p>}
      </div>
    </div>
    {extraction.data && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between"><div><h2 className="font-semibold">Extracted text preview</h2><p className="text-sm text-slate-500">Confirm that headings, columns, and content were read correctly before analyzing.</p></div><span className="text-xs text-slate-400">{extraction.data.characters} characters</span></div>
      <textarea readOnly value={extraction.data.text} className="min-h-72 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700" />
      <p className="mt-2 text-xs text-slate-400">This preview is returned temporarily and is not saved as an analysis.</p>
    </section>}
    {analysis.data && <Result analysis={analysis.data} />}
  </>;
}
