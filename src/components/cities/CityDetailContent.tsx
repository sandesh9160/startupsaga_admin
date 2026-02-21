"use client";

import Link from "next/link";
import { StoryCard } from "@/components/cards/StoryCard";
import { StartupCard } from "@/components/cards/StartupCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Building2, TrendingUp, Users } from "lucide-react";
import { Fragment } from "react";
import { getSafeImageSrc } from "@/lib/images";

interface CityDetailContentProps {
    city: any;
    cityStartups: any[];
    cityStories: any[];
    topCategories: any[];
}

export function CityDetailContent({ city, cityStartups, cityStories, topCategories }: CityDetailContentProps) {
    const heroImage = city.image ? getSafeImageSrc(city.image) : "https://images.unsplash.com/photo-1562426620-1e71f9cf3d1c?q=80&w=2600&auto=format&fit=crop";

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt={`${city.name} skyline`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
                </div>

                {/* Content */}
                <div className="relative z-10 container-wide text-center text-white px-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center justify-center gap-2 text-sm md:text-base text-white/70 mb-6 font-medium">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>›</span>
                        <Link href="/cities" className="hover:text-white transition-colors">Cities</Link>
                        <span>›</span>
                        <span className="text-white">{city.name}</span>
                    </div>

                    {/* Location Badge */}
                    <div className="flex items-center justify-center gap-2 mb-4 text-orange-400 font-bold uppercase tracking-widest text-xs md:text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{city.state || "India"}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-black font-serif mb-6 tracking-tight drop-shadow-xl">
                        Startups in {city.name}
                    </h1>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm md:text-base font-medium text-white/90">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            <span>{cityStartups?.length || "100+"} Startups</span>
                        </div>
                        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/30" />
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>Top startup hub</span>
                        </div>
                        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/30" />
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <span>Growing ecosystem</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Description Section */}
            <section className="container-wide py-16 md:py-24 max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100 -mt-20 relative z-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-serif">
                        The {city.name} Startup Ecosystem
                    </h2>
                    <div className="prose prose-lg text-muted-foreground leading-relaxed max-w-none">
                        <p>{city.description || `${city.name} has emerged as one of India's most vibrant startup ecosystems, attracting entrepreneurs, investors, and talent from across the country and beyond. Known for its strong infrastructure and quality of life, the city has become a preferred destination for building technology companies.`}</p>
                        <p>The city is home to a diverse range of sectors including SaaS, HealthTech, Fintech, and more. Major success stories have put {city.name} on the global startup map, attracting significant venture capital investments and inspiring the next generation of founders.</p>
                    </div>
                </div>
            </section>

            {/* Notable Startups */}
            <section className="bg-muted/30 py-16 md:py-24 border-t border-border/50">
                <div className="container-wide">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-2">Notable Startups</h2>
                            <p className="text-muted-foreground">Leading companies from {city.name}</p>
                        </div>
                        <Button variant="outline" className="gap-2 hidden sm:flex" asChild>
                            <Link href="/startups">
                                Explore All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    {cityStartups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cityStartups.map((startup) => (
                                <StartupCard key={startup.slug} {...startup} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl">
                            <p className="text-muted-foreground">No featured startups found in {city.name} yet.</p>
                        </div>
                    )}
                    <div className="mt-8 text-center sm:hidden">
                        <Button variant="outline" asChild>
                            <Link href="/startups">View All Startups</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stories Section */}
            {cityStories.length > 0 && (
                <section className="container-wide py-16 md:py-24">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-2">Stories from {city.name}</h2>
                            <p className="text-muted-foreground">Insights and news from the local ecosystem</p>
                        </div>
                        <Button variant="ghost" className="gap-2 hidden sm:flex" asChild>
                            <Link href="/stories">
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {cityStories.map((story) => (
                            <StoryCard key={story.slug} {...story} />
                        ))}
                    </div>
                </section>
            )}

            {/* Categories Section */}
            <section className="bg-zinc-900 text-white py-16 md:py-24">
                <div className="container-wide">
                    <h2 className="text-2xl md:text-3xl font-bold mb-10 font-serif text-center">Top Sectors in {city.name}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topCategories.map((category) => (
                            <CategoryCard
                                key={category.slug}
                                {...category}
                                icon={getIcon(category.iconName || "help-circle")}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
