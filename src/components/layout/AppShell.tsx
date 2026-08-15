'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="bg-app flex min-h-screen flex-col bg-surface lg:flex-row">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
        <footer className="border-t border-white/10 bg-zinc-950">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-white">SecureFiles</span>
            </div>
            <p className="text-xs text-sidebar-muted">
              © {new Date().getFullYear()} SecureFiles. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}