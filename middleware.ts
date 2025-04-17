// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path.startsWith('/login') || path.startsWith('/register');

  // Get the token from the cookies
  const token = request.cookies.get('accessToken')?.value || '';

  // If the path requires authentication and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is already logged in and tries to access login/register page, redirect to dashboard
  if (isPublicPath && token && (path.startsWith('/login') || path.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Specify which paths this middleware will run on
export const config = {
  matcher: ['/', '/login/:path*', '/register/:path*', '/dashboard/:path*'],
};