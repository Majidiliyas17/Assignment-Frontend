import { Archive, File, FileSpreadsheet, FileText, FileVideo2, Image, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileCategory = 'image' | 'video' | 'pdf' | 'document' | 'sheet' | 'presentation' | 'archive' | 'text' | 'generic';

const IMAGE = ['jpg', 'jpeg', 'png', 'webp'];
const VIDEO = ['mp4'];
const PDF = ['pdf'];
const DOCUMENT = ['doc', 'docx'];
const SHEET = ['xls', 'xlsx', 'csv'];
const PRESENTATION = ['ppt', 'pptx'];
const ARCHIVE = ['zip'];
const TEXT = ['txt'];

export function getFileCategory(extension: string): FileCategory {
  const ext = extension.toLowerCase();
  if (IMAGE.includes(ext)) return 'image';
  if (VIDEO.includes(ext)) return 'video';
  if (PDF.includes(ext)) return 'pdf';
  if (DOCUMENT.includes(ext)) return 'document';
  if (SHEET.includes(ext)) return 'sheet';
  if (PRESENTATION.includes(ext)) return 'presentation';
  if (ARCHIVE.includes(ext)) return 'archive';
  if (TEXT.includes(ext)) return 'text';
  return 'generic';
}

const CATEGORY_STYLE: Record<FileCategory, string> = {
  image: 'bg-sky-50 text-sky-600',
  video: 'bg-violet-50 text-violet-600',
  pdf: 'bg-red-50 text-red-600',
  document: 'bg-blue-50 text-blue-600',
  sheet: 'bg-emerald-50 text-emerald-600',
  presentation: 'bg-amber-50 text-amber-600',
  archive: 'bg-zinc-100 text-zinc-600',
  text: 'bg-zinc-100 text-zinc-600',
  generic: 'bg-zinc-100 text-zinc-500',
};

const CATEGORY_ICON: Record<FileCategory, typeof File> = {
  image: Image,
  video: FileVideo2,
  pdf: FileText,
  document: FileText,
  sheet: FileSpreadsheet,
  presentation: Presentation,
  archive: Archive,
  text: FileText,
  generic: File,
};

export function FileTypeIcon({
  extension,
  className,
  iconClassName,
}: {
  extension: string;
  className?: string;
  iconClassName?: string;
}) {
  const category = getFileCategory(extension);
  const Icon = CATEGORY_ICON[category];
  return (
    <span
      className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', CATEGORY_STYLE[category], className)}
      aria-hidden="true"
    >
      <Icon className={cn('h-5 w-5', iconClassName)} />
    </span>
  );
}