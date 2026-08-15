'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import type { AuthResult, SafeUser } from '@/types/api';

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