'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FolderOpen, Search, Settings2, UploadCloud } from 'lucide-react';
import { FileTypeIcon } from '@/components/ui/FileTypeIcon';
import { useUiStore } from '@/stores/ui';
import { cn } from '@/lib/utils';
import type { FileView, PaginatedFiles } from '@/types/api';

interface PaletteAction {
  id: string;
  label: string;
  hint: string;
  file?: FileView;
  onSelect: () => void;
}

function IconFor({ action }: { action: PaletteAction }) {
  if (action.file) {
    return <FileTypeIcon extension={action.file.extension} iconClassName="h-4 w-4" />;
  }
  if (action.id === 'upload') return <UploadCloud className="h-4 w-4 text-primary" aria-hidden="true" />;
  if (action.id === 'settings') return <Settings2 className="h-4 w-4 text-content-muted" aria-hidden="true" />;
  return <FolderOpen className="h-4 w-4 text-primary" aria-hidden="true" />;
}

export function CommandPalette() {
  const open = useUiStore((store) => store.commandOpen);
  const setOpen = useUiStore((store) => store.setCommandOpen);
  const setUploadOpen = useUiStore((store) => store.setUploadOpen);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const files = useMemo<FileView[]>(() => {
    if (!open) return [];
    const result: FileView[] = [];
    for (const page of queryClient.getQueryCache().findAll({ queryKey: ['files'] })) {
      const data = page.state.data as PaginatedFiles | undefined;
      if (data) result.push(...data.files);
    }
    return result;
  }, [queryClient, open]);

  const actions = useMemo<PaletteAction[]>(() => {
    const needle = query.trim().toLowerCase();

    const base: PaletteAction[] = [
      {
        id: 'upload',
        label: 'Upload a file',
        hint: 'Action',
        onSelect: () => {
          setUploadOpen(true);
          setOpen(false);
        },
      },
      {
        id: 'files',
        label: 'Go to My Files',
        hint: 'Go to',
        onSelect: () => {
          router.push('/files');
          setOpen(false);
        },
      },
      {
        id: 'settings',
        label: 'Go to Settings',
        hint: 'Go to',
        onSelect: () => {
          router.push('/settings');
          setOpen(false);
        },
      },
    ];

    const matchingBase = base.filter((action) => action.label.toLowerCase().includes(needle));

    const matchingFiles = files
      .filter(
        (file) =>
          !needle ||
          file.originalName.toLowerCase().includes(needle) ||
          file.extension.toLowerCase().includes(needle),
      )
      .slice(0, 6)
      .map<PaletteAction>((file) => ({
        id: `file-${file.id}`,
        label: file.originalName,
        hint: 'File',
        file,
        onSelect: () => {
          router.push('/files');
          setOpen(false);
        },
      }));

    return [...matchingBase, ...matchingFiles];
  }, [query, files, router, setOpen, setUploadOpen]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive((current) => (current + 1) % Math.max(actions.length, 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive((current) => (current - 1 + Math.max(actions.length, 1)) % Math.max(actions.length, 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        actions[active]?.onSelect();
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, actions, active, setOpen]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] sm:pt-[12vh]">
      <div className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="animate-scale-in relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-card shadow-popover"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4">
          <Search className="h-4 w-4 text-content-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files or run a command…"
            className="h-12 w-full bg-transparent text-sm text-content placeholder:text-zinc-400 focus:outline-none"
            aria-label="Search files or commands"
          />
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-content-muted">
            ESC
          </kbd>
        </div>

        <ul className="max-h-72 overflow-y-auto py-1.5">
          {actions.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-content-muted">No results found.</li>
          ) : (
            actions.map((action, index) => (
              <li key={action.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={action.onSelect}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                    index === active ? 'bg-primary-soft text-primary' : 'text-content',
                  )}
                >
                  <IconFor action={action} />
                  <span className="min-w-0 flex-1 truncate">{action.label}</span>
                  <span className="text-xs text-content-muted">{action.hint}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>,
    document.body,
  );
}