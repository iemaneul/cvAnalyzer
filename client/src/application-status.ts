import type { Analysis } from './types';

export const applicationStatuses: Array<{ value: NonNullable<Analysis['applicationStatus']>; label: string }> = [
  { value: 'planned', label: 'Planning to apply' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'closed', label: 'Closed' },
];

export const applicationStatusStyle: Record<NonNullable<Analysis['applicationStatus']>, string> = {
  planned: 'bg-slate-100 text-slate-700', applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700', offer: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-rose-100 text-rose-700',
};
