"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SEORedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the settings page with SEO tab
        router.replace("/dashboard/settings#seo");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Redirecting to settings...</p>
            </div>
        </div>
    );
}
