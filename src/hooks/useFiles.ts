'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { filesApi } from '@/lib/files-api';
import { refreshStorageUsage } from '@/hooks/useAuth';
import type { FileView, PaginatedFiles } from '@/types/api';

export function useFiles(page: number, limit: number) {
  return useQuery({
    queryKey: ['files', page, limit],
    queryFn: () => filesApi.list({ page, limit }),
    placeholderData: keepPreviousData,
  });
}

export interface FileStats {
  totalCount: number;
  publicCount: number;
  totalSize: number;
}

export function useFileStats(enabled = true) {
  return useQuery({
    queryKey: ['file-stats'],
    queryFn: async (): Promise<FileStats> => {
      const PAGE_SIZE = 100;
      const files: FileView[] = [];
      let page = 1;
      let total = Number.POSITIVE_INFINITY;
      while (files.length < total && page <= 100) {
        const data = await filesApi.list({ page, limit: PAGE_SIZE });
        files.push(...data.files);
        total = data.pagination.total;
        if (data.files.length === 0) break;
        page += 1;
      }
      return {
        totalCount: total,
        publicCount: files.filter((file) => file.visibility === 'public').length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
      };
    },
    staleTime: 60_000,
    enabled,
  });
}

function findFileListKeys(queryClient: ReturnType<typeof useQueryClient>): Array<readonly unknown[]> {
  return queryClient
    .getQueryCache()
    .findAll({ queryKey: ['files'] })
    .map((query) => query.queryKey);
}

function patchAllPages<F extends (file: FileView) => FileView>(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: F,
) {
  for (const key of findFileListKeys(queryClient)) {
    queryClient.setQueryData<PaginatedFiles>(key, (old) => {
      if (!old) return old;
      return {
        ...old,
        files: old.files.map((file) => updater(file)),
      };
    });
  }
}

export function useRenameFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => filesApi.rename(id, name),
    onMutate: async ({ id, name }) => {
      const keys = findFileListKeys(queryClient);
      const snapshot = keys.map((key) => [key, queryClient.getQueryData<PaginatedFiles>(key)] as const);
      await queryClient.cancelQueries({ queryKey: ['files'] });
      patchAllPages(queryClient, (file) => (file.id === id ? { ...file, originalName: name } : file));
      return { snapshot };
    },
    onError: (_error, _vars, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useRemoveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.remove(id),
    onMutate: async (id) => {
      const keys = findFileListKeys(queryClient);
      const snapshot = keys.map((key) => [key, queryClient.getQueryData<PaginatedFiles>(key)] as const);
      await queryClient.cancelQueries({ queryKey: ['files'] });
      for (const key of keys) {
        queryClient.setQueryData<PaginatedFiles>(key, (old) =>
          old ? { ...old, files: old.files.filter((file) => file.id !== id) } : old,
        );
      }
      return { snapshot };
    },
    onError: (_error, _vars, context) => {
      if (context?.snapshot) {
        for (const [key, data] of context.snapshot) queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file-stats'] });
      refreshStorageUsage(queryClient);
    },
  });
}

export function useSetVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: 'private' | 'public' }) =>
      filesApi.setVisibility(id, visibility),
    onSuccess: (file) => {
      patchAllPages(queryClient, (current) => (current.id === file.id ? file : current));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file-stats'] });
    },
  });
}

export function useCreateShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.createShare(id),
    onSuccess: (result) => {
      patchAllPages(queryClient, (current) => (current.id === result.file.id ? result.file : current));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useRevokeShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.revokeShare(id),
    onSuccess: (file) => {
      patchAllPages(queryClient, (current) => (current.id === file.id ? file : current));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}
