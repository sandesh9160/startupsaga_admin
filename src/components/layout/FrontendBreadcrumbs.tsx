"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

export function FrontendBreadcrumbs() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Normalize pathname (remove trailing slash)
    const cleanPath = pathname.replace(/\/$/, "");

    const hiddenRoutes = ["", "/stories", "/startups", "/categories", "/cities"];

    const shouldHide = hiddenRoutes.includes(cleanPath);

    if (shouldHide) return null;

    const segments = cleanPath.split("/").filter(Boolean);

    const getBreadcrumbLabel = (segment: string) => {
        return segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <div className="container mx-auto px-4 py-4 md:px-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                <span className="hidden sm:inline">Home</span>
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    {segments.map((segment, index) => {
                        const isLast = index === segments.length - 1;
                        const href = `/${segments.slice(0, index + 1).join("/")}`;
                        const label = getBreadcrumbLabel(segment);

                        return (
                            <Fragment key={href}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={href}>{label}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}