import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAccessApiPath,
  canAccessAppPath,
  isProtectedAppPath,
} from "@/lib/auth/rbac";
import { verifySessionToken } from "@/lib/auth/session-edge";

const SESSION_COOKIE = "nexus_session";
const BASE_PATH = "/cdpc-nexus";

function isAuthPage(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  );
}

function isOpenAuthApi(pathname: string) {
  const openPaths = [
    "/api/v1/auth/login",
    "/api/v1/auth/signup",
    "/api/v1/auth/signup/request-otp",
    "/api/v1/auth/google",
    "/api/v1/auth/google/callback",
    "/api/v1/auth/forgot-password/request-otp",
    "/api/v1/auth/forgot-password/reset",
  ];
  return openPaths.some((p) => pathname === p || pathname.startsWith(p));
}

function stripBasePath(pathname: string) {
  if (pathname === BASE_PATH) return "/";
  if (pathname.startsWith(`${BASE_PATH}/`)) {
    const stripped = pathname.slice(BASE_PATH.length);
    return stripped || "/";
  }
  return pathname;
}

function toPublicPath(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalized === "/") return BASE_PATH;
  if (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`)) {
    return normalized;
  }

  return `${BASE_PATH}${normalized}`;
}

function redirectTo(request: NextRequest, pathname: string) {
  return NextResponse.redirect(
    new URL(toPublicPath(pathname), request.nextUrl.origin),
    307
  );
}

function loginRedirect(request: NextRequest, requestPath: string) {
  const nextPath = stripBasePath(requestPath);
  const url = new URL(toPublicPath("/login"), request.nextUrl.origin);

  // Avoid next=/ on the root path
  if (nextPath !== "/") {
    url.searchParams.set("next", `${nextPath}${request.nextUrl.search}`);
  }

  return NextResponse.redirect(url, 307);
}

function unauthorizedRedirect(request: NextRequest, requestPath: string) {
  const url = new URL(toPublicPath("/unauthorized"), request.nextUrl.origin);
  url.searchParams.set("from", requestPath);
  return NextResponse.redirect(url, 307);
}

export async function proxy(request: NextRequest) {
  const rawPathname = request.nextUrl.pathname;
  const requestPath = stripBasePath(rawPathname);

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const claims = await verifySessionToken(sessionToken);
  const isAuthenticated = Boolean(claims?.userId);

  if (isAuthPage(requestPath)) {
    if (isAuthenticated) {
      const targetPath =
        claims?.role === "student" ? "/student/blogs" : "/companies";
      return redirectTo(request, targetPath);
    }
    return NextResponse.next();
  }

  if (requestPath === "/") {
    if (isAuthenticated) {
      const targetPath =
        claims?.role === "student" ? "/student/blogs" : "/companies";
      return redirectTo(request, targetPath);
    }
    return redirectTo(request, "/login");
  }

  if (requestPath.startsWith("/api/v1")) {
    if (isOpenAuthApi(requestPath)) {
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (!canAccessApiPath(requestPath, claims)) {
      return NextResponse.json(
        { error: { message: "Insufficient permissions" } },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  if (!isProtectedAppPath(requestPath)) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return loginRedirect(request, requestPath);
  }

  if (!canAccessAppPath(requestPath, claims)) {
    return unauthorizedRedirect(request, requestPath);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};