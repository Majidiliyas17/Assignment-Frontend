import { ShieldCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function AppLoading() {
  return (
    <div className="bg-app flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
        <ShieldCheck className="h-6 w-6 text-white" />
      </div>
      <p className="text-sm text-content-muted">Loading SecureFiles…</p>
      <Spinner className="h-4 w-4 text-primary" />
    </div>
  );
}