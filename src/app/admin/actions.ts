/**
 * @file app/admin/actions.ts
 * @description Secure server actions for admin authentication using Django sessions
 */

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

/**
 * Secure Admin Login
 */
export async function loginAction(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // 1. Basic Validation
    if (!username || !password) {
        return { error: "Username and password are required" };
    }

    try {
        const sharedCookieDomain =
            process.env.SESSION_COOKIE_DOMAIN ||
            process.env.NEXT_PUBLIC_SESSION_COOKIE_DOMAIN ||
            undefined;
        const secureCookies = process.env.NODE_ENV === "production";
        const sameSite = secureCookies ? "none" : "lax";

        // 2. Authenticate with Django backend
        const res = await fetch(`${API_BASE_URL}/session-login/`, {
            method: "POST",
            credentials: "include", // important for cookies
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        // 3. Handle errors
        if (!res.ok) {
            let errorMessage = "Authentication failed";
            try {
                const errorData = await res.json();
                errorMessage =
                    errorData.non_field_errors?.[0] ||
                    errorData.detail ||
                    errorMessage;
            } catch {}
            return { error: errorMessage };
        }

        // 4. Extract Django session cookie
        const setCookieHeader = res.headers.get("set-cookie");

        if (!setCookieHeader) {
            return { error: "No session cookie received" };
        }

        const sessionMatch = setCookieHeader.match(/sessionid=([^;]+)/);
        if (!sessionMatch) {
            return { error: "Invalid session cookie" };
        }

        const sessionId = sessionMatch[1];
        const csrfMatch = setCookieHeader.match(/csrftoken=([^;]+)/);

        // 5. Store real session cookie
        const cookieStore = await cookies();
        cookieStore.set("sessionid", sessionId, {
            httpOnly: true,
            secure: secureCookies,
            sameSite,
            path: "/",
            ...(sharedCookieDomain ? { domain: sharedCookieDomain } : {}),
        });

        if (csrfMatch?.[1]) {
            cookieStore.set("csrftoken", csrfMatch[1], {
                httpOnly: false,
                secure: secureCookies,
                sameSite,
                path: "/",
                ...(sharedCookieDomain ? { domain: sharedCookieDomain } : {}),
            });
        }

        // Cleanup any stale tokens
        cookieStore.delete("token");
        cookieStore.delete("refresh_token");

    } catch (err) {
        console.error("Login Error:", err);
        return { error: "Server error during login" };
    }

    // Redirect on success
    redirect("/dashboard");
}

/**
 * Secure Logout
 */
export async function logoutAction() {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    try {
        await fetch(`${API_BASE_URL}/session-logout/`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Cookie": cookieString,
                "Content-Type": "application/json",
            },
        });
    } catch {
        // silent fail
    }

    // Delete real Django session cookie
    cookieStore.delete("sessionid");
    cookieStore.delete("csrftoken");
    cookieStore.delete("token");
    cookieStore.delete("refresh_token");

    redirect("/admin");
}
