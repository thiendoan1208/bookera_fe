import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Get session token from cookies
  const token = request.cookies.get("session_token")?.value;

  // Define auth routes (login, signup)
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // If user has token (is authenticated)
  if (token) {
    // Don't allow access to login/signup pages
    if (isAuthRoute) {
      // Redirect to home page
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
