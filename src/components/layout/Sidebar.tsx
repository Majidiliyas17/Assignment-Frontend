'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderOpen, PanelLeftClose, PanelLeftOpen, ShieldCheck, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';

const NAV_ITEMS = [
  { href: '/files', label: 'My Files', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="animate-fade-in fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[45%] min-w-[190px] max-w-[300px] shrink-0 flex-col bg-sidebar text-sidebar-text transition-all duration-300 ease-in-out lg:static lg:w-72 lg:min-w-0 lg:max-w-none',
          collapsed ? 'lg:w-[4.5rem]' : 'lg:w-72',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" aria-hidden="true" />

        <div className="relative flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 lg:h-16">
          <Link
            href="/files"
            onClick={onClose}
            className={cn('flex min-w-0 items-center gap-2.5', collapsed && 'lg:hidden')}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
              <ShieldCheck className="h-5 w-5 text-white" />
            </span>
            <span className={cn('truncate text-base font-semibold tracking-tight text-sidebar-text', collapsed && 'lg:hidden')}>SecureFiles</span>
          </Link>

          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              'hidden items-center gap-2 rounded-lg text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white',
              collapsed ? 'lg:flex lg:flex-1 lg:justify-center lg:p-1.5' : 'lg:inline-flex lg:px-2 lg:py-1.5',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md p-1.5 text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="relative min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p
            className={cn(
              'px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted',
              collapsed && 'lg:px-0 lg:text-center',
            )}
          >
            <span className={cn(collapsed && 'lg:hidden')}>Menu</span>
          </p>
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === '/files' ? pathname === '/files' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  collapsed && 'lg:justify-center lg:px-0',
                  active
                    ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-sidebar-text ring-1 ring-inset ring-indigo-400/30'
                    : 'text-sidebar-muted hover:bg-black/5 hover:text-sidebar-text dark:hover:bg-white/5',
                )}
              >
                <item.icon
                  className={cn('h-4.5 w-4.5 shrink-0 transition-colors', active ? 'text-indigo-300' : 'text-sidebar-muted group-hover:text-sidebar-text')}
                  aria-hidden="true"
                />
                <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
                {active && (
                  <span className={cn('ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400', collapsed && 'lg:hidden')} aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="relative shrink-0 border-t border-white/10 p-2.5 lg:p-3">
          <UserMenu collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
