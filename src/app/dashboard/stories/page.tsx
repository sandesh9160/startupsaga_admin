"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    FileText,
    Zap,
    X,
    BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
    getStoriesPage,
    PaginatedResponse,
    getCategories,
    Category,
    getHubs,
    City,
    deleteStory,
    Story,
} from "@/lib/api";
import { getSafeImageSrc } from "@/lib/images";
import { toast } from "sonner";
import { DashboardPagination } from "@/components/dashboard/Pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function StoriesPage() {
    const router = useRouter();
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedCity, setSelectedCity] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [pagination, setPagination] = useState<PaginatedResponse<Story> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const pageSize = 15;

    useEffect(() => {
        Promise.all([getCategories(), getHubs()])
            .then(([cats, hubs]) => { setCategories(cats); setCities(hubs); })
            .catch(console.error);
    }, []);

    useEffect(() => { loadStories(); }, [currentPage, searchQuery, selectedCategory, selectedCity, selectedStatus]);

    const loadStories = async () => {
        setIsLoading(true);
        try {
            const data = await getStoriesPage({
                page: currentPage,
                page_size: pageSize,
                search: searchQuery,
                category: selectedCategory === "all" ? undefined : selectedCategory,
                city: selectedCity === "all" ? undefined : selectedCity,
                status: selectedStatus === "all" ? undefined : selectedStatus,
            });
            setStories(data.results);
            setPagination(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (story: Story) => {
        if (!story.id) return;
        const ok = window.confirm(`Permanently delete "${story.title}"?`);
        if (!ok) return;
        setDeletingId(story.id);
        try {
            await deleteStory(story.id);
            await loadStories();
            toast.success("Story deleted");
        } catch {
            toast.error("Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-6 flex flex-col min-h-[85vh]">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Master Data</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Blogs</h1>
                        </div>
                    </div>

                    {/* Master Data Toggle */}
                    <div className="hidden lg:flex p-1 bg-zinc-200/50 rounded-lg shrink-0">
                        <Link href="/dashboard/startups" className="px-5 py-1.5 text-xs font-bold rounded-md text-zinc-500 hover:text-zinc-700 transition-all">Startups</Link>
                        <div className="px-5 py-1.5 text-xs font-bold rounded-md bg-white text-zinc-900 shadow-sm">Blogs</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</span>
                            <span className="text-lg font-black text-zinc-900 tabular-nums">{pagination?.count ?? 0}</span>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/stories/new")}
                            className="flex items-center gap-2 h-10 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm shadow-violet-200"
                            suppressHydrationWarning
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            New Story
                        </button>
                    </div>
                </div>

                {/* ── FILTER BAR — single compact row ── */}
                <div className="flex items-center gap-2">
                    {/* Search — grows to fill space */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search by title or author…"
                            className="pl-9 h-9 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* 3 dropdowns — fixed width, no wrapping */}
                    <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-9 w-36 bg-white border border-slate-200 rounded-xl px-3 text-xs font-semibold text-slate-600 shadow-sm shrink-0">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={selectedCity} onValueChange={(v) => { setSelectedCity(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-9 w-32 bg-white border border-slate-200 rounded-xl px-3 text-xs font-semibold text-slate-600 shadow-sm shrink-0">
                            <SelectValue placeholder="City" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Cities</SelectItem>
                            {cities.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-9 w-28 bg-white border border-slate-200 rounded-xl px-3 text-xs font-semibold text-slate-600 shadow-sm shrink-0">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* ── TABLE ── */}
                <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-800 text-[10px] font-black uppercase tracking-widest bg-slate-100 border-b border-slate-200">
                                    <th className="px-5 py-3.5">Story</th>
                                    <th className="px-4 py-3.5 text-center">Category</th>
                                    <th className="px-4 py-3.5 text-center">Status</th>
                                    <th className="px-4 py-3.5 text-center">Author</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {isLoading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-5 py-4">
                                                <div className="h-8 bg-slate-50 rounded-lg w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : stories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                                                    <BookOpen size={22} className="text-violet-400" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-500">No stories found</p>
                                                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : stories.map((story) => (
                                    <tr key={story.id} className="hover:bg-slate-50/60 transition-colors group">
                                        {/* Story */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                                                    <img
                                                        src={getSafeImageSrc(story.thumbnail)}
                                                        alt={story.title}
                                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <Link
                                                        href={`/dashboard/stories/new?editId=${story.id}`}
                                                        className="font-bold text-slate-800 text-[13px] hover:text-violet-600 transition-colors truncate max-w-[240px]"
                                                    >
                                                        {story.title}
                                                    </Link>
                                                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        {story.publishDate || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-[10px] font-bold border border-violet-100">
                                                {story.category || "—"}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5 text-center">
                                            {story.status === "published" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Published
                                                </span>
                                            ) : story.status === "draft" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    Draft
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    {story.status || "Unknown"}
                                                </span>
                                            )}
                                        </td>

                                        {/* Author */}
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white uppercase shrink-0">
                                                    {story.author?.[0] || "A"}
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[80px]">
                                                    {story.author || "Admin"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions — always visible, colorful */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/stories/${story.slug}`, "_blank")}
                                                    title="Preview"
                                                    className="h-8 w-8 rounded-lg bg-sky-100 hover:bg-sky-500 text-sky-600 hover:text-white transition-all flex items-center justify-center"
                                                >
                                                    <Eye size={13} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?editId=${story.id}`)}
                                                    title="Edit"
                                                    className="h-8 w-8 rounded-lg bg-violet-100 hover:bg-violet-600 text-violet-600 hover:text-white transition-all flex items-center justify-center"
                                                >
                                                    <Edit size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(story)}
                                                    title="Delete"
                                                    disabled={deletingId === story.id}
                                                    className="h-8 w-8 rounded-lg bg-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-40"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer count */}
                    {!isLoading && stories.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Showing {stories.length} of {pagination?.count ?? 0} stories
                            </span>
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-1">
                                    <X size={10} /> Clear filter
                                </button>
                            )}
                        </div>
                    )}
                </Card>

                {/* ── PAGINATION ── */}
                {pagination && (pagination.total_pages ?? 0) > 1 && (
                    <div className="mt-auto pt-6 border-t border-slate-100/50">
                        <DashboardPagination
                            currentPage={currentPage}
                            totalPages={pagination.total_pages!}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
