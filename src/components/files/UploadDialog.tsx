'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, FilePlus2, FileWarning, Trash2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useUpload } from '@/hooks/useUpload';
import { useStorageUsage } from '@/hooks/useAuth';
import { extractApiError } from '@/lib/http';
import { formatBytes, getAcceptAttribute, MAX_FILE_SIZE_MB, validateUpload } from '@/lib/format';
import { useUiStore } from '@/stores/ui';
import { cn } from '@/lib/utils';

type ItemStatus = 'queued' | 'uploading' | 'done' | 'error';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: ItemStatus;
  error?: string;
}

let nextId = 0;

export function UploadDialog() {
  const open = useUiStore((store) => store.uploadOpen);
  const setUploadOpen = useUiStore((store) => store.setUploadOpen);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const running = useRef(false);
  const activeUploadId = useRef<string | null>(null);

  const storage = useStorageUsage();
  const storageFull = storage.data
    ? storage.data.remainingBytes <= 0 || storage.data.percentUsed >= 100
    : false;

  const upload = useUpload((percent) => {
    if (activeUploadId.current) {
      setItems((current) =>
        current.map((item) => (item.id === activeUploadId.current ? { ...item, progress: percent } : item)),
      );
    }
  });

  useEffect(() => {
    if (open) {
      setItems([]);
      setRejected([]);
      running.current = false;
      activeUploadId.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (running.current) return;
    const queued = items.find((item) => item.status === 'queued');
    if (!queued) {
      if (items.length > 0 && items.every((item) => item.status === 'done' || item.status === 'error')) {
        const succeeded = items.filter((item) => item.status === 'done').length;
        const failed = items.length - succeeded;
        if (succeeded > 0) toast.success(`${succeeded} file${succeeded > 1 ? 's' : ''} uploaded`);
        if (failed > 0) toast.error(`${failed} file${failed > 1 ? 's' : ''} failed to upload`);
      }
      return;
    }
    running.current = true;
    activeUploadId.current = queued.id;
    setItems((current) =>
      current.map((item) => (item.id === queued.id ? { ...item, status: 'uploading', progress: 2 } : item)),
    );

    upload
      .mutateAsync(queued.file)
      .then(() => {
        setItems((current) =>
          current.map((item) => (item.id === queued.id ? { ...item, status: 'done', progress: 100 } : item)),
        );
      })
      .catch((err) => {
        const apiError = extractApiError(err);
        const message =
          apiError.code === 'STORAGE_QUOTA_EXCEEDED'
            ? `Quota exceeded — "${queued.file.name}" not uploaded.`
            : apiError.message;
        setItems((current) =>
          current.map((item) =>
            item.id === queued.id ? { ...item, status: 'error', error: message } : item,
          ),
        );
      })
      .finally(() => {
        running.current = false;
        activeUploadId.current = null;
      });
  }, [items, open, upload]);

  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    if (storageFull) {
      setRejected((current) => [...current, 'Storage full — delete files to upload more']);
      return;
    }

    const accepted: File[] = [];
    const errors: string[] = [];
    const remainingBytes = storage.data?.remainingBytes;
    for (const file of incoming) {
      const result = validateUpload(file);
      if (result.valid) {
        if (remainingBytes !== undefined && file.size > remainingBytes) {
          errors.push(
            `"${file.name}" not uploaded — not enough storage. Only ${formatBytes(remainingBytes)} left.`,
          );
        } else {
          accepted.push(file);
        }
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      setRejected((current) => [...current, ...errors]);
    }
    if (accepted.length > 0) {
      setItems((current) => [
        ...current,
        ...accepted.map((file) => ({
          id: `upload-${nextId++}`,
          file,
          progress: 0,
          status: 'queued' as const,
        })),
      ]);
    }
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const anyRunning = items.some((item) => item.status === 'uploading' || item.status === 'queued');

  return (
    <Modal
      open={open}
      onClose={() => setUploadOpen(false)}
      title="Upload files"
      description={`Up to ${MAX_FILE_SIZE_MB} MB per file. Supported: images, PDFs, Office documents, spreadsheets, presentations, zip and mp4.`}
      size="lg"
      footer={
        <>
          {items.length > 0 && (
            <Button variant="outline" onClick={() => setItems([])} disabled={anyRunning}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear queue
            </Button>
          )}
          <Button variant="ghost" onClick={() => setUploadOpen(false)} disabled={anyRunning}>
            {anyRunning ? 'Uploading…' : 'Done'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!storageFull) inputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if (!storageFull && (event.key === 'Enter' || event.key === ' ')) inputRef.current?.click();
          }}
          onDragOver={(event) => {
            if (!storageFull) {
              event.preventDefault();
              setDragging(true);
            }
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          aria-disabled={storageFull}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
            storageFull
              ? 'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60'
              : dragging
                ? 'border-primary bg-primary-soft'
                : 'cursor-pointer border-zinc-300 bg-zinc-50 hover:border-primary-hover hover:bg-primary-soft',
          )}
        >
          {storageFull ? (
            <>
              <FileWarning className="h-8 w-8 text-warning" aria-hidden="true" />
              <p className="text-sm font-medium text-content">Storage is full</p>
              <p className="text-xs text-content-muted">Delete files to free up space before uploading.</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-content">Drag &amp; drop files here</p>
              <p className="text-xs text-content-muted">or click to browse your device</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={getAcceptAttribute()}
          disabled={storageFull}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = '';
          }}
          aria-hidden="true"
          tabIndex={-1}
        />

        {rejected.length > 0 && (
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                <div className="space-y-1">
                  {rejected.map((message, index) => (
                    <p key={index} className="text-sm text-content">
                      {message}
                    </p>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejected([])}
                className="rounded p-1 text-content-muted hover:text-content"
                aria-label="Dismiss unsupported file warnings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-zinc-200 bg-card p-3">
                <div className="flex items-center gap-3">
                  {item.status === 'done' ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-success">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  ) : item.status === 'error' ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-danger">
                      <FileWarning className="h-4 w-4" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-content" title={item.file.name}>
                        {item.file.name}
                      </p>
                      {item.status === 'queued' && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded p-1 text-content-muted hover:text-danger"
                          aria-label={`Remove ${item.file.name} from upload queue`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-content-muted">
                      {item.status === 'done'
                        ? 'Completed'
                        : item.status === 'error'
                          ? item.error
                          : item.status === 'uploading'
                            ? `${item.progress}% uploaded`
                            : 'Queued'}
                    </p>
                    {(item.status === 'queued' || item.status === 'uploading') && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-200"
                          style={{ width: `${item.status === 'queued' ? 0 : item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-xs text-content-muted">Nothing queued yet.</p>
        )}
      </div>
    </Modal>
  );
}