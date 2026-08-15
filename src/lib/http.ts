import axios from 'axios';
import type { ApiBody } from '@/types/api';

export const http = axios.create({
  baseURL: '/api',
  timeout: 30_000,
  withCredentials: true,
});

export interface ApiClientError {
  status?: number;
  code?: string;
  message: string;
}

export function extractApiError(err: unknown): ApiClientError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const body = err.response?.data as ApiBody<unknown> | undefined;
    const network = !err.response && err.code === 'ERR_NETWORK';
    return {
      status,
      code: body && 'error' in body ? body.error.code : 'ERR_NETWORK',
      message:
        body && 'message' in body && body.message
          ? body.message
          : network
            ? 'Cannot reach the server. Please check your connection.'
            : 'Something went wrong. Please try again.',
    };
  }
  if (err instanceof Error) {
    return { code: 'UNKNOWN', message: err.message || 'Something went wrong.' };
  }
  return { code: 'UNKNOWN', message: 'Something went wrong.' };
}

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      void fetch('/api/auth/logout', { method: 'POST' })
        .catch(() => undefined)
        .finally(() => {
          window.location.assign('/login');
        });
    }
    return Promise.reject(err);
  },
);