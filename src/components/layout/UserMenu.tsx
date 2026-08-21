'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLogout, useMe } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  const initials = user
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <DropdownMenu
      align="start"
      side="top"
      ariaLabel="User menu"
      triggerClassName="w-full rounded-lg hover:bg-white/5"
      trigger={
        <span className={cn('flex w-full items-center gap-3 rounded-lg p-2', collapsed && 'lg:justify-center lg:p-1.5')}>
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <span className={cn('flex-1 space-y-1.5 text-left', collapsed && 'lg:hidden')}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </span>
            </>
          ) : user ? (
            <>
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                {initials}
              </span>
              <span className={cn('min-w-0 flex-1 text-left', collapsed && 'lg:hidden')}>
                <span className="block truncate text-sm font-medium text-sidebar-text">{user.name}</span>
                <span className="block truncate text-xs text-sidebar-muted">{user.email}</span>
              </span>
              <ChevronsUpDown className={cn('h-4 w-4 shrink-0 text-sidebar-muted', collapsed && 'lg:hidden')} aria-hidden="true" />
            </>
          ) : null}
        </span>
      }
      items={[
        {
          label: 'Sign out',
          icon: <LogOut className="h-4 w-4" aria-hidden="true" />,
          onSelect: () => logout.mutate(),
        },
      ]}
    />
  );
}
