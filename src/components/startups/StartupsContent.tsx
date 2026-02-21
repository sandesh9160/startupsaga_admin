"use client";

import Link from "next/link";
import { StartupCard } from "@/components/cards/StartupCard";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    Rocket
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { getStartups, getCategories, getCities, Startup, Category, City } from "@/lib/api";
import { cn } from "@/lib/utils";

export function StartupsContent() {
    const [startups, setStartups] = useState<Startup[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [selectedStage, setSelectedStage] = useState("all");

    useEffect(() => {
        async function loadData() {
            try {
                const [startupsData, categoriesData, citiesData] = await Promise.all([
                    getStartups(),
                    getCategories(),
                    getCities()
                ]);
                setStartups(startupsData);
                setCategories(categoriesData);
                setCities(citiesData);
            } catch (err) {
                console.error("Failed to load startups data", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredStartups = useMemo(() => {
        return startups.filter(startup => {
            const matchesSearch = startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (startup.tagline && startup.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === "all" || startup.category === selectedCategory;
            const matchesCity = selectedCity === "all" || startup.city === selectedCity;

            return matchesSearch && matchesCategory && matchesCity;
        });
    }, [startups, searchQuery, selectedCategory, selectedCity]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("all");
        setSelectedCity("all");
        setSelectedStage("all");
    };

    const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedCity !== "all" || selectedStage !== "all";

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            {/* Centered Header Section */}
            <section className="container-wide pt-20 pb-16 text-center relative overflow-hidden">
                {/* Subtle Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black text-zinc-900 font-serif leading-[1.1] tracking-tight">
                        India Startup Directory - Discover <span className="text-accent">5,000+</span> Companies
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed">
                        The most comprehensive directory of Indian startups—from early-stage disruptors to established unicorns. Browse companies across fintech, SaaS, D2C, healthtech, and more.
                    </p>
                    <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
                        Filter by sector, city, or funding stage to find startups that match your interests, whether you're an investor, job seeker, or fellow entrepreneur.
                    </p>

                    {/* Centered Search Bar */}
                    <div className="max-w-2xl mx-auto mt-12 relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-accent transition-colors" />
                        </div>
                        <Input
                            placeholder="Search startups by name or description..."
                            className="w-full h-16 pl-14 pr-12 rounded-2xl bg-white border-zinc-100 shadow-xl shadow-zinc-200/50 focus:ring-accent/20 transition-all text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-5 inset-y-0 flex items-center text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Horizontal Filter Bar */}
            <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-y border-zinc-100 shadow-sm">
                <div className="container-wide py-4 overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-center gap-4 min-w-max">
                        <div className="flex items-center gap-2 text-zinc-400 mr-2">
                            <span className="text-[10px] font-black uppercase tracking-widest">Filters:</span>
                        </div>

                        {/* Category Select */}
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-zinc-50 border-zinc-100 text-xs font-bold transition-all hover:bg-zinc-100">
                                <SelectValue placeholder="All Sectors" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                                <SelectItem value="all" className="text-xs">All Sectors</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.slug} value={cat.name} className="text-xs">{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* City Select */}
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-zinc-50 border-zinc-100 text-xs font-bold transition-all hover:bg-zinc-100">
                                <SelectValue placeholder="All Cities" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                                <SelectItem value="all" className="text-xs">All Cities</SelectItem>
                                {cities.map(city => (
                                    <SelectItem key={city.slug} value={city.name} className="text-xs">{city.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Stage Select (Mockup for now) */}
                        <Select value={selectedStage} onValueChange={setSelectedStage}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-zinc-50 border-zinc-100 text-xs font-bold transition-all hover:bg-zinc-100">
                                <SelectValue placeholder="All Stages" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                                <SelectItem value="all" className="text-xs">All Stages</SelectItem>
                                <SelectItem value="bootstrap" className="text-xs">Bootstrapped</SelectItem>
                                <SelectItem value="seed" className="text-xs">Seed</SelectItem>
                                <SelectItem value="series-a" className="text-xs">Series A</SelectItem>
                                <SelectItem value="unicorn" className="text-xs">Unicorn</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                onClick={clearFilters}
                                variant="ghost"
                                className="h-10 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest px-4"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <section className="container-wide py-16">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Results Counter */}
                    {!isLoading && (
                        <div className="flex items-center gap-2.5 text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                                Showing <span className="text-zinc-900">{filteredStartups.length}</span> startups
                            </span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-[280px] rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200/50" />
                            ))}
                        </div>
                    ) : filteredStartups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {filteredStartups.map((startup) => (
                                <StartupCard key={startup.slug} {...startup} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-zinc-100 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6">
                                <Search className="h-8 w-8 text-zinc-200" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 font-serif">No Startups Found</h3>
                            <p className="text-zinc-500 max-w-sm mb-8">
                                We couldn't find any startups matching your current search and filters.
                            </p>
                            <Button onClick={clearFilters} variant="accent" className="rounded-xl h-12 px-8 font-bold">
                                Reset All Filters
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && filteredStartups.length > 0 && (
                        <div className="flex items-center justify-center gap-3 pt-12 border-t border-zinc-100">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" disabled>
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3].map(p => (
                                    <Button
                                        key={p}
                                        variant={p === 1 ? "accent" : "ghost"}
                                        className={cn(
                                            "h-10 w-10 p-0 rounded-xl text-xs font-bold transition-all",
                                            p === 1 ? "shadow-lg shadow-accent/20 text-white" : "text-zinc-500 hover:text-accent"
                                        )}
                                    >
                                        {p}
                                    </Button>
                                ))}
                                <span className="px-2 text-zinc-300">...</span>
                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-xs font-bold text-zinc-500">
                                    12
                                </Button>
                            </div>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container-wide pb-24">
                <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-5xl font-black text-white font-serif italic">
                            Missing a startup?
                        </h2>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            Join thousands of founders and get your startup listed in India's most curated ecosystem directory.
                        </p>
                        <Button size="xl" variant="accent" className="min-w-[200px] h-16 rounded-2xl bg-accent hover:scale-105 transition-transform shadow-2xl shadow-accent/40" asChild>
                            <Link href="/submit" className="flex items-center gap-3">
                                <Rocket className="h-6 w-6" />
                                <span className="font-bold">Add Your Startup</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
