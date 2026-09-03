import { FileSearch, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { errorMessage } from '../services/api';

export function Login() {
  const { user, login, register } = useAuth();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false); const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
    <div className="flex items-center gap-2 text-xl font-bold"><FileSearch className="text-indigo-600" /> cvAnalyzer</div>
    <h1 className="mt-7 text-2xl font-bold">{creating ? 'Create your account' : 'Welcome back'}</h1><p className="mt-2 text-sm text-slate-500">{creating ? 'Keep your applications private and organized.' : 'Sign in to access your analyses.'}</p>
    <form className="mt-6 space-y-4" onSubmit={async (event) => { event.preventDefault(); setPending(true); setError(''); try { if (creating) await register(name, email, password); else await login(email, password); } catch (cause) { setError(errorMessage(cause)); } finally { setPending(false); } }}>
      {creating && <label className="block text-sm font-semibold text-slate-700">Name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label>}
      <label className="block text-sm font-semibold text-slate-700">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label>
      <label className="block text-sm font-semibold text-slate-700">Password<input required type="password" minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label>
      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{pending && <Loader2 className="animate-spin" size={17} />}{creating ? 'Create account' : 'Sign in'}</button>
    </form>
    <button onClick={() => { setCreating((value) => !value); setError(''); }} className="mt-5 w-full text-sm font-medium text-indigo-700 hover:underline">{creating ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
  </div></main>;
}
