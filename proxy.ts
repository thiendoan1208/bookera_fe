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

  // Check if accessing checkout page
  const isCheckoutRoute = request.nextUrl.pathname.startsWith("/checkout");
  const isAssistantRoute = request.nextUrl.pathname.startsWith("/assistant");
  const isSavedItemsRoute = request.nextUrl.pathname.startsWith(
    "/home/saved_items",
  );
  const paymentParam = request.nextUrl.searchParams.get("payment");

  // Protect checkout route - only allow with valid payment param
  if (isCheckoutRoute && !paymentParam) {
    return NextResponse.redirect(new URL("/home/marketplace", request.url));
  }

  // Protect assistant route - only allow authenticated users
  if (isAssistantRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect saved items route - only allow authenticated users
  if (isSavedItemsRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

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
