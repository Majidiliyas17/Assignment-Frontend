import type { Metadata } from 'next';
import { apiGet, ApiError } from '@/lib/backend';
import { PublicFileView } from '@/components/share/PublicFileView';
import { ShareNotFound } from '@/components/share/ShareNotFound';
import type { PublicShareResult } from '@/types/api';

interface SharedFilePageProps {
  params: Promise<{ shareToken: string }>;
}

export async function generateMetadata({ params }: SharedFilePageProps): Promise<Metadata> {
  const { shareToken } = await params;
  try {
    const data = await apiGet<PublicShareResult>(`/share/${shareToken}`);
    return {
      title: data.file.originalName,
      description: `Shared file · ${data.file.extension.toUpperCase()} · ${data.file.size} bytes`,
    };
  } catch {
    return { title: 'File link unavailable' };
  }
}

export default async function SharedFilePage({ params }: SharedFilePageProps) {
  const { shareToken } = await params;

  try {
    const data = await apiGet<PublicShareResult>(`/share/${shareToken}`);
    return <PublicFileView file={data.file} downloadUrl={`/api/share/${shareToken}/download`} previewUrl={data.downloadUrl} />;
  } catch (err) {
    if (err instanceof ApiError && err.code === 'SHARE_NOT_FOUND') {
      return <ShareNotFound />;
    }
    throw err;
  }
}
