import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isProtectedRoute = 
    (path.startsWith('/admin') && path !== '/admin/login') ||
    (path.startsWith('/agent') && path !== '/agent/login') ||
    path.startsWith('/dashboard');

  if (isProtectedRoute) {
    // We check for the refresh_token cookie which is set by the backend upon login.
    // If it's missing, the user is definitely unauthenticated.
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      let loginUrl = '/login';
      if (path.startsWith('/admin')) loginUrl = '/admin/login';
      else if (path.startsWith('/agent')) loginUrl = '/agent/login';

      const url = new URL(loginUrl, request.url);
      url.searchParams.set('redirect', encodeURIComponent(path));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Only run middleware on protected routes to optimize performance
export const config = {
  matcher: [
    '/admin/:path*',
    '/agent/:path*',
    '/dashboard/:path*',
  ],
};
