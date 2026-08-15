import * as React from 'react';
import { cn } from '@/lib/utils';
import type { FileStatus, FileVisibility } from '@/types/api';

type BadgeTone = 'zinc' | 'emerald' | 'amber' | 'sky' | 'red';

const TONES: Record<BadgeTone, string> = {
  zinc: 'bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  sky: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
};

export function Badge({
  tone = 'zinc',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

export function VisibilityBadge({ visibility }: { visibility: FileVisibility }) {
  return (
    <Badge tone={visibility === 'public' ? 'emerald' : 'zinc'}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          visibility === 'public' ? 'bg-emerald-500' : 'bg-zinc-400',
        )}
        aria-hidden="true"
      />
      {visibility}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: FileStatus }) {
  const tone: BadgeTone = status === 'completed' ? 'emerald' : status === 'pending' ? 'amber' : 'red';
  const label = status === 'completed' ? 'Ready' : status === 'pending' ? 'Pending' : 'Failed';
  return <Badge tone={tone}>{label}</Badge>;
}