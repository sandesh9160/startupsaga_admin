"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RedirectNewMenu() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the main menus list because 'new' is not a valid direct route
        // for creating a menu container (containers are fixed in code).
        // User should select a container (header/footer) first.
        toast.info("Please select a menu location to add items.");
        router.replace("/dashboard/menus");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting...</span>
            </div>
        </div>
    );
}
