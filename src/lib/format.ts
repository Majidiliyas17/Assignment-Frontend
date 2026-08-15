const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value >= 100 || i === 0 ? Math.round(value) : value.toFixed(1)} ${UNITS[i]}`;
}

export function formatDate(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

const DIVISIONS: Array<{ amount: number; name: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
];

export function formatRelativeTime(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  let duration = (date.getTime() - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
  return formatDate(date);
}

export function isPreviewableImage(file: {
  mimeType: string;
  resourceType: string;
  extension: string;
}): boolean {
  return file.resourceType === 'image' && /^image\//.test(file.mimeType);
}

export function extensionToLabel(extension: string): string {
  return extension ? extension.toUpperCase() : 'FILE';
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'mp4'];
const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'com', 'sh', 'php', 'jsp', 'asp', 'aspx', 'msi', 'scr',
  'jar', 'vbs', 'ps1', 'wsf', 'cgi', 'pl', 'py', 'html', 'htm', 'svg', 'js', 'mjs',
];

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
export const MAX_FILE_SIZE_MB = 500;

export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0) return '';
  return filename.slice(dot + 1).toLowerCase();
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUpload(file: File): UploadValidationResult {
  const ext = getExtension(file.name);
  if (!ext) {
    return { valid: false, error: 'Files must have a file extension.' };
  }
  if (DANGEROUS_EXTENSIONS.includes(ext) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `'.${ext}' files are not allowed.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds the maximum allowed size of ${MAX_FILE_SIZE_MB} MB.` };
  }
  return { valid: true };
}

export function getAcceptAttribute(): string {
  return ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',');
}