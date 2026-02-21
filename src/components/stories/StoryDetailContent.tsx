"use client";

import Link from "next/link";
import { StoryCard } from "@/components/cards/StoryCard";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Calendar,
    User,
    Twitter,
    Linkedin,
    Link as LinkIcon,
    Clock,
    Share2,
    Bookmark,
    MapPin,
    Building2,
    TrendingUp,
    Lightbulb,
    Tag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface StoryDetailContentProps {
    story: any;
    relatedStories: any[];
    cityStartups: any[];
}

export function StoryDetailContent({ story, relatedStories, cityStartups }: StoryDetailContentProps) {
    const [tableOfContents, setTableOfContents] = useState<Array<{ id: number; title: string; anchor: string }>>([]);

    // Extract table of contents safely from story.sections or content
    useEffect(() => {
        if (story.sections && Array.isArray(story.sections)) {
            // Use structured sections if available
            const toc = story.sections.map((section: any, idx: number) => ({
                id: idx + 1,
                title: section.title || section.heading || '',
                anchor: (section.title || section.heading || '').toLowerCase().replace(/\s+/g, '-')
            }));
            setTableOfContents(toc);
        } else if (story.content && typeof story.content === 'string') {
            // Fallback: Extract h2 headings using regex (safer than DOMParser)
            const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
            const matches = [...story.content.matchAll(h2Regex)];
            const toc = matches.map((match, idx) => {
                const title = match[1].replace(/<[^>]*>/g, '').trim(); // Strip HTML tags
                return {
                    id: idx + 1,
                    title,
                    anchor: title.toLowerCase().replace(/\s+/g, '-')
                };
            });
            setTableOfContents(toc);
        }
    }, [story.content, story.sections]);


    return (
        <article className="bg-white">
            {/* Breadcrumb & Header */}
            <div className="border-b border-zinc-100 bg-white">
                <div className="container max-w-4xl mx-auto py-8 px-4">
                    <Link
                        href="/stories"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-6 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Stories
                    </Link>

                    {/* Category Badge */}
                    <div className="mb-4">
                        {story.categorySlug ? (
                            <Link href={`/categories/${story.categorySlug}`}>
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 text-xs font-semibold rounded-md">
                                    {story.category}
                                </Badge>
                            </Link>
                        ) : (
                            <Badge className="bg-orange-500 text-white border-none px-3 py-1 text-xs font-semibold rounded-md">
                                {story.category}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
                        {story.title}
                    </h1>

                    {/* Author & Date */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold text-sm">
                                {(story.author && story.author.length > 0) ? story.author.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <span className="font-medium">By {story.author || 'Editorial Team'}</span>
                        </div>
                        <span className="text-zinc-400">•</span>
                        <span>{story.publishDate || 'Feb 4, 2026'}</span>
                        {story.city && (
                            <>
                                <span className="text-zinc-400">•</span>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{story.city}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {story.thumbnail && (
                <div className="container max-w-4xl mx-auto py-8 px-4">
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-zinc-100">
                        <img
                            src={story.thumbnail}
                            alt={story.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Main Content - Centered */}
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <div className="space-y-8">
                    {/* TL;DR Card */}
                    {story.excerpt && (
                        <div className="bg-orange-50 border border-orange-100 p-6 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="h-5 w-5 text-orange-600" />
                                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">TL;DR</h2>
                            </div>
                            <p className="text-zinc-700 leading-relaxed">
                                {story.excerpt}
                            </p>
                        </div>
                    )}

                    {/* Table of Contents */}
                    {tableOfContents.length > 0 && (
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg" suppressHydrationWarning>
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Table of Contents</h2>
                            </div>
                            <ol className="space-y-3">
                                {tableOfContents.map((item) => (
                                    <li key={item.id} className="flex items-start gap-3">
                                        <span className="text-sm font-semibold text-orange-600 leading-none mt-0.5">{item.id}.</span>
                                        <a
                                            href={`#${item.anchor}`}
                                            className="text-sm font-medium text-zinc-700 hover:text-orange-600 transition-colors"
                                        >
                                            {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Startup Info Card - Inline if available */}
                    {story.related_startup && (
                        <Card className="border border-zinc-200 p-6 rounded-lg bg-white">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {story.related_startup.logo ? (
                                        <img src={story.related_startup.logo} alt={story.related_startup.name} className="h-full w-full object-contain p-2" />
                                    ) : (
                                        <Building2 className="h-8 w-8 text-zinc-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-zinc-900 mb-1">{story.related_startup.name}</h3>
                                    <p className="text-sm text-zinc-600 mb-3">{story.related_startup.city || story.city}</p>
                                    {story.related_startup.slug && (
                                        <Link href={`/startups/${story.related_startup.slug}`}>
                                            <Button size="sm" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-md">
                                                Visit Website
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Story Content */}
                    {story.content ? (
                        <div
                            className="prose prose-lg max-w-none 
                                prose-headings:font-bold prose-headings:text-zinc-900
                                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                                prose-p:text-zinc-700 prose-p:leading-relaxed prose-p:mb-5
                                prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-zinc-900 prose-strong:font-semibold
                                prose-ul:my-4 prose-li:text-zinc-700
                                prose-img:rounded-lg prose-img:my-8"
                            dangerouslySetInnerHTML={{ __html: story.content }}
                        />
                    ) : (
                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-12 text-center">
                            <p className="text-zinc-500 text-sm">No content available for this story yet.</p>
                        </div>
                    )}

                    {/* Share Footer */}
                    <div className="mt-12 pt-8 border-t border-zinc-200">
                        <p className="text-sm font-semibold text-zinc-900 mb-4">Share this story</p>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="rounded-md">
                                <Linkedin className="h-4 w-4 mr-2" />
                                LinkedIn
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-md">
                                <Twitter className="h-4 w-4 mr-2" />
                                Twitter
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-md">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Copy Link
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Stories */}
            {relatedStories.length > 0 && (
                <section className="bg-zinc-50 py-16">
                    <div className="container max-w-6xl mx-auto px-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-8">
                            Related Stories
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedStories.map((s) => (
                                <StoryCard key={s.slug} {...s} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* More from City */}
            {cityStartups.length > 0 && story.city && (
                <section className="border-t border-zinc-200 py-16 bg-white">
                    <div className="container max-w-6xl mx-auto px-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-8">
                            More Startups from {story.city}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {cityStartups.slice(0, 4).map((startup) => (
                                <Link
                                    key={startup.slug}
                                    href={`/startups/${startup.slug}`}
                                    className="flex flex-col items-center p-4 rounded-lg hover:bg-zinc-50 transition-colors border border-zinc-100 hover:border-zinc-200"
                                >
                                    <div className="w-16 h-16 rounded-lg bg-zinc-50 flex items-center justify-center mb-3 border border-zinc-100 overflow-hidden">
                                        {startup.logo ? (
                                            <img src={startup.logo} alt={startup.name} className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <Building2 className="h-8 w-8 text-zinc-300" />
                                        )}
                                    </div>
                                    <p className="font-semibold text-sm text-zinc-900 text-center mb-1">{startup.name}</p>
                                    <p className="text-xs text-zinc-500">{startup.category}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </article>
    );
}
