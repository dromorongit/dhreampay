import { auth } from './lib/auth/authOptions';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*'
  ]
};