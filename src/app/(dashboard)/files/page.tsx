'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FolderOpen, Globe2, Inbox, Lock, TriangleAlert, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { FileDetailDrawer } from '@/components/files/FileDetailDrawer';
import { FilesTable, type FileRowHandlers } from '@/components/files/FilesTable';
import { FilesToolbar, type VisibilityFilter } from '@/components/files/FilesToolbar';
import { PaginationBar } from '@/components/files/PaginationBar';
import { RenameDialog } from '@/components/files/RenameDialog';
import { ShareDialog } from '@/components/files/ShareDialog';
import { extractApiError } from '@/lib/http';
import { useFileStats, useFiles, useRemoveFile, useSetVisibility } from '@/hooks/useFiles';
import { useUiStore } from '@/stores/ui';
import { formatBytes } from '@/lib/format';
import type { FileView } from '@/types/api';

const PAGE_LIMIT = 10;

interface VisibilityTarget {
  file: FileView;
  target: 'private' | 'public';
}

function TableSkeleton() {
  return (
    <div className="space-y-0">
      <div className="hidden md:block">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-zinc-100 px-4 py-4 last:border-0">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="hidden h-3 w-16 sm:block" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="hidden h-3 w-12 lg:block" />
          </div>
        ))}
      </div>
      <div className="md:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 last:border-0">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FilesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<VisibilityFilter>('all');
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<FileView | null>(null);
  const [renameTarget, setRenameTarget] = useState<FileView | null>(null);
  const [shareTarget, setShareTarget] = useState<FileView | null>(null);
  const [visibilityTarget, setVisibilityTarget] = useState<VisibilityTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ file: FileView } | null>(null);

  const setUploadOpen = useUiStore((store) => store.setUploadOpen);

  const filesQuery = useFiles(page, PAGE_LIMIT);
  const removeFile = useRemoveFile();
  const setVisibility = useSetVisibility();

  const data = filesQuery.data;
  const files = data?.files ?? [];
  const pagination = data?.pagination;
  const stats = useFileStats();
  const statsData = stats.data ?? { totalCount: 0, publicCount: 0, totalSize: 0 };

  const filteredFiles = files.filter((file) => {
    const matchesFilter =
      filter === 'all' || file.visibility === filter;
    const needle = search.trim().toLowerCase();
    const matchesSearch =
      needle.length === 0 ||
      file.originalName.toLowerCase().includes(needle) ||
      file.extension.toLowerCase().includes(needle) ||
      file.resourceType.toLowerCase().includes(needle);
    return matchesFilter && matchesSearch;
  });

  const downloadFile = (file: FileView) => {
    const anchor = document.createElement('a');
    anchor.href = `/api/files/${file.id}/download`;
    anchor.download = file.originalName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const beginDelete = (file: FileView) => {
    setSelectedFile(null);
    setDeleteTarget({ file });
  };

  const handleDownload = downloadFile;

  const handleVisibilityChange = async () => {
    if (!visibilityTarget) return;
    try {
      const updated = await setVisibility.mutateAsync({
        id: visibilityTarget.file.id,
        visibility: visibilityTarget.target,
      });
      toast.success(`This file is now ${updated.visibility}`);
      setSelectedFile((current) => (current?.id === updated.id ? updated : current));
      setVisibilityTarget(null);
    } catch (err) {
      toast.error('Could not update visibility', { description: extractApiError(err).message });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeFile.mutateAsync(deleteTarget.file.id);
      toast.success('File deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Could not delete file', { description: extractApiError(err).message });
    }
  };

  const handlers: FileRowHandlers = {
    onInfo: setSelectedFile,
    onDownload: handleDownload,
    onRename: setRenameTarget,
    onShare: setShareTarget,
    onVisibility: (file) =>
      setVisibilityTarget({ file, target: file.visibility === 'public' ? 'private' : 'public' }),
    onDelete: beginDelete,
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibilityDescription =
    visibilityTarget?.target === 'public'
      ? 'Making this file public lets it be shared by link. No link is created until you use the Share action.'
      : 'Making this file private will revoke its existing share link immediately.';

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-content sm:text-2xl">My Files</h1>
          <p className="mt-0.5 text-sm text-content-muted sm:mt-1">Securely stored, private by default. Upload and share with confidence.</p>
        </div>
        <Button size="md" className="hidden sm:inline-flex" onClick={() => setUploadOpen(true)}>
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          Upload files
        </Button>
      </div>

      {statsData.totalCount > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-card p-2.5 shadow-card sm:p-4 sm:gap-3">
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-primary sm:flex sm:h-10 sm:w-10">
              <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight tabular-nums text-content sm:text-lg">{statsData.totalCount}</p>
              <p className="truncate text-[11px] text-content-muted sm:text-xs">Files</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-card p-2.5 shadow-card sm:p-4 sm:gap-3">
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-success sm:flex sm:h-10 sm:w-10">
              <Globe2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight tabular-nums text-content sm:text-lg">{statsData.publicCount}</p>
              <p className="truncate text-[11px] text-content-muted sm:text-xs">Public</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-card p-2.5 shadow-card sm:p-4 sm:gap-3">
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-warning sm:flex sm:h-10 sm:w-10">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight tabular-nums text-content sm:text-lg">{formatBytes(statsData.totalSize)}</p>
              <p className="truncate text-[11px] text-content-muted sm:text-xs">Storage</p>
            </div>
          </div>
        </div>
      )}

      <FilesToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        filter={filter}
        onFilterChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
        onRefresh={() => filesQuery.refetch()}
        refreshing={filesQuery.isFetching}
      />

      <Card>
        {filesQuery.isLoading ? (
          <TableSkeleton />
        ) : filesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-danger">
              <TriangleAlert className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="text-base font-semibold text-content">Couldn&apos;t load your files</h3>
            <p className="max-w-sm text-sm text-content-muted">
              {extractApiError(filesQuery.error).message}
            </p>
            <Button variant="outline" onClick={() => filesQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : files.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-7 w-7" aria-hidden="true" />}
            title="No files yet"
            description="Your secure storage is empty. Upload your first file to get started."
            action={
              <Button onClick={() => setUploadOpen(true)}>
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Upload your first file
              </Button>
            }
          />
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-7 w-7" aria-hidden="true" />}
            title="No matching files"
            description={
              search.trim()
                ? `Nothing matches "${search.trim()}". Try a different search or filter.`
                : 'No files match the selected visibility filter.'
            }
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <FilesTable files={filteredFiles} handlers={handlers} />
            <PaginationBar
              page={pagination?.page ?? page}
              totalPages={pagination?.totalPages ?? 1}
              total={pagination?.total ?? filteredFiles.length}
              limit={PAGE_LIMIT}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Card>

      <RenameDialog
        open={renameTarget !== null}
        file={renameTarget}
        onClose={() => setRenameTarget(null)}
      />

      <ShareDialog open={shareTarget !== null} file={shareTarget} onClose={() => setShareTarget(null)} />

      <ConfirmDialog
        open={visibilityTarget !== null}
        onClose={() => setVisibilityTarget(null)}
        title={visibilityTarget?.target === 'public' ? 'Make file public?' : 'Make file private?'}
        description={visibilityDescription}
        confirmLabel={visibilityTarget?.target === 'public' ? 'Make public' : 'Make private'}
        tone="primary"
        loading={setVisibility.isPending}
        onConfirm={handleVisibilityChange}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this file?"
        description={
          <span>
            Delete <span className="font-medium text-content">{deleteTarget?.file.originalName}</span>? This
            removes the file from storage and revokes any shared link. This action can&apos;t be undone.
          </span>
        }
        confirmLabel="Delete file"
        loading={removeFile.isPending}
        onConfirm={handleDelete}
      />

      {selectedFile && (
        <FileDetailDrawer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDownload={handleDownload}
          onRename={(file) => {
            setRenameTarget(file);
            setSelectedFile(null);
          }}
          onShare={(file) => {
            setShareTarget(file);
            setSelectedFile(null);
          }}
          onVisibility={(file) => {
            setVisibilityTarget({ file, target: file.visibility === 'public' ? 'private' : 'public' });
            setSelectedFile(null);
          }}
          onDelete={(file) => {
            setDeleteTarget({ file });
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}
