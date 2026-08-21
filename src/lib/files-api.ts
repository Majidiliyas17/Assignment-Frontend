import { http } from './http';
import type { FileView, PaginatedFiles, ShareResult, StorageUsage } from '@/types/api';

export interface ListFilesParams {
  page?: number;
  limit?: number;
}

export const filesApi = {
  list: (params: ListFilesParams = {}) =>
    http
      .get<{ data: PaginatedFiles }>('/files', { params: { page: 1, limit: 20, ...params } })
      .then((r) => r.data.data),

  usage: () => http.get<{ data: StorageUsage }>('/files/usage').then((r) => r.data.data),

  get: (id: string) => http.get<{ data: FileView }>(`/files/${id}`).then((r) => r.data.data),

  rename: (id: string, name: string) =>
    http.patch<{ data: FileView }>(`/files/${id}`, { name }).then((r) => r.data.data),

  remove: (id: string) => http.delete<{ data: null }>(`/files/${id}`).then((r) => r.data.data),

  previewUrl: (id: string) =>
    http.get<{ data: { url: string } }>(`/files/${id}/preview`).then((r) => r.data.data.url),

  setVisibility: (id: string, visibility: 'private' | 'public') =>
    http.patch<{ data: FileView }>(`/files/${id}/visibility`, { visibility }).then((r) => r.data.data),

  createShare: (id: string) =>
    http.post<{ data: ShareResult }>(`/files/${id}/share`).then((r) => r.data.data),

  revokeShare: (id: string) =>
    http.delete<{ data: FileView }>(`/files/${id}/share`).then((r) => r.data.data),
};