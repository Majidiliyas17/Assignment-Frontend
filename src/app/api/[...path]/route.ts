import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.BACKEND_URL ?? 'https://api.aspslai.com/api';

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  const url = new URL(req.url);
  const token = (await cookies()).get('sfs_token')?.value;

  const target = `${BACKEND}/${path.join('/')}${url.search}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.json().catch(() => ({}));
    init.body = JSON.stringify(body);
  }

  const res = await fetch(target, init);

  const contentType = res.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    const buffer = Buffer.from(await res.arrayBuffer());
    return new NextResponse(new Uint8Array(buffer), {
      status: res.status,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Disposition': res.headers.get('content-disposition') ?? '',
      },
    });
  }

  const text = await res.text();
  let json: unknown;
  let isJson = false;
  try {
    json = text ? JSON.parse(text) : {};
    isJson = true;
  } catch {
    /* non-JSON payload passes through as text */
  }

  const response = isJson
    ? NextResponse.json(json, { status: res.status })
    : new NextResponse(text, { status: res.status });

  return response;
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
