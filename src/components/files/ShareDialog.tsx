'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, ExternalLink, Link2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useCreateShare, useRevokeShare } from '@/hooks/useFiles';
import { extractApiError } from '@/lib/http';
import type { FileView } from '@/types/api';

interface ShareDialogProps {
  open: boolean;
  file: FileView | null;
  onClose: () => void;
}

function buildShareUrl(shareToken: string): string {
  if (typeof window === 'undefined') return `/s/${shareToken}`;
  return new URL(`/s/${shareToken}`, window.location.origin).toString();
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export function ShareDialog({ open, file, onClose }: ShareDialogProps) {
  const [link, setLink] = useState<string | null>(null);
  const [confirmingRevoke, setConfirmingRevoke] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();

  useEffect(() => {
    if (open && file) {
      setLink(file.shareToken ? buildShareUrl(file.shareToken) : null);
      setConfirmingRevoke(false);
      setError(null);
    }
  }, [open, file]);

  const handleCopy = async () => {
    if (!link) return;
    try {
      await copyToClipboard(link);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const handleCreate = async () => {
    if (!file) return;
    setError(null);
    try {
      const result = await createShare.mutateAsync(file.id);
      setLink(buildShareUrl(result.shareToken));
      toast.success('Share link created');
    } catch (err) {
      setError(extractApiError(err).message);
    }
  };

  const handleRevoke = async () => {
    if (!file || !link) return;
    setError(null);
    try {
      await revokeShare.mutateAsync(file.id);
      setLink(null);
      setConfirmingRevoke(false);
      toast.success('Link revoked');
    } catch (err) {
      setError(extractApiError(err).message);
    }
  };

  const busy = createShare.isPending || revokeShare.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share this file"
      description={file?.originalName}
    >
      {link ? (
        <div className="space-y-4">
          <p className="text-sm text-content-muted">
            Anyone with this link can view the file. Keep it private — anyone you share it with can open it.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2">
              <Link2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate text-sm text-content" title={link}>
                {link}
              </span>
            </div>
            <Button variant="outline" size="md" onClick={handleCopy} disabled={busy}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy
            </Button>
          </div>

          {confirmingRevoke ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-danger">Revoke this link? It will stop working immediately.</p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfirmingRevoke(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" loading={revokeShare.isPending} onClick={handleRevoke}>
                  Revoke link
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex-1" onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open link
              </Button>
              <Button
                variant="ghost"
                className="text-danger hover:bg-red-50 hover:text-danger"
                onClick={() => setConfirmingRevoke(true)}
                disabled={busy}
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                Revoke link
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-content-muted">
            No share link exists yet. Creating one makes this file public and generates a link that anyone with it can view.
          </p>
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}
          <Button className="w-full" onClick={handleCreate} loading={createShare.isPending} disabled={busy}>
            Create share link
          </Button>
        </div>
      )}
    </Modal>
  );
}