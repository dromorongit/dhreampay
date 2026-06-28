import { auth } from './lib/auth/authOptions';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request: NextRequest) {
  const session = await auth();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return;
  }

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = new URL('/login', request.url);
      return Response.redirect(url);
    }
  }

  return;
}