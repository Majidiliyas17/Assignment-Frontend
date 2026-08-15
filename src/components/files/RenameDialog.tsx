'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useRenameFile } from '@/hooks/useFiles';
import { extractApiError } from '@/lib/http';
import type { FileView } from '@/types/api';

interface RenameDialogProps {
  open: boolean;
  file: FileView | null;
  onClose: () => void;
}

export function RenameDialog({ open, file, onClose }: RenameDialogProps) {
  const [name, setName] = useState('');
  const rename = useRenameFile();

  useEffect(() => {
    if (open && file) {
      setName(file.originalName);
    }
  }, [open, file]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === file.originalName) {
      onClose();
      return;
    }
    try {
      await rename.mutateAsync({ id: file.id, name: trimmed });
      toast.success('File renamed');
      onClose();
    } catch (err) {
      toast.error('Rename failed', { description: extractApiError(err).message });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rename file"
      description="Choose a new name for this file."
      footer={
        <>
          <Button variant="ghost" className="flex-1 sm:flex-none" onClick={onClose} disabled={rename.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="rename-form" className="flex-1 sm:flex-none" loading={rename.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="rename-form" onSubmit={submit}>
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          placeholder="report.pdf"
        />
      </form>
    </Modal>
  );
}