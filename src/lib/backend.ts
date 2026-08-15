import 'server-only';
import { cookies } from 'next/headers';

const BACKEND = process.env.BACKEND_URL ?? 'https://api.aspslai.com/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorResponse {
  success?: boolean;
  message?: string;
  error?: { code?: string };
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get('sfs_token')?.value;
  const res = await fetch(`${BACKEND}${path}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, 'UNKNOWN', 'Unexpected response from the server');
  }

  if (!res.ok) {
    const body = json as ErrorResponse;
    throw new ApiError(res.status, body.error?.code ?? 'UNKNOWN', body.message ?? 'Request failed');
  }

  const body = json as { data: T };
  return body.data as T;
}
