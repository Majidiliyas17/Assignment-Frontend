'use client';

import { RefreshCw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VisibilityFilter = 'all' | 'private' | 'public';

const FILTERS: Array<{ value: VisibilityFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
];

interface FilesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: VisibilityFilter;
  onFilterChange: (value: VisibilityFilter) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function FilesToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onRefresh,
  refreshing,
}: FilesToolbarProps) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="relative w-full lg:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search files…"
          aria-label="Search files"
          className="input-focus h-9 w-full rounded-lg border border-zinc-300 bg-card pl-9 pr-3 text-sm text-content shadow-sm placeholder:text-zinc-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1 rounded-lg border border-zinc-200 bg-card p-1 sm:flex-none" role="group" aria-label="Filter by visibility">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              aria-pressed={filter === option.value}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none',
                filter === option.value ? 'bg-primary-soft text-primary' : 'text-content-muted hover:text-content',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex h-9 flex-none items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-card px-3 text-sm text-content-muted shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Refresh files"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} aria-hidden="true" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}