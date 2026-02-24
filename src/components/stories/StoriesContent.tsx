"use client";

import { StoryCard } from "@/components/cards/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    TrendingUp,
    Sparkles
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getStoriesPage, getCategories, getCities, Story, Category, City } from "@/lib/api";
import { cn } from "@/lib/utils";

export function StoriesContent() {
    const searchParams = useSearchParams();
    const [stories, setStories] = useState<Story[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [selectedStage, setSelectedStage] = useState("all");
    const [sortKey, setSortKey] = useState<"latest" | "trending" | "most_viewed">("latest");
    const [page, setPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        const q = searchParams.get("search");
        const pageParam = searchParams.get("page");
        if (q) {
            setSearchQuery(q);
        }
        if (pageParam) {
            const p = parseInt(pageParam, 10);
            if (!Number.isNaN(p) && p > 0) {
                setPage(p);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        async function loadFilters() {
            try {
                const [categoriesData, citiesData] = await Promise.all([
                    getCategories(),
                    getCities()
                ]);
                setCategories(categoriesData);
                setCities(citiesData);
            } catch (err) {
                console.error("Failed to load filters", err);
            }
        }
        loadFilters();
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const handle = setTimeout(async () => {
            try {
                const response = await getStoriesPage({
                    search: searchQuery || undefined,
                    category: selectedCategory !== "all" ? selectedCategory : undefined,
                    city: selectedCity !== "all" ? selectedCity : undefined,
                    stage: selectedStage !== "all" ? selectedStage : undefined,
                    sort: sortKey,
                    page,
                    page_size: pageSize,
                });
                setStories(response.results || []);
                setTotalCount(response.count || 0);
                setTotalPages(response.total_pages || 1);
            } catch (err) {
                console.error("Failed to load stories data", err);
                setStories([]);
                setTotalCount(0);
                setTotalPages(1);
            } finally {
                setIsLoading(false);
            }
        }, searchQuery ? 300 : 0);

        return () => clearTimeout(handle);
    }, [searchQuery, selectedCategory, selectedCity, selectedStage, sortKey, page]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedCategory, selectedCity, selectedStage]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("all");
        setSelectedCity("all");
        setSelectedStage("all");
        setPage(1);
    };

    const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedCity !== "all" || selectedStage !== "all";

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            {/* Header / Hero Section */}
            <section className="container-wide pt-16 pb-12 md:pt-24 md:pb-16 text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-zinc-900 mb-8 font-serif leading-[1.1] max-w-4xl mx-auto tracking-tight">
                    Latest Indian Startup Stories & Founder Journeys
                </h1>

                <div className="space-y-4 mb-12">
                    <p className="text-base md:text-lg text-zinc-600 max-w-4xl mx-auto leading-relaxed">
                        Your window into India&apos;s startup revolution. From bootstrapped beginnings to billion-dollar exits, we bring you the untold stories of founders who are reshaping industries.
                    </p>
                    <p className="text-sm md:text-base text-zinc-500 max-w-3xl mx-auto leading-relaxed">
                        Explore in-depth features on funding rounds, pivot moments, growth strategies, and the people behind India&apos;s most ambitious ventures. Updated regularly from across Bharat.
                    </p>
                </div>
            </section>

            {/* Sticky Filters Bar */}
            <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-y border-zinc-100 shadow-sm">
                <div className="container-wide py-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Search and Main Filters */}
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Search stories..."
                                    className="h-10 pl-11 rounded-xl border-zinc-200 bg-white/50 text-xs"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="h-10 w-[140px] rounded-xl border-zinc-200 bg-white/50 text-xs font-bold">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                                    <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.slug} value={cat.name} className="text-xs">{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCity} onValueChange={setSelectedCity}>
                                <SelectTrigger className="h-10 w-[140px] rounded-xl border-zinc-200 bg-white/50 text-xs font-bold">
                                    <SelectValue placeholder="City" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                                    <SelectItem value="all" className="text-xs">All Cities</SelectItem>
                                    {cities.map(city => (
                                        <SelectItem key={city.slug} value={city.name} className="text-xs">{city.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort and Clear */}
                        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                            <div className="flex items-center gap-2 p-1 bg-zinc-50 rounded-xl border border-zinc-100">
                                {[
                                    { id: 'latest', label: 'Latest' },
                                    { id: 'trending', label: 'Trending' },
                                    { id: 'most_viewed', label: 'Popular' },
                                ].map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSortKey(s.id as any); setPage(1); }}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                            sortKey === s.id
                                                ? "bg-white text-accent shadow-sm ring-1 ring-zinc-200/50"
                                                : "text-zinc-500 hover:text-zinc-900"
                                        )}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={clearFilters}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-wide py-16 md:py-20">
                <div className="space-y-12">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-[280px] rounded-2xl bg-muted animate-pulse border border-border/50" />
                            ))}
                        </div>
                    ) : stories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stories.map((story) => (
                                <StoryCard key={story.slug} {...story} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-card border-2 border-dashed border-border/50 rounded-2xl">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/5 text-accent mb-6">
                                <X className="h-8 w-8 opacity-20" />
                            </div>
                            <h3 className="text-2xl font-black mb-2 font-serif tracking-tight">No Results</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                We couldn't find any stories matching your current filters. Try broadening your criteria.
                            </p>
                            <Button size="lg" variant="outline" onClick={clearFilters} className="rounded-xl px-12 border-accent/20 text-accent font-bold">
                                Clear all filters
                            </Button>
                        </div>
                    )}

                    {!isLoading && stories.length > 0 && (
                        <div className="flex items-center justify-between border-t border-border/50 pt-12">
                            <p className="text-sm text-muted-foreground font-medium">
                                Showing <span className="text-foreground font-bold">{stories.length}</span> stories
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11 rounded-xl border-border/60"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                                        const p = idx + 1;
                                        return (
                                            <Button
                                                key={p}
                                                variant={p === page ? "accent" : "ghost"}
                                                className={cn("h-11 w-11 rounded-xl font-bold transition-all", p === page ? "shadow-lg shadow-accent/20" : "")}
                                                onClick={() => setPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11 rounded-xl border-border/60"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
