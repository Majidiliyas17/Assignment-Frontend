import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'https://api.aspslai.com/api';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const res = await fetch(`${BACKEND}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(json, { status: res.status });
  }

  const accessToken = (json as { data?: { accessToken?: string } })?.data?.accessToken;
  const response = NextResponse.json(json, { status: res.status });
  if (accessToken) {
    response.cookies.set('sfs_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }
  return response;
}
