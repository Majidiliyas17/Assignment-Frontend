'use client';

import { useState } from 'react';
import { Download, Maximize2, ShieldCheck, Lock } from 'lucide-react';
import { FileTypeIcon } from '@/components/ui/FileTypeIcon';
import { StatusBadge } from '@/components/ui/Badge';
import { downloadFromUrl } from '@/lib/download';
import { formatBytes, formatDate, isPreviewableImage, isPreviewableVideo } from '@/lib/format';
import type { FileView } from '@/types/api';

interface PublicFileViewProps {
  file: FileView;
  downloadUrl: string;
  previewUrl: string;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-content-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-content">{value}</dd>
    </div>
  );
}

export function PublicFileView({ file, downloadUrl, previewUrl }: PublicFileViewProps) {
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  const isImage = isPreviewableImage(file);
  const isVideo = isPreviewableVideo(file);
  const previewable = isImage || isVideo;
  return (
    <div className="bg-app flex min-h-screen flex-col bg-zinc-50">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow">
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-content">SecureFiles</span>
        </span>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:pt-16">
        <div className="w-full max-w-md">
          <div className="animate-slide-up rounded-2xl border border-zinc-200/80 bg-card p-6 shadow-card sm:p-8">
            <div className="flex justify-center">
              <FileTypeIcon extension={file.extension} className="h-14 w-14" iconClassName="h-7 w-7" />
            </div>

            <h1 className="mt-5 break-words text-center text-lg font-semibold tracking-tight text-content">{file.originalName}</h1>
            <p className="mt-1 text-center text-sm text-content-muted">Shared with you securely via SecureFiles.</p>

            {previewable && !previewUnavailable && (
              <div className="group relative mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                {isImage ? (
                  <img src={previewUrl} alt={file.originalName} onError={() => setPreviewUnavailable(true)} className="max-h-72 w-full object-contain" />
                ) : (
                  <video src={previewUrl} controls onError={() => setPreviewUnavailable(true)} className="max-h-72 w-full bg-black" aria-label={file.originalName} />
                )}
                <button type="button" onClick={() => setFullScreenPreview(true)} className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-100 hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100" aria-label="Open full-screen preview"><Maximize2 className="h-4 w-4" /></button>
              </div>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4">
              <MetaItem label="Size" value={formatBytes(file.size)} />
              <MetaItem label="Type" value={file.extension ? file.extension.toUpperCase() : 'FILE'} />
              <MetaItem label="Uploaded" value={formatDate(file.createdAt)} />
              <MetaItem label="Status" value="Ready" />
            </dl>

            <button
              type="button"
              onClick={() => void downloadFromUrl(downloadUrl, file.originalName)}
              className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-indigo-600 to-indigo-700 text-sm font-medium text-primary-foreground shadow-sm shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download file
            </button>

            <div className="mt-6 flex flex-col items-center gap-2">
              <StatusBadge status={file.status} />
              <p className="flex items-center gap-1.5 text-xs text-content-muted">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Anyone with this link can view this file.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-content-muted">
            Powered by <span className="font-medium text-content">SecureFiles</span> — private file storage.
          </p>
        </div>
      </main>
      {fullScreenPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={`Full-screen preview of ${file.originalName}`}>
          <button type="button" onClick={() => setFullScreenPreview(false)} className="absolute right-4 top-4 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20">Close</button>
          {isImage ? <img src={previewUrl} alt={file.originalName} className="max-h-full max-w-full object-contain" /> : <video src={previewUrl} controls autoPlay className="max-h-full max-w-full" aria-label={file.originalName} />}
        </div>
      )}
    </div>
  );
}
