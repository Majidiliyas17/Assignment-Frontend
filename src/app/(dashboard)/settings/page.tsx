'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BadgeCheck, CircleDashed, Database, FileKey2, Globe2, HardDrive, Mail, ShieldCheck, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { http } from '@/lib/http';
import { useLogout, useMe, useStorageUsage } from '@/hooks/useAuth';
import { formatBytes } from '@/lib/format';

export default function SettingsPage() {
  const { data: user, isLoading } = useMe();
  const storage = useStorageUsage();
  const logout = useLogout();

  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => http.get<{ data: { status: string; database: string; responseTimeMs: number } }>('/health').then((r) => r.data.data),
    retry: false,
    staleTime: 60_000,
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-content sm:text-2xl">Settings</h1>
        <p className="mt-0.5 text-sm text-content-muted sm:mt-1">Manage your account and review service status.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card>
          <div className="border-b border-zinc-100 px-5 py-4">
            <h3 className="text-sm font-semibold tracking-tight text-content">Profile</h3>
          </div>
          <div className="space-y-4 p-5">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                    {user.name
                      .split(' ')
                      .map((part) => part[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-content">{user.name}</p>
                    <p className="text-xs text-content-muted">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <dl className="space-y-3 border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-content-muted" aria-hidden="true" />
                    <dt className="w-20 text-sm text-content-muted">Name</dt>
                    <dd className="min-w-0 flex-1 break-all text-sm text-content">{user.name}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-content-muted" aria-hidden="true" />
                    <dt className="w-20 text-sm text-content-muted">Email</dt>
                    <dd className="min-w-0 flex-1 break-all text-sm text-content">{user.email}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-4 w-4 text-success" aria-hidden="true" />
                    <dt className="w-20 text-sm text-content-muted">Status</dt>
                    <dd className="flex-1 text-sm text-content">Active</dd>
                  </div>
                </dl>
              </>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="border-b border-zinc-100 px-5 py-4">
            <h3 className="text-sm font-semibold tracking-tight text-content">Service status</h3>
          </div>
          <div className="space-y-4 p-5">
            {health.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : health.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-danger">
                Cannot reach the API. Check that the backend is running, then retry.
              </div>
            ) : health.data ? (
              <dl className="space-y-3">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-content-muted" aria-hidden="true" />
                  <dt className="w-28 text-sm text-content-muted">Database</dt>
                  <dd className="flex-1 text-sm capitalize text-content">{health.data.database}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <CircleDashed className="h-4 w-4 text-content-muted" aria-hidden="true" />
                  <dt className="w-28 text-sm text-content-muted">Response time</dt>
                  <dd className="flex-1 text-sm text-content">{health.data.responseTimeMs} ms</dd>
                </div>
                <div className="flex items-center gap-3">
                  <Globe2 className="h-4 w-4 text-content-muted" aria-hidden="true" />
                  <dt className="w-28 text-sm text-content-muted">Status</dt>
                  <dd className="flex-1 text-sm text-content">Operational</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </Card>
      </div>

      <Card id="storage-capacity" className="scroll-mt-24">
        <div className="border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-primary">
              <HardDrive className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-content">Storage capacity</h3>
              <p className="text-xs text-content-muted">Your current storage usage and remaining space.</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {storage.isLoading ? (
            <div className="space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-2 w-full" /></div>
          ) : storage.data ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <p className="text-lg font-semibold tabular-nums text-content">
                  {formatBytes(storage.data.usedBytes)} <span className="text-sm font-normal text-content-muted">of {formatBytes(storage.data.quotaBytes)} used</span>
                </p>
                <p className="text-sm font-medium text-content-muted">{formatBytes(storage.data.remainingBytes)} left</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${Math.min(100, Math.max(0, storage.data.percentUsed))}%` }} />
              </div>
              <p className="mt-2 text-xs text-content-muted">{Math.round(storage.data.percentUsed)}% of your capacity is in use.</p>
            </>
          ) : (
            <p className="text-sm text-content-muted">Storage information is unavailable right now.</p>
          )}
        </div>
      </Card>

      <Card className="border-red-100">
        <div className="flex flex-col gap-3 border-b border-red-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-danger">
              <FileKey2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-content">Security</h3>
              <p className="text-xs text-content-muted">Your session is secured with an HttpOnly cookie. Sign out to end this session.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              logout.mutate(undefined, {
                onError: () => toast.error('Could not sign out. Try again.'),
              })
            }
            disabled={logout.isPending}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-card px-4 text-sm font-medium text-danger transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
        <div className="flex items-start gap-2 px-5 py-4">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          <p className="text-sm text-content-muted">
            Files are stored privately on Cloudinary and accessed over HTTPS. Uploads use signed credentials that never expose your API secret.
          </p>
        </div>
      </Card>
    </div>
  );
}
