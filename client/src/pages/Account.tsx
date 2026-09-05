import { Check, KeyRound, Loader2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useAuth, type User } from '../auth';
import { api, errorMessage } from '../services/api';

export function Account() {
  const { user, updateSession } = useAuth();
  const [name, setName] = useState(user?.name ?? ''); const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [profilePending, setProfilePending] = useState(false); const [passwordPending, setPasswordPending] = useState(false);
  const [profileMessage, setProfileMessage] = useState(''); const [passwordMessage, setPasswordMessage] = useState('');

  return <div className="mx-auto max-w-3xl">
    <h1 className="text-3xl font-bold">Account settings</h1><p className="mt-2 text-slate-500">Manage your identity and password.</p>
    <form className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={async (event) => {
      event.preventDefault(); setProfilePending(true); setProfileMessage('');
      try { const { data } = await api.patch<{ data: { user: User; token: string } }>('/auth/profile', { name, email }); updateSession(data.data); setProfileMessage('Profile updated successfully.'); }
      catch (error) { setProfileMessage(errorMessage(error)); } finally { setProfilePending(false); }
    }}>
      <h2 className="flex items-center gap-2 text-lg font-semibold"><UserRound size={20} className="text-indigo-600" /> Profile</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label>
        <label className="text-sm font-semibold text-slate-700">Email<input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label>
      </div>
      {profileMessage && <p className={`mt-4 text-sm ${profileMessage.includes('successfully') ? 'text-emerald-700' : 'text-rose-700'}`}>{profileMessage}</p>}
      <button disabled={profilePending || name.trim().length < 2} className="mt-5 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white disabled:opacity-40">{profilePending ? <Loader2 className="animate-spin" size={17} /> : <Check size={17} />} Save profile</button>
    </form>

    <form className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={async (event) => {
      event.preventDefault(); setPasswordMessage('');
      if (newPassword !== confirmation) { setPasswordMessage('Password confirmation does not match.'); return; }
      setPasswordPending(true);
      try { await api.patch('/auth/password', { currentPassword, newPassword }); setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setPasswordMessage('Password updated successfully.'); }
      catch (error) { setPasswordMessage(errorMessage(error)); } finally { setPasswordPending(false); }
    }}>
      <h2 className="flex items-center gap-2 text-lg font-semibold"><KeyRound size={20} className="text-indigo-600" /> Change password</h2>
      <div className="mt-5 space-y-4">
        <label className="block text-sm font-semibold text-slate-700">Current password<input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">New password<input required type="password" minLength={8} maxLength={72} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label><label className="text-sm font-semibold text-slate-700">Confirm new password<input required type="password" minLength={8} maxLength={72} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500" /></label></div>
      </div>
      {passwordMessage && <p className={`mt-4 text-sm ${passwordMessage.includes('successfully') ? 'text-emerald-700' : 'text-rose-700'}`}>{passwordMessage}</p>}
      <button disabled={passwordPending || newPassword.length < 8} className="mt-5 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white disabled:opacity-40">{passwordPending ? <Loader2 className="animate-spin" size={17} /> : <KeyRound size={17} />} Update password</button>
    </form>
  </div>;
}
