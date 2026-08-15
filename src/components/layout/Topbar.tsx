'use client';

import { Menu, Search, UploadCloud } from 'lucide-react';
import { useUiStore } from '@/stores/ui';
import { ThemeToggle } from './ThemeToggle';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const openUpload = useUiStore((store) => store.setUploadOpen);
  const setCommandOpen = useUiStore((store) => store.setCommandOpen);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-zinc-950/90 px-3 backdrop-blur-md sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-sidebar-muted transition-colors hover:border-white/20 hover:bg-white/10 hover:text-sidebar-text sm:flex"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Jump to…</span>
        <kbd className="ml-6 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-muted">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="rounded-lg p-2 text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white sm:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <ThemeToggle variant="chrome" />

      <button
        type="button"
        onClick={() => openUpload(true)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-indigo-600 to-indigo-700 px-4 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 transition-all duration-150 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98]"
      >
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Upload</span>
      </button>
    </header>
  );
}