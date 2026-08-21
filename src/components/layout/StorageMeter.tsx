'use client';

import { HardDrive, TriangleAlert } from 'lucide-react';
import { useStorageUsage } from '@/hooks/useAuth';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/utils';

interface StorageMeterProps {
  collapsed?: boolean;
}

export function StorageMeter({ collapsed = false }: StorageMeterProps) {
  const { data } = useStorageUsage();

  const used = data?.usedBytes ?? 0;
  const quota = data?.quotaBytes ?? 0;
  const remaining = data?.remainingBytes ?? 0;
  const rawPct = data ? Math.min(100, Math.max(0, data.percentUsed)) : 0;
  const low = remaining <= 0 || rawPct >= 100;
  const warn = !low && rawPct >= 80;

  const barColor = low ? 'bg-red-500' : warn ? 'bg-amber-400' : 'bg-indigo-500';

  if (collapsed) {
    return (
      <div className="mb-2 flex justify-center" title={data ? `${formatBytes(used)} used · ${formatBytes(remaining)} left` : 'Storage'}>
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            low
              ? 'bg-red-500/10 text-red-400'
              : warn
                ? 'bg-amber-400/10 text-amber-400'
                : 'bg-white/5 text-sidebar-muted',
          )}
        >
          {low ? <TriangleAlert className="h-4 w-4" aria-hidden="true" /> : <HardDrive className="h-4 w-4" aria-hidden="true" />}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mb-2 rounded-lg border px-3 py-2.5',
        low ? 'border-red-500/20 bg-red-500/5' : warn ? 'border-amber-400/20 bg-amber-400/5' : 'border-white/10 bg-white/5',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
          <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
          Storage
        </span>
        <span className={cn('text-[11px] tabular-nums', low ? 'text-red-400' : warn ? 'text-amber-400' : 'text-sidebar-text')}>
          {formatBytes(used)} / {formatBytes(quota)} used
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full transition-[width] duration-300', barColor)}
          style={{ width: `${rawPct}%` }}
        />
      </div>
      <p className={cn('mt-1.5 flex items-center gap-1 truncate text-[11px]', low ? 'text-red-400' : 'text-sidebar-muted')}>
        {low ? (
          <>
            <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
            Storage full — delete files to upload more
          </>
        ) : (
          <>You&apos;ve used {rawPct}% of your storage · {formatBytes(remaining)} left</>
        )}
      </p>
    </div>
  );
}