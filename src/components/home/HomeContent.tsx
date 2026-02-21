"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Building2, MapPin, Sparkles, Image as ImageIcon } from "lucide-react";
import { StoryCard } from "@/components/cards/StoryCard";
import { StartupCard } from "@/components/cards/StartupCard";
import { CityCard } from "@/components/cards/CityCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { Newsletter } from "@/components/sections/Newsletter";
import { Banner } from "@/components/sections/Banner";
import { TrendingStories } from "@/components/stories/TrendingStories";
import { useState, useEffect, useRef } from "react";
import { getTrendingStories, getSections, getStories, getStartups, getCities, getCategories } from "@/lib/api";
import { getIcon } from "@/lib/icons";

interface HomeContentProps {
    initialTrending?: any[];
    initialSections?: any[];
    hasError?: boolean;
}

export function HomeContent({ initialTrending = [], initialSections = [], hasError = false }: HomeContentProps) {
    const isHydrated = useRef(false);
    const [latestStories, setLatestStories] = useState<any[]>([]);
    const [featuredStartups, setFeaturedStartups] = useState<any[]>([]);
    const [topCities, setTopCities] = useState<any[]>([]);
    const [topCategories, setTopCategories] = useState<any[]>([]);
    const [trendingStories, setTrendingStories] = useState<any[]>(initialTrending);
    const [pageSections, setPageSections] = useState<any[]>(initialSections);

    // Initialize hero data from initialSections if available to avoid hydration mismatch
    const initialHero = initialSections.find((s: any) => s.section_type === 'hero');
    const [heroData, setHeroData] = useState({
        title: initialHero?.title || initialHero?.name || "Startup Stories of India",
        content: initialHero?.description || initialHero?.content || "Discover the journeys, milestones, and lessons from India's most inspiring founders and startups."
    });

    const [isClient, setIsClient] = useState(false);

    // Mark hydration complete
    useEffect(() => {
        setIsClient(true);
        isHydrated.current = true;
    }, []);

    // Load additional data after hydration
    useEffect(() => {
        if (!isHydrated.current) return;

        async function loadData() {
            try {
                // Prepare promises for data fetching
                // Only fetch sections/trending if they weren't provided as initial props
                const storiesPromise = getStories();
                const startupsPromise = getStartups();
                const citiesPromise = getCities();
                const categoriesPromise = getCategories();
                const sectionsPromise = initialSections.length === 0 ? getSections('homepage') : Promise.resolve(initialSections);
                const trendingPromise = initialTrending.length === 0 ? getTrendingStories() : Promise.resolve(initialTrending);

                const [stories, startups, cities, categories, sections, trending] = await Promise.all([
                    storiesPromise,
                    startupsPromise,
                    citiesPromise,
                    categoriesPromise,
                    sectionsPromise,
                    trendingPromise
                ]);

                setLatestStories(stories.slice(0, 4));
                setFeaturedStartups(startups.slice(0, 4));
                setTopCities(cities.slice(0, 4));
                setTopCategories(categories.slice(0, 5));

                if (initialSections.length === 0) {
                    setPageSections(sections);
                    const hero = sections.find((s: any) => s.section_type === 'hero');
                    if (hero) {
                        setHeroData({
                            title: hero.title || hero.name,
                            content: hero.description || hero.content
                        });
                    }
                }

                if (initialTrending.length === 0) {
                    setTrendingStories(trending);
                }
            } catch (error) {
                console.error("Failed to fetch home content", error);
            }
        }

        loadData();
    }, [isClient, initialSections, initialTrending]);

    return (
        <>
            {/* Hero Banner Section */}
            <section className="relative overflow-hidden bg-background py-16 md:py-28 lg:py-36 border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
                <div className="absolute inset-0 z-0 opacity-[0.03]">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                </div>

                {/* Modern Abstract Shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="container-wide relative z-10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-accent/10 text-accent border border-accent/20 shadow-sm shadow-accent/5">
                            <Sparkles className="h-4 w-4 mr-2" />
                            India's #1 Startup Hub
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-serif text-foreground mb-4 max-w-4xl mx-auto leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        {heroData.title}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        {heroData.content}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                        <Button size="xl" variant="accent" className="w-full sm:w-auto gap-3 text-lg h-16 px-10 rounded-2xl bg-accent text-white shadow-2xl shadow-accent/40 active:scale-95 transition-all group" asChild>
                            <Link href="/stories">
                                <span className="font-bold">Explore Chronicles</span>
                                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button size="xl" variant="outline" className="w-full sm:w-auto gap-3 text-lg h-16 px-10 rounded-2xl border-2 border-border/60 hover:border-accent/40 active:scale-95 transition-all" asChild>
                            <Link href="/submit" className="font-bold">
                                Get Featured
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Latest & Trending Section */}
            <section className="container-wide section-padding">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content: Latest Stories (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">Latest Stories</h2>
                                <p className="text-sm text-muted-foreground">Fresh insights from India's startup ecosystem</p>
                            </div>
                            <Button variant="ghost" className="gap-2 hidden sm:flex" asChild>
                                <Link href="/stories">
                                    View All
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {latestStories.map((story) => (
                                <StoryCard key={story.slug} {...story} />
                            ))}
                        </div>
                        <div className="mt-8 text-center sm:hidden">
                            <Button variant="outline" className="gap-2" asChild>
                                <Link href="/stories">
                                    View All Stories
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar: Trending (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        <TrendingStories stories={trendingStories} />
                    </div>
                </div>
            </section>

            {/* Dynamic Banners from CMS */}
            {pageSections.filter(s => s.section_type === 'banner' && s.is_active).map((banner, index) => (
                <Banner key={banner.id || index} {...banner} />
            ))}

            {/* Featured Startups Section */}
            <section className="section-alt section-padding">
                <div className="container-wide">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Startups</h2>
                                <p className="text-muted-foreground text-[13px] font-medium">Innovative companies shaping India's future</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="gap-2 hidden sm:flex" asChild>
                            <Link href="/startups">
                                Explore All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {featuredStartups.map((startup) => (
                            <StartupCard key={startup.slug} {...startup} />
                        ))}
                    </div>
                    <div className="mt-8 text-center sm:hidden">
                        <Button variant="outline" className="gap-2" asChild>
                            <Link href="/startups">
                                Explore All Startups
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Top Cities Section */}
            <section className="container-wide section-padding">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-foreground">Startup Hubs</h2>
                            <p className="text-muted-foreground text-[13px] font-medium">Explore India's thriving startup cities</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="gap-2 hidden sm:flex" asChild>
                        <Link href="/cities">
                            All Cities
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topCities.map((city) => (
                        <CityCard key={city.slug} {...city} />
                    ))}
                </div>
            </section>

            {/* Categories Section */}
            <section className="section-alt section-padding">
                <div className="container-wide">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-foreground">Explore by Category</h2>
                                <p className="text-muted-foreground text-[13px] font-medium">Discover startups transforming every sector of India's economy.</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="gap-2 hidden sm:flex" asChild>
                            <Link href="/categories">
                                All Categories
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topCategories.map((category) => (
                            <CategoryCard key={category.slug} {...category} icon={getIcon(category.iconName || "help-circle")} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <Newsletter />

            {/* Submit CTA Section */}
            <section className="hero-gradient section-padding text-center">
                <div className="container-wide">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
                        Have a Startup Story to Share?
                    </h2>
                    <p className="text-primary-foreground/80 text-base mb-8 max-w-xl mx-auto">
                        We'd love to feature your startup journey. Share your story with thousands of readers across India.
                    </p>
                    <Button variant="accent" size="xl" className="gap-2" asChild>
                        <Link href="/submit">
                            Submit Your Startup
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
