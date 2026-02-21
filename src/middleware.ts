import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const session = request.cookies.get("sessionid")?.value;
    const { pathname } = request.nextUrl;

    // 1. Protected routes (Dashboard)
    if (pathname.startsWith("/dashboard")) {
        if (!session) {
            // No token, redirect to login
            const url = new URL("/admin", request.url);
            return NextResponse.redirect(url);
        }
    }

    // 2. Prevent logged in users from visiting login page
    if (pathname === "/admin") {
        if (session) {
            const url = new URL("/dashboard", request.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/dashboard/:path*", "/admin"],
};
