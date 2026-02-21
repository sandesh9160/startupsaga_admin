"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface DashboardPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function DashboardPagination({
    currentPage,
    totalPages,
    onPageChange,
}: DashboardPaginationProps) {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "ellipsis", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
            }
        }
        return pages;
    };

    return (
        <Pagination className="mt-8">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) onPageChange(currentPage - 1);
                        }}
                        className={cn(
                            "h-9 rounded-xl px-4 text-[11px] font-bold uppercase tracking-widest transition-all",
                            currentPage === 1
                                ? "pointer-events-none opacity-40 bg-slate-50 text-slate-300 border-slate-100"
                                : "cursor-pointer bg-white text-slate-600 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 hover:text-blue-600 shadow-sm"
                        )}
                    />
                </PaginationItem>

                {getPages().map((page, idx) => (
                    <PaginationItem key={idx}>
                        {page === "ellipsis" ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(page as number);
                                }}
                                className={cn(
                                    "cursor-pointer font-bold text-[11px] h-9 w-9 rounded-xl transition-all duration-300",
                                    currentPage === page
                                        ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none shadow-lg shadow-blue-500/25 scale-110 z-10"
                                        : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                                )}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) onPageChange(currentPage + 1);
                        }}
                        className={cn(
                            "h-9 rounded-xl px-4 text-[11px] font-bold uppercase tracking-widest transition-all",
                            currentPage === totalPages
                                ? "pointer-events-none opacity-40 bg-slate-50 text-slate-300 border-slate-100"
                                : "cursor-pointer bg-white text-slate-600 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 hover:text-blue-600 shadow-sm"
                        )}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
