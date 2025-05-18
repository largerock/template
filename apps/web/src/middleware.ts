import {
  clerkMiddleware,
  createRouteMatcher
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define route matchers
const isAdminRoute = createRouteMatcher([
  '/admin(.*)'
]);
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/posts(.*)',
  '/profile(.*)',
]);
const requiresOrganization = createRouteMatcher([
  '/admin(.*)',
]);

interface CustomError extends Error {
  status?: number;
  digest?: string;
}

export default clerkMiddleware(async (auth, req) => {
  try {
    // Check authentication state
    const { userId } = await auth();

    // Handle protected routes - require sign in
    if (isProtectedRoute(req) && !userId) {
      // Redirect to sign-in page if not authenticated
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Only run protect() if we have a userId to prevent errors during sign-out
    if (isProtectedRoute(req) && userId) {
      await auth.protect();
    }

    // Check if route requires organization membership
    if (requiresOrganization(req)) {
      const { orgId } = await auth();
      if (!orgId) {
        // Redirect to organizations page if no organization is selected
        return NextResponse.redirect(new URL('/organizations', req.url));
      }
    }

    // Handle admin routes - require specific permissions
    if (isAdminRoute(req)) {
      const {
        orgRole, orgId
      } = await auth();
      if (orgRole !== 'org:admin' || orgId !== 'org_2vS8DQjynXVfTqjyG8YvL5U0eZn') {
        return NextResponse.redirect(new URL('/error?code=unauthorized', req.url));
      }
    }
  } catch (error: unknown) {
    console.error('Error in middleware:', error);
    const customError = error as CustomError;

    // If error is related to authentication (user not signed in)
    if (customError instanceof Error &&
        (customError.message?.includes('not signed in') || customError.status === 401)) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // For permission-related errors (unauthorized)
    if (customError instanceof Error &&
        (customError.message?.includes('permission') || customError.status === 403)) {
      return NextResponse.redirect(new URL('/error?code=unauthorized', req.url));
    }

    // For NEXT_NOT_FOUND errors
    if (customError instanceof Error &&
        (customError.digest === 'NEXT_NOT_FOUND' || customError.digest?.includes('404'))) {
      return NextResponse.redirect(new URL('/error?code=not_found', req.url));
    }

    // For any other errors
    return NextResponse.redirect(new URL('/error?code=server_error', req.url));
  }
});

// Middleware config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (SEO file)
     * - .swa/ (Azure SWA health check)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|\\.swa/).*)',
    '/(api|trpc)(.*)'
  ],
};