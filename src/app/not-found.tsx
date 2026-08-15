import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-app flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
        <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-content">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-content-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-600 to-indigo-700 px-5 text-sm font-medium text-primary-foreground shadow-sm shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98]"
      >
        Go to SecureFiles
      </Link>
    </div>
  );
}