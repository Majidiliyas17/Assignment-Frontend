'use client';

import {
  Download,
  Globe,
  Info,
  Link2,
  Lock,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react';
import { Badge, StatusBadge, VisibilityBadge } from '@/components/ui/Badge';
import { DropdownMenu, type DropdownItem } from '@/components/ui/DropdownMenu';
import { FileTypeIcon } from '@/components/ui/FileTypeIcon';
import { formatBytes, formatRelativeTime } from '@/lib/format';
import type { FileView } from '@/types/api';

export interface FileRowHandlers {
  onInfo: (file: FileView) => void;
  onDownload: (file: FileView) => void;
  onRename: (file: FileView) => void;
  onShare: (file: FileView) => void;
  onVisibility: (file: FileView) => void;
  onDelete: (file: FileView) => void;
}

function buildActions(file: FileView, handlers: FileRowHandlers): DropdownItem[] {
  return [
    { label: 'Info', icon: <Info className="h-4 w-4" aria-hidden="true" />, onSelect: () => handlers.onInfo(file) },
    { label: 'Download', icon: <Download className="h-4 w-4" aria-hidden="true" />, onSelect: () => handlers.onDownload(file) },
    { label: 'Rename', icon: <Pencil className="h-4 w-4" aria-hidden="true" />, onSelect: () => handlers.onRename(file) },
    { label: 'Share', icon: <Share2 className="h-4 w-4" aria-hidden="true" />, onSelect: () => handlers.onShare(file) },
    {
      label: file.visibility === 'public' ? 'Make private' : 'Make public',
      icon: file.visibility === 'public' ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Globe className="h-4 w-4" aria-hidden="true" />,
      onSelect: () => handlers.onVisibility(file),
    },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" aria-hidden="true" />, danger: true, onSelect: () => handlers.onDelete(file) },
  ];
}

interface FilesTableProps {
  files: FileView[];
  handlers: FileRowHandlers;
}

export function FilesTable({ files, handlers }: FilesTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-content-muted">
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 text-center font-medium" title="Shared link">
                <span className="sr-only">Shared</span>
                <Link2 className="mx-auto h-4 w-4" aria-hidden="true" />
              </th>
              <th className="px-4 py-3 font-medium">Modified</th>
              <th className="w-12 px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr
                key={file.id}
                onClick={() => handlers.onInfo(file)}
                className="group cursor-pointer border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileTypeIcon extension={file.extension} />
                    <div className="min-w-0">
                      <p className="max-w-[300px] truncate text-sm font-medium text-content" title={file.originalName}>
                        {file.originalName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-content-muted">{file.extension ? file.extension.toUpperCase() : 'FILE'}</span>
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-content-muted">{formatBytes(file.size)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={file.status} />
                </td>
                <td className="px-4 py-3">
                  <VisibilityBadge visibility={file.visibility} />
                </td>
                <td className="px-4 py-3 text-center">
                  {file.shareToken ? (
                    <Badge tone="emerald" className="gap-1">
                      <Link2 className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">Shared</span>
                    </Badge>
                  ) : (
                    <span className="text-content-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-content-muted">{formatRelativeTime(file.updatedAt)}</td>
                <td className="px-4 py-3 text-center" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu
                    ariaLabel={`Actions for ${file.originalName}`}
                    triggerClassName="text-content-muted hover:bg-zinc-100 hover:text-content"
                    trigger={
                      <span className="block p-1.5">
                        <MoreVertical className="h-4 w-4" />
                      </span>
                    }
                    items={buildActions(file, handlers)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-zinc-100 md:hidden">
        {files.map((file) => (
          <li key={file.id} className="relative">
            <button
              type="button"
              onClick={() => handlers.onInfo(file)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-zinc-50 sm:px-4"
            >
              <FileTypeIcon extension={file.extension} className="h-10 w-10 rounded-xl" iconClassName="h-5 w-5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-content">{file.originalName}</p>
                  {file.shareToken && <Link2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />}
                </div>
                <p className="mt-0.5 text-xs text-content-muted">
                  {formatBytes(file.size)} · {formatRelativeTime(file.updatedAt)}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <StatusBadge status={file.status} />
                  <VisibilityBadge visibility={file.visibility} />
                </div>
              </div>
            </button>
            <div className="absolute right-2 top-1/2 -translate-y-1/2" onClick={(event) => event.stopPropagation()}>
              <DropdownMenu
                ariaLabel={`Actions for ${file.originalName}`}
                side="top"
                triggerClassName="text-content-muted hover:bg-zinc-100 hover:text-content"
                trigger={
                  <span className="block p-2">
                    <MoreVertical className="h-4 w-4" />
                  </span>
                }
                items={buildActions(file, handlers)}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}