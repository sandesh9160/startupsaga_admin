"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Building2,
    MapPin,
    ExternalLink,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    getStartupsPage,
    PaginatedResponse,
    startupsApi,
    getCategories,
    Category,
    getHubs,
    City,
    Startup,
} from "@/lib/api";
import { getSafeImageSrc } from "@/lib/images";
import { DashboardPagination } from "@/components/dashboard/Pagination";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function StartupsPage() {
    const router = useRouter();
    const [startups, setStartups] = useState<Startup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedCity, setSelectedCity] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [pagination, setPagination] = useState<PaginatedResponse<Startup> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    useEffect(() => {
        Promise.all([getCategories(), getHubs()])
            .then(([cats, hubs]) => { setCategories(cats); setCities(hubs); })
            .catch(console.error);
    }, []);

    useEffect(() => { loadStartups(); }, [currentPage, searchQuery, selectedCategory, selectedCity, selectedStatus]);

    const loadStartups = async () => {
        setIsLoading(true);
        try {
            const data = await getStartupsPage({
                page: currentPage,
                page_size: pageSize,
                search: searchQuery,
                category: selectedCategory === "all" ? undefined : selectedCategory,
                city: selectedCity === "all" ? undefined : selectedCity,
                status: selectedStatus === "all" ? undefined : selectedStatus,
            });
            setStartups(data.results);
            setPagination(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleFeatured = async (startup: Startup) => {
        try {
            const newStatus = !startup.is_featured;
            await startupsApi.update(startup.slug, { is_featured: newStatus });
            setStartups(prev => prev.map(s => s.id === startup.id ? { ...s, is_featured: newStatus } : s));
            toast.success(`${startup.name} is now ${newStatus ? "featured" : "unfeatured"}`);
        } catch {
            toast.error("Failed to update featured status");
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-6 flex flex-col min-h-[85vh]">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Directory</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Startups</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</span>
                            <span className="text-lg font-black text-zinc-900 tabular-nums">{pagination?.count ?? 0}</span>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/startups/new")}
                            className="flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm shadow-indigo-200"
                            suppressHydrationWarning
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            New Startup
                        </button>
                    </div>
                </div>

                {/* ── FILTER BAR — single compact row ── */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search startups, categories or cities…"
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* ── TABLE ── */}
                <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-800 text-[10px] font-black uppercase tracking-widest bg-slate-100 border-b border-slate-200">
                                    <th className="px-5 py-3.5">Startup</th>
                                    <th className="px-4 py-3.5 text-center">Category</th>
                                    <th className="px-4 py-3.5 text-center">Location</th>
                                    <th className="px-4 py-3.5 text-center">Featured</th>
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
                                ) : startups.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                                    <Building2 size={22} className="text-indigo-400" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-500">No startups found</p>
                                                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : startups.map((startup) => (
                                    <tr key={startup.id} className="hover:bg-slate-50/60 transition-colors group">

                                        {/* Startup */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 p-1.5 overflow-hidden shadow-sm shrink-0">
                                                    {startup.logo ? (
                                                        <img
                                                            src={getSafeImageSrc(startup.logo)}
                                                            alt={startup.name}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-black text-xs rounded-lg">
                                                            {startup.name?.[0] || "S"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <Link
                                                        href={`/dashboard/startups/${startup.slug}/edit`}
                                                        className="font-bold text-slate-800 text-[13px] hover:text-indigo-600 transition-colors truncate max-w-[220px]"
                                                    >
                                                        {startup.name}
                                                    </Link>
                                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{startup.slug}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                                                {typeof startup.category === "string" ? startup.category : startup.category?.name || "General"}
                                            </span>
                                        </td>

                                        {/* Location */}
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <MapPin size={11} className="text-slate-400" />
                                                <span className="text-[11px] font-semibold text-slate-600">
                                                    {typeof startup.city === "string" ? startup.city : startup.city?.name || "Remote"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Featured toggle */}
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                onClick={() => handleToggleFeatured(startup)}
                                                className="transition-all active:scale-90"
                                            >
                                                {startup.is_featured ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 hover:bg-amber-100 transition-colors">
                                                        <Sparkles size={10} fill="currentColor" className="text-amber-500" />
                                                        Featured
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold hover:bg-slate-200 transition-colors">
                                                        Mark Featured
                                                    </span>
                                                )}
                                            </button>
                                        </td>

                                        {/* Actions — always visible, colorful */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/startups/${startup.slug}`, "_blank")}
                                                    title="Preview"
                                                    className="h-8 w-8 rounded-lg bg-sky-100 hover:bg-sky-500 text-sky-600 hover:text-white transition-all flex items-center justify-center"
                                                >
                                                    <ExternalLink size={13} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/startups/${startup.slug}/edit`)}
                                                    title="Edit"
                                                    className="h-8 w-8 rounded-lg bg-indigo-100 hover:bg-indigo-600 text-indigo-600 hover:text-white transition-all flex items-center justify-center"
                                                >
                                                    <Edit size={13} />
                                                </button>
                                                <button
                                                    title="Delete"
                                                    className="h-8 w-8 rounded-lg bg-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white transition-all flex items-center justify-center"
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
                    {!isLoading && startups.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Showing {startups.length} of {pagination?.count ?? 0} startups
                            </span>
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
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
