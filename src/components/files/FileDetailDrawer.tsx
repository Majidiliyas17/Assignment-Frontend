'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarClock,
  Download,
  ExternalLink,
  Globe,
  Link2,
  Pencil,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { Badge, StatusBadge, VisibilityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileTypeIcon } from '@/components/ui/FileTypeIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import { filesApi } from '@/lib/files-api';
import { extractApiError } from '@/lib/http';
import { formatBytes, formatDate, formatRelativeTime, isPreviewableImage } from '@/lib/format';
import type { FileView } from '@/types/api';

interface FileDetailDrawerProps {
  file: FileView;
  onClose: () => void;
  onDownload: (file: FileView) => void;
  onRename: (file: FileView) => void;
  onShare: (file: FileView) => void;
  onVisibility: (file: FileView) => void;
  onDelete: (file: FileView) => void;
}

function MetadataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 py-2.5 last:border-0">
      <dt className="text-sm text-content-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-content">{children}</dd>
    </div>
  );
}

export function FileDetailDrawer({
  file,
  onClose,
  onDownload,
  onRename,
  onShare,
  onVisibility,
  onDelete,
}: FileDetailDrawerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const isImage = isPreviewableImage(file);

  useEffect(() => {
    if (!isImage) return;
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(false);
    setPreviewUrl(null);

    const load = async () => {
      try {
        const url = await filesApi.previewUrl(file.id);
        if (!cancelled) {
          setPreviewUrl(url);
          setPreviewLoading(false);
        }
      } catch {
        if (!cancelled) {
          setPreviewError(true);
          setPreviewLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [file.id, isImage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-40">
      <div className="animate-fade-in absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="File details"
        className="animate-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-float"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <FileTypeIcon extension={file.extension} className="h-10 w-10" />
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold tracking-tight text-content" title={file.originalName}>
                {file.originalName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={file.status} />
                <VisibilityBadge visibility={file.visibility} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-content-muted transition-colors hover:bg-zinc-100 hover:text-content"
            aria-label="Close file details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {isImage && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              {previewLoading ? (
                <Skeleton className="h-52 w-full rounded-none" />
              ) : previewUrl ? (
                <img src={previewUrl} alt={file.originalName} className="h-auto max-h-72 w-full object-contain" />
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-content-muted">
                  {previewError ? 'Preview unavailable' : 'Loading preview…'}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
            <Button size="sm" onClick={() => onDownload(file)}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={() => onRename(file)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Rename
            </Button>
            <Button size="sm" variant="outline" onClick={() => onShare(file)}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </Button>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">Details</h3>
            <dl className="mt-2">
              <MetadataRow label="Size">{formatBytes(file.size)}</MetadataRow>
              <MetadataRow label="Type">
                {file.extension ? `${file.extension.toUpperCase()}` : '—'} · {file.mimeType}
              </MetadataRow>
              <MetadataRow label="Uploaded">{formatDate(file.createdAt)}</MetadataRow>
              <MetadataRow label="Modified">{formatRelativeTime(file.updatedAt)}</MetadataRow>
              <MetadataRow label="Storage">{file.resourceType}</MetadataRow>
            </dl>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">Sharing</h3>
            <div className="mt-2 rounded-xl border border-zinc-200 p-4">
              {file.shareToken ? (
                <div className="flex items-center gap-2.5">
                  <Badge tone="emerald" className="shrink-0">
                    <Link2 className="h-3 w-3" aria-hidden="true" />
                    Shared
                  </Badge>
                  <button
                    type="button"
                    onClick={() => onShare(file)}
                    className="group inline-flex min-w-0 items-center gap-1.5 text-sm text-primary hover:text-primary-hover"
                  >
                    <span className="truncate">/s/{file.shareToken.slice(0, 12)}…</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onShare(file)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  Create share link
                </button>
              )}
              <p className="mt-3 flex gap-1.5 text-xs text-content-muted">
                <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {file.visibility === 'public'
                  ? 'This file is public. Anyone with the link can view it.'
                  : 'This file is private. Only you can access it.'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">Danger zone</h3>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full border-red-200 text-danger hover:bg-red-50 hover:text-danger"
              onClick={() => onDelete(file)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete file
            </Button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}