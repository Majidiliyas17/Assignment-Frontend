import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PREFIXES = ['/login', '/register', '/s/', '/api/'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('sfs_token')?.value;
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!token && !isPublic) {
    const login = new URL('/login', req.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};