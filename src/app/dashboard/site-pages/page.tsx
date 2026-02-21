"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, ExternalLink, Plus, Eye, Edit, Trash2, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchAPI, pagesApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardPagesPage() {
    const router = useRouter();
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        // Fetch all pages (drafts included)
        fetchAPI("/pages/")
            .then((data) => setPages(Array.isArray(data) ? data : []))
            .catch(() => setPages([]))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (pageId: number, pageTitle: string) => {
        if (!window.confirm(`Delete page "${pageTitle}"? This action cannot be undone.`)) return;

        try {
            setDeleting(pageId);
            await pagesApi.delete(pageId);
            setPages(pages.filter(p => p.id !== pageId));
            toast.success("Page deleted successfully");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete page");
        } finally {
            setDeleting(null);
        }
    };

    const [searchQuery, setSearchQuery] = useState("");

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Website</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Pages</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</span>
                            <span className="text-base font-bold text-zinc-900 tabular-nums">{pages.length}</span>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/site-pages/new")}
                            className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                            suppressHydrationWarning
                        >
                            <Plus size={14} /> New Page
                        </button>
                    </div>
                </div>

                {/* ── FILTER BAR — single compact row ── */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search pages by title or slug…"
                            className="pl-9 h-9 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── LIST ── */}
                <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-800 text-[10px] font-black uppercase tracking-widest bg-slate-100 border-b border-slate-200">
                                    <th className="px-5 py-3.5">Page</th>
                                    <th className="px-4 py-3.5 text-center">Type</th>
                                    <th className="px-4 py-3.5 text-center">Status</th>
                                    <th className="px-4 py-3.5 text-center">Last Updated</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-5 py-4">
                                                <div className="h-8 bg-slate-50 rounded-lg w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredPages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                                                    <FileText size={22} className="text-purple-400" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-500">No pages found</p>
                                                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPages.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/dashboard/site-pages/${p.id}/edit`}
                                                            className="font-bold text-slate-800 text-[13px] hover:text-purple-600 transition-colors truncate block"
                                                        >
                                                            {p.title}
                                                        </Link>
                                                        <span className="text-[10px] text-indigo-500 font-mono mt-0.5 block">
                                                            /{p.slug}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                {p.is_system ? (
                                                    <Badge variant="secondary" className="text-[9px] px-2 py-0.5 font-bold rounded-lg bg-slate-100 text-slate-500 border-0 uppercase">
                                                        System
                                                    </Badge>
                                                ) : (
                                                    <Badge className="text-[9px] px-2 py-0.5 font-bold rounded-lg bg-purple-50 text-purple-600 border-0 uppercase">
                                                        Custom
                                                    </Badge>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                {p.status === "published" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        Draft
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <span className="text-[11px] font-medium text-slate-500">
                                                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "—"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}${p.slug && !['home', 'homepage'].includes(p.slug.toLowerCase()) ? `/${p.slug}` : '/'}`, "_blank")}
                                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-all"
                                                        title="View Live"
                                                    >
                                                        <Eye size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/dashboard/site-pages/${p.id}/edit`)}
                                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center transition-all"
                                                        title="Edit Page"
                                                    >
                                                        <Edit size={13} />
                                                    </button>
                                                    {!p.is_system && (
                                                        <button
                                                            onClick={() => handleDelete(p.id, p.title)}
                                                            disabled={deleting === p.id}
                                                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all disabled:opacity-40"
                                                            title="Delete Page"
                                                        >
                                                            {deleting === p.id ? (
                                                                <Loader2 size={13} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={13} />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && filteredPages.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Showing {filteredPages.length} of {pages.length} pages
                            </span>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
