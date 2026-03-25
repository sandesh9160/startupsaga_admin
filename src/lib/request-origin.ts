import type { NextRequest } from "next/server";

/**
 * Canonical public origin for redirects (login, logout, middleware) behind reverse proxies.
 * Prefer APP_URL / NEXT_PUBLIC_APP_URL when the proxy sends Host: localhost or wrong host.
 */
export function getPublicOrigin(request: Request | NextRequest): string {
  const envOrigin = getEnvCanonicalOrigin();
  if (envOrigin) {
    return envOrigin;
  }

  const headers = request.headers;
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost || headers.get("host");
  const forwardedProto = headers.get("x-forwarded-proto");
  const nextUrl =
    "nextUrl" in request && (request as NextRequest).nextUrl
      ? (request as NextRequest).nextUrl
      : null;

  let proto =
    forwardedProto ||
    (headers.get("x-forwarded-ssl") === "on" ? "https" : null) ||
    (nextUrl?.protocol === "https:" ? "https" : null);

  if (!proto && headers.get("x-forwarded-port") === "443") {
    proto = "https";
  }
  if (!proto) {
    proto = new URL(request.url).protocol === "https:" ? "https" : "http";
  }

  if (host) {
    return `${proto}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return nextUrl?.origin ?? new URL(request.url).origin;
}

function getEnvCanonicalOrigin(): string | null {
  const raw = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}
