import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getPublicOrigin } from "@/lib/request-origin";

export async function GET(request: Request) {
    // Call backend to invalidate session
    try {
        // Try to get cookies from the incoming request to pass them to backend
        const cookieHeader = request.headers.get("cookie");

        await fetch(`${API_BASE_URL}/session-logout/`, {
            method: "POST",
            headers: {
                "Cookie": cookieHeader || "",
                "Content-Type": "application/json",
            },
        });
    } catch (e: any) {
        console.error("Backend logout failed:", e.message);
    }

    const baseUrl = getPublicOrigin(request);

    // Redirect to login page
    const response = NextResponse.redirect(new URL("/admin", baseUrl));

    // Clear cookies
    response.cookies.delete("sessionid");
    response.cookies.delete("token");
    response.cookies.delete("refresh_token");

    return response;
}

export async function POST(request: Request) {
    // Call backend to invalidate session
    try {
        const cookieHeader = request.headers.get("cookie");
        await fetch(`${API_BASE_URL}/session-logout/`, {
            method: "POST",
            headers: {
                "Cookie": cookieHeader || "",
                "Content-Type": "application/json",
            },
        });
    } catch (e: any) {
        console.error("Backend logout failed:", e.message);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("sessionid");
    response.cookies.delete("token");
    response.cookies.delete("refresh_token");
    return response;
}
