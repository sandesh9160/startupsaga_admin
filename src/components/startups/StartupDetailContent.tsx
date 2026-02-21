"use client";

import Link from "next/link";
import Image from "next/image";
import { StoryCard } from "@/components/cards/StoryCard";
import { StartupCard } from "@/components/cards/StartupCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, MapPin, Tag, Building2 } from "lucide-react";
import { getSafeImageSrc } from "@/lib/images";

interface StartupDetailContentProps {
    startup: any;
    relatedStories: any[];
    similarStartups: any[];
}

export function StartupDetailContent({ startup, relatedStories, similarStartups }: StartupDetailContentProps) {
    const logoSrc = getSafeImageSrc(startup.logo);
    const isSvgLogo = logoSrc.toLowerCase().endsWith(".svg");
    return (
        <>
            {/* Header */}
            <section className="container-wide py-12 md:py-16">
                <Link
                    href="/startups"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Startups
                </Link>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Logo */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-secondary flex-shrink-0 relative">
                        <Image
                            src={logoSrc}
                            alt={`${startup.name} logo`}
                            fill
                            sizes="128px"
                            className="object-cover"
                            unoptimized={isSvgLogo}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-serif">
                            {startup.name}
                        </h1>
                        <p className="text-xl text-muted-foreground mb-4">
                            {startup.tagline}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <Link
                                href={`/categories/${startup.categorySlug}`}
                                className="badge-category bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium flex items-center"
                            >
                                <Tag className="h-3 w-3 mr-1" />
                                {startup.category}
                            </Link>
                            <Link
                                href={`/cities/${startup.citySlug}`}
                                className="badge-city bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center"
                            >
                                <MapPin className="h-3 w-3 mr-1" />
                                {startup.city}
                            </Link>
                        </div>
                        {startup.website && (
                            <Button asChild className="bg-accent hover:bg-accent/90 text-white gap-2">
                                <a href={startup.website} target="_blank" rel="noopener noreferrer">
                                    Visit Website
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="section-alt section-padding bg-muted/30">
                <div className="container-wide">
                    <h2 className="text-2xl font-bold text-foreground mb-4 font-serif">About {startup.name}</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                        {startup.description}
                    </p>
                </div>
            </section>

            {/* Related Stories */}
            {relatedStories.length > 0 && (
                <section className="container-wide section-padding">
                    <h2 className="text-2xl font-bold text-foreground mb-8 font-serif">
                        Related Stories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedStories.map((story) => (
                            <StoryCard key={story.slug} {...story} />
                        ))}
                    </div>
                </section>
            )}

            {/* Similar Startups */}
            {similarStartups.length > 0 && (
                <section className="section-alt section-padding bg-muted/30">
                    <div className="container-wide">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground font-serif">
                                Similar Startups in {startup.category}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarStartups.map((s) => (
                                <StartupCard key={s.slug} {...s} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
