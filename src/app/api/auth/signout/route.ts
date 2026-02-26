import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

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
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("Backend logout failed:", e.message);
        } else {
            console.error("Backend logout failed:", e);
        }
    }

    // Redirect to login page
    const response = NextResponse.redirect(new URL("/admin", request.url));

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
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("Backend logout failed:", e.message);
        } else {
            console.error("Backend logout failed:", e);
        }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("sessionid");
    response.cookies.delete("token");
    response.cookies.delete("refresh_token");
    return response;
}
