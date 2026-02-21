"use client";

import Link from "next/link";
import { StoryCard } from "@/components/cards/StoryCard";
import { StartupCard } from "@/components/cards/StartupCard";
import { CityCard } from "@/components/cards/CityCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CategoryDetailContentProps {
    category: any;
    categoryStartups: any[];
    categoryStories: any[];
    topCities: any[];
}

export function CategoryDetailContent({ category, categoryStartups, categoryStories, topCities }: CategoryDetailContentProps) {
    return (
        <>
            {/* Header */}
            <section className="container-wide py-12 md:py-16">
                <Link
                    href="/categories"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Categories
                </Link>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center overflow-hidden">
                        {category.icon && typeof category.icon === "string" ? (
                            <img src={category.icon.startsWith("http") ? category.icon : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8000"}${category.icon}`} alt="" className="w-8 h-8 object-contain" />
                        ) : null}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground font-serif">
                        {category.name} Startups
                    </h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                    {category.description}
                </p>
            </section>

            {/* Category Startups */}
            <section className="container-wide section-padding border-t border-border">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-foreground font-serif">Top {category.name} Companies</h2>
                    <Button variant="ghost" className="gap-2" asChild>
                        <Link href="/startups">
                            Explore All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryStartups.map((startup) => (
                        <StartupCard key={startup.slug} {...startup} />
                    ))}
                </div>
            </section>

            {/* Category Stories */}
            {categoryStories.length > 0 && (
                <section className="section-alt section-padding bg-muted/30">
                    <div className="container-wide">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-foreground font-serif">{category.name} Success Stories</h2>
                            <Button variant="ghost" className="gap-2" asChild>
                                <Link href="/stories">
                                    View All
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {categoryStories.map((story) => (
                                <StoryCard key={story.slug} {...story} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Cities for Category */}
            <section className="container-wide section-padding">
                <h2 className="text-2xl font-bold text-foreground mb-8 font-serif">Top Cities for {category.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topCities.map((city) => (
                        <CityCard key={city.slug} {...city} />
                    ))}
                </div>
            </section>
        </>
    );
}
