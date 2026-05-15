import { type NextRequest, NextResponse } from 'next/server';

import { decrypt } from '@/lib/auth/session';

const publicRoutes = ['/login', '/signup'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  const isApiRoute = path.startsWith('/api/');
  const isPublicPage = path.startsWith('/e/');

  if (isApiRoute || isPublicPage) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
