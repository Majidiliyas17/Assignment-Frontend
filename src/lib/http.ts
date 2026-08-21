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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function extractApiError(err: unknown): ApiClientError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const body = err.response?.data as unknown;
    const apiBody = isRecord(body) ? (body as unknown as ApiBody<unknown>) : undefined;
    const network = !err.response && err.code === 'ERR_NETWORK';
    return {
      status,
      code: apiBody && 'error' in apiBody ? apiBody.error.code : status === 503 ? 'SERVICE_UNAVAILABLE' : 'ERR_NETWORK',
      message:
        apiBody && 'message' in apiBody && apiBody.message
          ? apiBody.message
          : status === 503
            ? 'The server is temporarily unavailable. Please try again in a moment.'
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
