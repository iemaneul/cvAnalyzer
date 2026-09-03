import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-indigo-600" size={30} /></div>;
  return user ? children : <Navigate to="/login" replace />;
}
