import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");
  const isPublicApi = req.nextUrl.pathname.startsWith("/api/");

  // Always allow auth API routes
  if (isApiAuth) return;

  // Redirect logged-in users away from login page
  if (isLoginPage && isLoggedIn) {
    return Response.redirect(new URL("/", req.url));
  }

  // Allow login page for non-authenticated users
  if (isLoginPage) return;

  // Allow API routes (they handle their own auth)
  if (isPublicApi) return;

  // Protect all other routes
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|icons|manifest|sw|apple-touch|.*\\.png$).*)"],
};
