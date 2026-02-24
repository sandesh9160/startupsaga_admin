"use client";

import { CityCard } from "@/components/cards/CityCard";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { getCities } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Building2, TrendingUp, Filter } from "lucide-react";

export function CitiesContent() {
    const [cities, setCities] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | '1' | '2' | '3'>('all');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        getCities().then(setCities).catch(err => console.error(err));
    }, []);

    const filteredCities = useMemo(() => {
        return filter === 'all'
            ? cities
            : cities.filter(c => c.tier === filter);
    }, [cities, filter]);

    const totalStartups = useMemo(() =>
        cities.reduce((sum, c) => sum + (c.startupCount || 0), 0)
        , [cities]);

    const totalUnicorns = useMemo(() =>
        cities.reduce((sum, c) => sum + (c.unicornCount || 0), 0)
        , [cities]);

    // Format counts only after mounting to avoid locale mismatch during SSR
    const formattedStartups = isMounted ? totalStartups.toLocaleString('en-US') : "0";
    const formattedUnicorns = isMounted ? totalUnicorns.toLocaleString('en-US') : "0";

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            {/* Header / Hero Section */}
            <section className="container-wide pt-16 pb-12 md:pt-24 md:pb-16 text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-zinc-900 mb-8 font-serif leading-[1.1] max-w-4xl mx-auto tracking-tight">
                    Startup Hubs in India - Bengaluru, Mumbai, Delhi NCR & More
                </h1>

                <div className="space-y-4 mb-12">
                    <p className="text-base md:text-lg text-zinc-600 max-w-4xl mx-auto leading-relaxed">
                        India's startup revolution extends far beyond Bengaluru. Explore thriving entrepreneurial ecosystems in metros, emerging Tier 2 hubs, and ambitious Tier 3 cities building the next wave of innovation.
                    </p>
                    <p className="text-sm md:text-base text-zinc-500 max-w-3xl mx-auto leading-relaxed">
                        Each city profile features local unicorns, top-funded startups, leading investors, co-working spaces, and the unique strengths shaping its startup culture.
                    </p>
                </div>

                {/* Stats Section */}
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 py-8 border-t border-zinc-50 max-w-2xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#FFF3E0] flex items-center justify-center shadow-sm">
                            <Building2 className="w-6 h-6 md:w-7 md:h-7 text-[#FF9800]" />
                        </div>
                        <div className="text-left">
                            <span className="block text-2xl md:text-3xl font-black text-zinc-900 leading-none tabular-nums">
                                {formattedStartups}
                            </span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1.5 block">Startups</span>
                        </div>
                    </div>

                    <div className="hidden md:block h-10 w-px bg-zinc-200" />

                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#E8EAF6] flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-[#3F51B5]" />
                        </div>
                        <div className="text-left">
                            <span className="block text-2xl md:text-3xl font-black text-zinc-900 leading-none tabular-nums">
                                {formattedUnicorns}
                            </span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1.5 block">Unicorns</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sticky Filters Bar */}
            <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-y border-zinc-100 shadow-sm">
                <div className="container-wide py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Filter Controls */}
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Filter className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                    Filter by tier:
                                </span>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                                {[
                                    { id: 'all', label: 'All Cities' },
                                    { id: '1', label: 'Tier 1' },
                                    { id: '2', label: 'Tier 2' },
                                    { id: '3', label: 'Tier 3' },
                                ].map((t) => (
                                    <Button
                                        key={t.id}
                                        variant={filter === t.id ? "accent" : "outline"}
                                        onClick={() => setFilter(t.id as any)}
                                        className={cn(
                                            "px-6 py-1.5 h-10 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap",
                                            filter === t.id
                                                ? "bg-accent text-white border-transparent shadow-lg shadow-accent/25"
                                                : "border-zinc-200 hover:border-accent/40 text-zinc-600"
                                        )}
                                    >
                                        {t.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation Links */}
                        <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-zinc-400">Recommended:</span>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFilter('2')}
                                    className="text-accent hover:text-accent/80 transition-colors border-b-2 border-transparent hover:border-accent pb-0.5"
                                >
                                    Tier 2 Hubs
                                </button>
                                <button
                                    onClick={() => setFilter('3')}
                                    className="text-accent hover:text-accent/80 transition-colors border-b-2 border-transparent hover:border-accent pb-0.5"
                                >
                                    Tier 3 Hubs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cities Grid Section */}
            <section className="container-wide py-16 md:py-20">
                {filteredCities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredCities.map((city) => (
                            <div key={city.slug} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <CityCard {...city} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
                        <p className="text-zinc-400 font-medium">No cities found for this criteria.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
