'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
  ariaLabel?: string;
  triggerClassName?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'end',
  side = 'bottom',
  ariaLabel,
  triggerClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={cn('rounded-md transition-colors', triggerClassName)}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'animate-scale-in absolute z-30 min-w-[180px] overflow-hidden rounded-lg border border-zinc-200 bg-card py-1 shadow-popover',
            side === 'bottom' ? 'mt-1' : 'bottom-full mb-1',
            side === 'top' && align === 'start' ? 'left-0' : '',
            side === 'top' && align === 'end' ? 'right-0' : '',
            side === 'bottom' && align === 'start' ? 'left-0' : '',
            side === 'bottom' && align === 'end' ? 'right-0' : '',
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                item.danger ? 'text-danger hover:bg-red-50' : 'text-content hover:bg-zinc-50',
                item.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {item.icon && <span className="shrink-0" aria-hidden="true">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}