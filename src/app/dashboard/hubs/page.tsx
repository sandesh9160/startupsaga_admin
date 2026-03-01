"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    MapPin,
    Building2,
    FileText,
    Edit,
    Trash2,
    ChevronDown,
    Globe,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCities, deleteCity, Hub as City, getHubsPage, PaginatedResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TIER_LABELS: Record<string, string> = {
    '1': 'Tier 1',
    '2': 'Tier 2',
    '3': 'Tier 3',
};

export default function CitiesPage() {
    const router = useRouter();
    const [cities, setCities] = useState<City[]>([]);
    const [cityToDelete, setCityToDelete] = useState<City | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [tierFilter, setTierFilter] = useState("all");
    const [isMounted, setIsMounted] = useState(false);
    const [pagination, setPagination] = useState<PaginatedResponse<City> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        setIsMounted(true);
        loadCities();
    }, [currentPage, searchQuery, tierFilter]);

    const loadCities = async () => {
        setIsLoading(true);
        try {
            const data = await getHubsPage({
                page: currentPage,
                page_size: pageSize,
                search: searchQuery,
                tier: tierFilter === 'all' ? undefined : tierFilter
            });
            setCities(data.results);
            setPagination(data);
        } catch (err) {
            console.error(err);
            toast.error("Network failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (city: City) => {
        setCityToDelete(city);
    };

    const confirmDelete = async (city: City) => {
        setCityToDelete(null);
        try {
            await deleteCity(city.slug);
            await loadCities();
            toast.success("City removed");
        } catch (err: any) {
            toast.error("Operation failed");
        }
    };

    const filteredCities = cities;

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Network</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Cities</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</span>
                            <span className="text-lg font-black text-zinc-900 tabular-nums">{pagination?.count || 0}</span>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/hubs/new")}
                            className="flex items-center gap-2 h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm shadow-purple-200"
                            suppressHydrationWarning
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            New City
                        </button>
                    </div>
                </div>

                {/* ── FILTER BAR — single compact row ── */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search cities or descriptions…"
                            className="pl-9 h-9 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {isMounted && (
                        <Select value={tierFilter} onValueChange={setTierFilter}>
                            <SelectTrigger className="h-9 w-32 bg-white border border-slate-200 rounded-xl px-3 text-xs font-semibold text-slate-600 shadow-sm shrink-0">
                                <SelectValue placeholder="All Tiers" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Tiers</SelectItem>
                                <SelectItem value="1">Tier 1</SelectItem>
                                <SelectItem value="2">Tier 2</SelectItem>
                                <SelectItem value="3">Tier 3</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* --- GRID --- Compact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {isLoading ? (
                        [...Array(8)].map((_, i) => (
                            <Card key={i} className="border-none shadow-sm bg-white rounded-2xl p-4 space-y-3 animate-pulse">
                                <div className="h-32 bg-slate-50 rounded-xl w-full" />
                                <div className="space-y-1.5">
                                    <div className="h-4 bg-slate-50 rounded-md w-2/3" />
                                    <div className="h-3 bg-slate-50 rounded-md w-full" />
                                </div>
                            </Card>
                        ))
                    ) : filteredCities.map((city) => (
                        <div key={city.slug} className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-200 transition-all duration-300 overflow-hidden">

                            {/* Card Image Area */}
                            <div className="relative h-32 w-full bg-slate-50 overflow-hidden">
                                {city.image ? (
                                    <img
                                        src={getSafeImageSrc(city.image)}
                                        alt={city.name}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                                        <MapPin size={32} className="opacity-20" />
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                                {/* Tier Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                                        {TIER_LABELS[city.tier || '3']}
                                    </span>
                                </div>

                                {/* Bottom Content Over Image */}
                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <h3 className="text-sm font-bold tracking-tight mb-0.5">{city.name}</h3>
                                    <p className="text-[10px] text-white/80 line-clamp-1">
                                        {city.description || "City"}
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer / Stats + Actions */}
                            <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200 bg-slate-50">
                                <div className="flex gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Startups</span>
                                        <span className="text-slate-700 font-bold text-[12px]">{city.startupCount || 0}</span>
                                    </div>
                                    <div className="w-px h-6 bg-slate-200" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Stories</span>
                                        <span className="text-slate-700 font-bold text-[12px]">{city.storyCount || 0}</span>
                                    </div>
                                </div>

                                {/* Actions — always visible, colorful */}
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/hubs/edit/${city.slug}`); }}
                                        title="Edit"
                                        className="h-7 w-7 rounded-lg bg-purple-100 hover:bg-purple-600 text-purple-600 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <Edit size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(city); }}
                                        title="Delete"
                                        className="h-7 w-7 rounded-lg bg-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {pagination && pagination.total_pages && pagination.total_pages > 1 && (
                    <div className="mt-auto pt-10 pb-6 border-t border-slate-100/50">
                        <DashboardPagination
                            currentPage={currentPage}
                            totalPages={pagination.total_pages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            <AlertDialog open={!!cityToDelete} onOpenChange={(open) => !open && setCityToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-zinc-100 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-zinc-900 font-serif">
                            Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500 text-sm">
                            Are you sure you want to delete <span className="font-bold text-zinc-900">"{cityToDelete?.name}"</span>?
                            This will remove the city from the directory and unassign it from mapping.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all font-bold text-xs uppercase tracking-widest">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => cityToDelete && confirmDelete(cityToDelete)}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all font-bold text-xs uppercase tracking-widest px-6"
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
