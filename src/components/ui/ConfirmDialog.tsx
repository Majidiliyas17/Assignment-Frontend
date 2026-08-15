'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  tone = 'danger',
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" className="flex-1 sm:flex-none" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} className="flex-1 sm:flex-none" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            tone === 'danger' ? 'bg-red-50 text-danger' : 'bg-indigo-50 text-primary',
          )}
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="text-sm text-content-muted">{description}</div>
      </div>
    </Modal>
  );
}