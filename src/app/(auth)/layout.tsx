import Link from 'next/link';
import { FileLock2, ShieldCheck, UploadCloud, Link2, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const FEATURES = [
  { icon: UploadCloud, title: 'Secure uploads', text: 'Files upload directly to private cloud storage with signed, time-limited access.' },
  { icon: FileLock2, title: 'Private by default', text: 'Your files stay yours. Share only what you choose, with revocable links.' },
  { icon: Link2, title: 'Effortless sharing', text: 'One click creates a public link. Revoke it anytime with full control.' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-card">
      <aside className="bg-app relative hidden w-[45%] flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white lg:flex">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[rgba(79,70,229,0.35)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">SecureFiles</span>
        </Link>

        <div className="relative">
          <h1 className="max-w-md text-3xl font-semibold leading-snug tracking-tight">
            Private, secure file storage for people who care about their data.
          </h1>
          <ul className="mt-10 space-y-6">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="group flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 transition-colors group-hover:bg-white/15">
                  <feature.icon className="h-5 w-5 text-indigo-300" />
                </span>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/65">{feature.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-xs text-white/60">
              Files are encrypted in transit and signed uploads never expose your credentials.
            </p>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} SecureFiles. All rights reserved.</p>
        </div>
      </aside>

      <main className="bg-app relative flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:w-[55%] lg:px-10">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="animate-slide-up">{children}</div>
        </div>
      </main>
    </div>
  );
}