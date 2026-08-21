'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { filesApi } from '@/lib/files-api';
import type { AuthResult, SafeUser } from '@/types/api';

export const STORAGE_USAGE_KEY = ['storage-usage'] as const;

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      http.post<{ data: AuthResult }>('/auth/login', body).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string }) =>
      http.post<{ data: AuthResult }>('/auth/register', body).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => http.get<{ data: SafeUser }>('/auth/me').then((r) => r.data.data),
    retry: false,
    staleTime: 60_000,
  });
}

export function useStorageUsage() {
  return useQuery({
    queryKey: STORAGE_USAGE_KEY,
    queryFn: () => filesApi.usage(),
    staleTime: 30_000,
  });
}

export function refreshStorageUsage(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: STORAGE_USAGE_KEY });
  queryClient.invalidateQueries({ queryKey: ['me'] });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => http.post('/auth/logout'),
    onSuccess: async () => {
      queryClient.clear();
      window.location.assign('/login');
    },
  });
}