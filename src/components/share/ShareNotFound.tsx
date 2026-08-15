import Link from 'next/link';
import { Home, ShieldCheck } from 'lucide-react';

export function ShareNotFound() {
  return (
    <div className="bg-app flex min-h-screen flex-col bg-zinc-50">
      <header className="flex h-16 items-center px-6">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-content">SecureFiles</span>
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md text-center">
          <p className="text-6xl font-semibold tracking-tight text-gradient">404</p>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-content">
            This link is no longer available
          </h1>
          <p className="mt-2 text-sm text-content-muted">
            The file may have been deleted, or its share link was revoked by the owner.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-indigo-600 to-indigo-700 px-5 text-sm font-medium text-primary-foreground shadow-sm shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98]"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go to SecureFiles
          </Link>
        </div>
      </main>
    </div>
  );
}