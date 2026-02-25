"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Save, Loader2, Trash2, Plus, ChevronUp, ChevronDown, Rocket, Sparkles, X, Settings, Layout, Globe, MessageSquare, Image as ImageIcon, Type, Link as LinkIcon, Menu as MenuIcon, Eye, PanelBottom, TrendingUp, Building2, MapPin, ArrowRight, User, Monitor, Tablet, Smartphone, Mail
} from "lucide-react";
// import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { fetchAPI, getPageById, generateContent } from "@/lib/api";
import { getPromptTemplate, fillTemplate } from "@/lib/prompt-manager";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import Link from "next/link";
import Image from "next/image";
import { getSafeImageSrc } from "@/lib/images";
import { getIcon } from "@/lib/icons";

// ── Actual Frontend Card Components for High Fidelity Preview ──

// Story Card Component - Matching frontend/src/components/cards/StoryCard.tsx
function PreviewStoryCard({ slug, title, thumbnail, category, categorySlug, city, citySlug, publishDate, featured, isFeatured, og_image, excerpt }: any) {
    const thumbnailSrc = getSafeImageSrc(thumbnail || og_image);
    const isSvgThumbnail = thumbnailSrc.toLowerCase().endsWith(".svg");
    const isFeaturedCard = featured || isFeatured;

    if (isFeaturedCard) {
        return (
            <div className="card-editorial relative overflow-hidden aspect-[16/10] md:aspect-[2/1] group rounded-xl">
                <img
                    src={thumbnailSrc}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none">
                    <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                        {category && <span className="badge-category relative z-20 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{category}</span>}
                        {city && <span className="badge-city relative z-20 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{city}</span>}
                    </div>

                    <h2 className="text-xl md:text-3xl font-bold text-white mb-2 pointer-events-auto">{title}</h2>
                    <p className="text-white/80 text-sm md:text-sm max-w-2xl line-clamp-2 mb-3">{excerpt || "No excerpt available."}</p>
                    <time className="text-white/60 text-xs">{publishDate}</time>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col group relative bg-transparent transition-all duration-300">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                <img
                    src={thumbnailSrc}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex flex-col flex-1 px-1">
                <div className="mb-2 relative z-20 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[#D94111]" />
                    {category && (
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#D94111]">
                            {category}
                        </span>
                    )}
                </div>

                <h3 className="text-[14px] font-bold text-zinc-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug tracking-tight">
                    {title}
                </h3>

                <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-semibold tracking-tight pt-2 border-t border-zinc-50 mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
                    <span>8 min read</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-zinc-300" />
                    <time>{publishDate}</time>
                </div>
            </div>
        </div>
    );
}

// Startup Card Component - Matching frontend/src/components/cards/StartupCard.tsx
function PreviewStartupCard({ slug, name, tagline, logo, category, city, stage, funding_stage, team_size = "100+", og_image, is_featured }: any) {
    const displayCategory = typeof category === 'object' ? category.name : category;
    const displayCity = typeof city === 'object' ? city.name : city;
    const logoSrc = getSafeImageSrc(logo || og_image);
    const displayStage = funding_stage ?? stage ?? "Series A";

    return (
        <div className="group relative bg-white rounded-xl border border-zinc-100 hover:border-orange-200/50 p-3 flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-50/20 to-transparent -mr-12 -mt-12 rounded-full transition-transform group-hover:scale-125" />

            {is_featured && (
                <div className="absolute top-2.5 right-2.5 z-20">
                    <div className="bg-amber-100/50 backdrop-blur-sm text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Sparkles size={7} fill="currentColor" />
                        Featured
                    </div>
                </div>
            )}

            <div className="flex gap-2.5 mb-2.5 relative z-20">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-zinc-100 flex-shrink-0 relative flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow group-hover:scale-105 duration-300">
                    {logo || og_image ? (
                        <img
                            src={logoSrc}
                            alt={`${name} logo`}
                            className="w-full h-full object-contain p-1.5"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-400 font-bold text-sm">
                            {name?.[0]}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-[13px] text-zinc-900 leading-tight group-hover:text-orange-600 transition-colors truncate">
                        {name}
                    </h3>
                    <p className="text-zinc-500 text-[10px] leading-snug mt-0.5 line-clamp-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {tagline || `${displayCategory} startup.`}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 mt-auto mb-2.5 relative z-20">
                <span className="px-1.5 py-0.5 rounded-md bg-zinc-50 text-zinc-500 text-[8px] font-black uppercase tracking-widest border border-zinc-100/50">
                    {displayCategory}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-orange-50/80 text-orange-600 text-[8px] font-black uppercase tracking-widest border border-orange-100/30 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />
                    {displayStage}
                </span>
            </div>

            <div className="pt-2 border-t border-zinc-50 flex items-center justify-between relative z-20 opacity-70 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-zinc-400" />
                    <span className="text-[9px] font-bold text-zinc-500 tracking-tight">{displayCity}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Building2 size={10} className="text-zinc-400" />
                    <span className="text-[9px] font-bold text-zinc-500 tracking-tight">{team_size}</span>
                </div>
            </div>
        </div>
    );
}

// Category Card Component - Matching frontend/src/components/cards/CategoryCard.tsx
function PreviewCategoryCard({ slug, name, icon, startupCount, storyCount = 0, description, variant = "card" }: any) {
    const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
        "fintech": { bg: "bg-[#E6F4F1]", text: "text-[#006953]", icon: "text-[#00A884]" },
        "saas": { bg: "bg-[#E8F0FE]", text: "text-[#174EA6]", icon: "text-[#1A73E8]" },
        "ecommerce": { bg: "bg-[#FEF1E8]", text: "text-[#B05500]", icon: "text-[#E67E22]" },
        "edtech": { bg: "bg-[#F3E8FF]", text: "text-[#6A1B9A]", icon: "text-[#8E44AD]" },
        "healthtech": { bg: "bg-[#FEF2F2]", text: "text-[#C62828]", icon: "text-[#E74C3C]" },
        "mobility": { bg: "bg-[#E6F9F9]", text: "text-[#00838F]", icon: "text-[#00BCD4]" },
        "d2c": { bg: "bg-[#FCE7F3]", text: "text-[#AD1457]", icon: "text-[#D81B60]" },
        "agritech": { bg: "bg-[#ECFDF5]", text: "text-[#065F46]", icon: "text-[#059669]" },
        "proptech": { bg: "bg-[#FFFBEB]", text: "text-[#92400E]", icon: "text-[#D97706]" },
        "gaming": { bg: "bg-[#EEF2FF]", text: "text-[#3730A3]", icon: "text-[#4F46E5]" },
        "travel": { bg: "bg-[#FFF1F2]", text: "text-[#9F1239]", icon: "text-[#E11D48]" },
        "cybersecurity": { bg: "bg-[#F8FAFC]", text: "text-[#334155]", icon: "text-[#475569]" },
    };

    const normalizedSlug = (slug || name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const style = CATEGORY_STYLES[normalizedSlug] || { bg: "bg-zinc-50", text: "text-zinc-900", icon: "text-zinc-600" };
    const displayStories = storyCount ?? 0;

    // Use getIcon to resolve the icon component
    const IconComponent = icon
        ? (typeof icon === 'string' ? getIcon(icon) : icon)
        : getIcon(normalizedSlug);

    if (variant === "banner") {
        return (
            <div className={`rounded-xl p-5 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center gap-4 ${style.bg}`}>
                <div className="bg-white h-12 w-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <IconComponent className={`h-6 w-6 ${style.icon}`} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-lg font-serif font-bold truncate ${style.text}`}>{name}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 text-zinc-600 shrink-0 whitespace-nowrap bg-white/50 px-2 py-0.5 rounded-full">
                            {startupCount} Startups
                        </span>
                    </div>
                    <p className="text-xs leading-snug text-zinc-600 line-clamp-2 font-medium opacity-90 pr-2">{description}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 h-full border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner ${style.bg.replace('bg-', 'bg-opacity-20 bg-')}`}>
                <IconComponent className={`h-6 w-6 ${style.icon}`} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
                <h3 className={`font-bold text-lg font-serif group-hover:opacity-80 transition-opacity ${style.text}`}>{name}</h3>
                <p className="text-xs text-zinc-400 font-medium">{displayStories} stories</p>
            </div>
        </div>
    );
}

// City Card Component - Matching frontend/src/components/cards/CityCard.tsx
function PreviewCityCard({ slug, name, image, startupCount, storyCount, tier }: any) {
    const imageSrc = getSafeImageSrc(image);
    const formattedStartupCount = (startupCount || 0).toLocaleString('en-IN');

    return (
        <div className="relative overflow-hidden rounded-xl w-full h-40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
            <img
                src={imageSrc}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {tier && String(tier) !== '1' && (
                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full backdrop-blur-md border text-[9px] font-black uppercase tracking-wider shadow-lg ${String(tier) === '2'
                    ? "bg-orange-500/90 border-orange-400/50 text-white"
                    : "bg-amber-500/90 border-amber-400/50 text-white"
                    }`}>
                    Tier {tier}
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-base font-bold text-white leading-tight drop-shadow">{name}</h3>
                <p className="text-white/80 text-xs font-medium mt-0.5">{formattedStartupCount} startups</p>
            </div>
        </div>
    );
}

const ADMIN_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8000";
const MEDIA_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8000";

type SectionType = "hero" | "text" | "image" | "video" | "banner" |
    "featured_stories" | "latest_stories" | "featured_startups" |
    "startup_cards" | "category_grid" | "city_grid" | "rising_hubs" | "newsletter" | "cta" | "trending_stories" | "custom_content" |
    "mission_vision" | "stats_bar" | "team_grid" | "values_grid" |
    "policy_section" | "faq" | "callout" | "related_cards" | "image_gallery" | "table_of_contents";

type SectionSettings = {
    title?: string;
    subtitle?: string;
    body?: string;
    imageUrl?: string;
    videoUrl?: string;
    caption?: string;
    buttonText?: string;
    buttonLink?: string;
    align?: "left" | "center" | "right";
    backgroundColor?: string;
    textColor?: string;
    padding?: number;
    paddingY?: number;
    paddingX?: number;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    borderRadius?: number;
    titleSize?: number;
    textSize?: number;
    contentWidth?: "full" | "wide" | "normal" | "narrow";
    items?: any[]; // generic list items
    icon?: string;
    cards?: Array<{ icon?: string; title?: string; description?: string; role?: string; image?: string; stat_value?: string; stat_label?: string; color?: string; link?: string; type?: string; question?: string; answer?: string }>;
    customId?: string;
    altText?: string;
    fontFamily?: string;
    fontSize?: number;
    linkRel?: string;
    buttonStyle?: "primary" | "secondary" | "outline";
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    secondaryButtonStyle?: "primary" | "secondary" | "outline";
    extraButtons?: Array<{ text: string; link: string; style: "primary" | "secondary" | "outline" }>;
};

type PageSection = {
    id: string;
    type: SectionType;
    settings: SectionSettings;
    is_active?: boolean;
    db_id?: number;
};

// Moved outside to prevent re-renders losing focus
const AiInputWithRewrite = ({
    value,
    onChange,
    label,
    fieldName,
    sectionId,
    itemIndex,
    itemField,
    textarea = false,
    rich = false,
    aiLoading,
    onAiRewrite
}: any) => {
    return (
        <div className="space-y-2 w-full relative group/ai">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase text-slate-500">{label}</Label>
                <button
                    onClick={() => onAiRewrite && onAiRewrite(value, fieldName || itemField || 'content', sectionId, itemIndex, itemField)}
                    disabled={!!aiLoading || !value}
                    className="opacity-0 group-hover/ai:opacity-100 transition-all text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                    <Sparkles size={10} /> AI Improve
                </button>
            </div>
            {rich ? (
                <RichTextEditor content={value || ""} onChange={onChange} placeholder={label} />
            ) : textarea ? (
                <Textarea
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className="min-h-[100px] text-sm"
                    placeholder={label}
                />
            ) : (
                <Input
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className="h-10 text-sm"
                    placeholder={label}
                />
            )}
        </div>
    );
};

// Moved outside to prevent re-renders
const TabButton = ({
    id,
    label,
    active,
    onClick,
    icon: Icon
}: {
    id: string;
    label: string;
    active: string;
    onClick: (id: string) => void;
    icon?: React.ElementType;
}) => {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-2 whitespace-nowrap",
                isActive
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
            )}
        >
            {Icon && <Icon size={14} />}
            {label}
        </button>
    );
};

// Preview Component mimicking HomeContent.tsx
function SectionPreview({ section, sampleData, viewport = 'desktop' }: { section: PageSection, sampleData?: any, viewport?: string }) {
    if (!section) return null;

    const { type, settings } = section;
    const { stories = [], startups = [], cities = [], categories = [] } = sampleData || {};
    // Use saved padding or defaults matching frontend
    const paddingY = settings.paddingY !== undefined ? settings.paddingY : null; // Frontend defaults handle null
    const paddingX = settings.paddingX !== undefined ? settings.paddingX : null;
    const bgColor = settings.backgroundColor || '#ffffff';
    const textColor = settings.textColor || '#0F172A';
    const align = settings.align || 'left';

    // Helper for icons
    const IconMap: Record<string, any> = { 'TrendingUp': TrendingUp, 'Building2': Building2, 'MapPin': MapPin, 'Sparkles': Sparkles, 'Image': ImageIcon };
    const getIcon = (name: string) => IconMap[name] || Sparkles;

    return (
        <div className={cn(
            "border rounded-xl mb-6 bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden transition-all duration-500 mx-auto",
            viewport === 'tablet' ? "max-w-[768px]" : viewport === 'mobile' ? "max-w-[375px]" : "max-w-full"
        )}>
            <div className="bg-slate-50 border-b px-4 py-2 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Eye size={12} /> Live Preview ({viewport})
                </h3>
                <span className="text-[10px] text-slate-400">Renders exactly as on frontend</span>
            </div>

            <div className="preview-container isolate">
                {/* Switch case matching HomeContent.tsx */}
                {(() => {
                    switch (type) {
                        case 'hero':
                            return (
                                <section className="relative overflow-hidden" style={{ backgroundColor: bgColor, paddingTop: paddingY ?? 32, paddingBottom: paddingY ?? 40, paddingLeft: paddingX ?? 0, paddingRight: paddingX ?? 0 }}>
                                    <div className={cn(
                                        "container-wide relative z-10",
                                        align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                                    )}>
                                        <h1
                                            className={cn(
                                                "text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 max-w-4xl leading-[1.1] tracking-tight",
                                                align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto'
                                            )}
                                            style={{ color: textColor }}
                                        >
                                            {settings.title || "Hero Title"}
                                        </h1>
                                        {(settings.subtitle || settings.body) && (
                                            <div
                                                className={cn(
                                                    "text-base md:text-lg mb-8 max-w-2xl leading-relaxed opacity-90 prose prose-slate decoration-slate-400",
                                                    align === 'left' ? 'text-left mr-auto ml-0' : align === 'right' ? 'text-right ml-auto mr-0' : 'text-center mx-auto',
                                                    (textColor === '#FFFFFF' || (textColor === '#0F172A')) ? 'prose-invert' : 'prose-zinc'
                                                )}
                                                style={{ color: textColor }}
                                                dangerouslySetInnerHTML={{ __html: (settings.subtitle || settings.body) || "" }}
                                            />
                                        )}
                                        <div className={cn(
                                            "flex flex-col sm:flex-row items-center gap-5",
                                            align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
                                        )}>
                                            <Button size="lg" className={cn(
                                                "w-full sm:w-auto h-14 px-10 rounded-xl border-none items-center gap-2 transition-all",
                                                settings.buttonStyle === 'secondary' ? "bg-white hover:bg-zinc-100 text-slate-900 border border-zinc-200" :
                                                    settings.buttonStyle === 'outline' ? "bg-transparent border-2 border-current hover:bg-white/10" :
                                                        "bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/20"
                                            )}>
                                                <span className="font-bold text-lg">{settings.buttonText || "Explore Stories"}</span>
                                                <ArrowRight className="h-5 w-5" />
                                            </Button>
                                            <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl bg-white hover:bg-zinc-100 text-slate-900 border-none">
                                                <span className="font-bold text-lg">Submit Your Journey</span>
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Mock background pattern if needed */}
                                    <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10 bg-[url('/grid.svg')]"></div>
                                </section>
                            );

                        case 'featured_stories':
                        case 'latest_stories':
                        case 'trending_stories':
                            return (
                                <section style={{ paddingTop: paddingY ?? 20, paddingBottom: paddingY ?? 20, backgroundColor: bgColor }}>
                                    <div className="container-wide px-4">
                                        <div className="flex items-baseline justify-between mb-8 border-b border-zinc-100 pb-4">
                                            <h2 className="text-3xl font-bold mb-0" style={{ color: textColor }}>{settings.title || "Stories"}</h2>
                                            <div className="text-orange-600 font-bold text-sm flex items-center gap-1">View All <ArrowRight size={14} /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {(settings.items && settings.items.length > 0 ? settings.items : (stories.length > 0 ? stories : [1, 2, 3, 4])).map((item: any, i: number) => (
                                                <PreviewStoryCard
                                                    key={i}
                                                    slug={item.slug || "sample-story"}
                                                    title={item.title || "Sample Story Title"}
                                                    excerpt={item.excerpt || item.description || item.summary || (item.content ? item.content.substring(0, 120) + "..." : "Sample story excerpt that gives a preview of the content...")}
                                                    thumbnail={item.thumbnail || item.image || item.thumbnail_image || "/placeholder.jpg"}
                                                    category={item.category || item.category_name || "Category"}
                                                    categorySlug={item.category_slug}
                                                    city={item.city || item.city_name}
                                                    citySlug={item.city_slug}
                                                    publishDate={item.date || item.created_at ? new Date(item.created_at || item.date).toLocaleDateString() : "Just now"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'category_grid':
                            return (
                                <section style={{ backgroundColor: bgColor, paddingTop: paddingY ?? 32, paddingBottom: paddingY ?? 32 }}>
                                    <div className="container-wide px-4">
                                        <div className="flex items-baseline justify-between mb-10">
                                            <h2 className="text-3xl font-bold" style={{ color: textColor }}>{settings.title || "Deep Dive by Indutry"}</h2>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {(settings.items && settings.items.length > 0 ? settings.items : (categories.length > 0 ? categories : [1, 2, 3, 4])).map((item: any, i: number) => (
                                                <PreviewCategoryCard
                                                    key={i}
                                                    name={item.title || item.name || "Category Name"}
                                                    slug={item.slug}
                                                    icon={item.icon}
                                                    startupCount={item.startup_count ?? item.startupCount ?? 0}
                                                    storyCount={item.story_count ?? item.storyCount ?? 0}
                                                    description={item.description || "Category description goes here."}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'city_grid':
                        case 'rising_hubs':
                            return (
                                <section style={{ backgroundColor: bgColor, paddingTop: paddingY ?? 40, paddingBottom: paddingY ?? 48 }}>
                                    <div className="container-wide px-4">
                                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                                            <div className="max-w-3xl">
                                                {type === 'rising_hubs' && (
                                                    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600 mb-4 bg-orange-50 px-3 py-1 rounded-full border border-orange-100/50">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                        Emerging Markets
                                                    </div>
                                                )}
                                                <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 text-slate-900 leading-tight">
                                                    {settings.title || (type === 'city_grid' ? "Explore by City" : "Rising Startup Hubs")}
                                                </h2>
                                                {settings.subtitle && (
                                                    <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                                                        {settings.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="hidden lg:flex gap-3">
                                                <Button variant="outline" className="rounded-full border-zinc-200">View Map</Button>
                                                <Button className="rounded-full bg-[#0F172A] text-white">All Cities</Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                                            {(settings.items && settings.items.length > 0 ? settings.items : (cities.length > 0 ? cities : [1, 2, 3, 4])).map((item: any, i: number) => (
                                                <PreviewCityCard
                                                    key={i}
                                                    slug={item.slug}
                                                    name={item.title || item.name || "City Name"}
                                                    image={item.image || item.thumbnail || "/placeholder.jpg"}
                                                    startupCount={item.startup_count || item.startupCount || 500}
                                                    storyCount={item.story_count || item.storyCount || 20}
                                                    tier={item.tier || "1"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'featured_startups':
                        case 'startup_cards':
                            return (
                                <section style={{ backgroundColor: bgColor, paddingTop: paddingY ?? 32, paddingBottom: paddingY ?? 32 }}>
                                    <div className="container-wide px-4">
                                        <div className="flex items-center gap-3 mb-10">
                                            <Sparkles className="h-6 w-6 text-orange-600 fill-orange-600" />
                                            <h2 className="text-3xl font-bold text-[#0F172A]">{settings.title || "Featured Startups"}</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {(settings.items && settings.items.length > 0 ? settings.items : (startups.length > 0 ? startups : [1, 2, 3])).map((item: any, i: number) => (
                                                <PreviewStartupCard
                                                    key={i}
                                                    slug={item.slug}
                                                    name={item.title || item.name || item.company_name || "Startup Name"}
                                                    tagline={item.description || item.tagline || "Innovating the future..."}
                                                    logo={item.logo || item.image || "/placeholder.jpg"}
                                                    category={item.category || item.category_name || "Tech"}
                                                    city={item.city || item.city_name || "Bangalore"}
                                                    stage={item.stage || item.funding_stage}
                                                    team_size={item.team_size}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'cta':
                            return (
                                <section
                                    className={cn(
                                        "py-12 overflow-hidden relative",
                                        align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                                    )}
                                    style={{
                                        backgroundColor: bgColor || '#0F172A',
                                        paddingTop: paddingY ?? 48,
                                        paddingBottom: paddingY ?? 48,
                                        paddingLeft: paddingX ?? 10,
                                        paddingRight: paddingX ?? 10
                                    }}
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-white/20 to-orange-600" />
                                    <div className="container-wide relative z-10 px-4">
                                        <h2
                                            className={cn(
                                                "text-3xl md:text-5xl font-bold mb-6 font-serif",
                                                align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto'
                                            )}
                                            style={{ color: textColor || '#ffffff' }}
                                        >
                                            {settings.title || "Ready to launch?"}
                                        </h2>
                                        {(settings.subtitle || settings.body) && (
                                            <div
                                                className={cn(
                                                    "text-lg md:text-xl mb-10 max-w-2xl opacity-80 prose prose-invert",
                                                    align === 'left' ? 'text-left mr-auto ml-0' : align === 'right' ? 'text-right ml-auto mr-0' : 'text-center mx-auto'
                                                )}
                                                style={{ color: textColor || '#ffffff' }}
                                                dangerouslySetInnerHTML={{ __html: (settings.subtitle || settings.body) || "" }}
                                            />
                                        )}
                                        <div className={cn(
                                            "flex flex-col sm:flex-row gap-4",
                                            align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
                                        )}>
                                            <Button size="lg" className={cn(
                                                "h-14 px-8 rounded-full text-lg font-medium border-none shadow-xl transition-all",
                                                settings.buttonStyle === 'secondary' ? "bg-white hover:bg-zinc-100 text-slate-900 border border-zinc-200" :
                                                    settings.buttonStyle === 'outline' ? "bg-transparent border-2 border-current hover:bg-white/10" :
                                                        "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-900/20"
                                            )}>
                                                {settings.buttonText || "Get Started"}
                                            </Button>
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'text':
                            return (
                                <section style={{ backgroundColor: bgColor, paddingTop: paddingY ?? 32, paddingBottom: paddingY ?? 32, paddingLeft: paddingX ?? 0, paddingRight: paddingX ?? 0, textAlign: align }}>
                                    <div className="container-wide px-4">
                                        <div className={cn(
                                            "max-w-4xl",
                                            align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto'
                                        )}>
                                            {settings.title && <h2 className="text-3xl font-bold mb-6" style={{ color: textColor }}>{settings.title}</h2>}
                                            <div
                                                className={cn(
                                                    "prose prose-lg max-w-none",
                                                    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                                                )}
                                                dangerouslySetInnerHTML={{ __html: settings.body || "<p>Content goes here...</p>" }}
                                                style={{ color: textColor }}
                                            />
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'image':
                            return (
                                <section style={{ backgroundColor: bgColor, paddingTop: paddingY ?? 32, paddingBottom: paddingY ?? 32, paddingLeft: paddingX ?? 0, paddingRight: paddingX ?? 0, textAlign: align }}>
                                    <div className={cn(
                                        "container-wide px-4",
                                        settings.contentWidth === 'narrow' ? 'max-w-4xl mx-auto' : ''
                                    )}>
                                        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-slate-100">
                                            {settings.imageUrl ? (
                                                <img
                                                    src={getSafeImageSrc(settings.imageUrl)}
                                                    alt={settings.altText || settings.title || "Image"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                    <ImageIcon size={48} className="mb-3 opacity-30" />
                                                    <p className="text-sm font-medium">No image selected</p>
                                                    <p className="text-xs opacity-60 mt-1">Pick one from the Media card →</p>
                                                </div>
                                            )}
                                        </div>
                                        {settings.caption && (
                                            <p
                                                className={cn(
                                                    "text-sm text-slate-500 mt-4 italic",
                                                    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center mx-auto'
                                                )}
                                            >
                                                {settings.caption}
                                            </p>
                                        )}
                                    </div>
                                </section>
                            );

                            function SectionPreview({ section, viewport }: { section: any, viewport: string }) {
                                if (!section) return null;

                                const type = section.section_type || section.type;
                                const settings = section.settings || {};

                                // ─── HELPER FOR SECTION STYLES (MATCHES FRONTEND) ───
                                const getBaseStyles = (s: any, fallbackPY = 80) => {
                                    const bg = s.backgroundColor || (s.type === 'hero' ? 'transparent' : (s.backgroundColor || '#ffffff'));

                                    return {
                                        backgroundColor: bg,
                                        paddingTop: s.paddingY !== undefined && s.paddingY !== null ? s.paddingY : fallbackPY,
                                        paddingBottom: s.paddingY !== undefined && s.paddingY !== null ? s.paddingY : fallbackPY,
                                        paddingLeft: s.paddingX !== undefined && s.paddingX !== null ? s.paddingX : undefined,
                                        paddingRight: s.paddingX !== undefined && s.paddingX !== null ? s.paddingX : undefined,
                                        marginTop: s.marginTop !== undefined ? s.marginTop : undefined,
                                        marginBottom: s.marginBottom !== undefined ? s.marginBottom : undefined,
                                        marginLeft: s.marginLeft !== undefined ? s.marginLeft : undefined,
                                        marginRight: s.marginRight !== undefined ? s.marginRight : undefined,
                                        textAlign: (s.align || 'left') as any,
                                        fontFamily: s.fontFamily && s.fontFamily !== 'inherit' ? s.fontFamily : 'inherit',
                                        fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
                                        color: s.textColor || undefined,
                                    };
                                };

                                const sectionStyles = getBaseStyles(section);
                                const titleStyle = {
                                    color: sectionStyles.color,
                                    fontFamily: sectionStyles.fontFamily,
                                    textAlign: sectionStyles.textAlign
                                };
                                const align = settings.align || 'left';

                                return (
                                    <div className={cn(
                                        "border border-dashed border-slate-200 rounded-lg overflow-hidden my-4 transition-all bg-white relative",
                                        viewport === 'mobile' ? 'max-w-[375px] mx-auto' : viewport === 'tablet' ? 'max-w-[768px] mx-auto' : 'w-full'
                                    )}>
                                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-[10px] uppercase tracking-wider">{type}</Badge>
                                        </div>

                                        <div className="preview-content scale-[0.9] origin-top transform-gpu -mb-[10%] min-h-[100px]">
                                            {(() => {
                                                switch (type) {
                                                    case 'hero':
                                                        return (
                                                            <section style={sectionStyles} className="relative overflow-hidden">
                                                                <div className="px-6 relative z-10 py-6">
                                                                    <h1
                                                                        className={cn(
                                                                            "text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight tracking-tight",
                                                                            align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center mx-auto max-w-2xl'
                                                                        )}
                                                                        style={titleStyle}
                                                                    >
                                                                        {settings.title || 'Welcome to StartupSaga'}
                                                                    </h1>
                                                                    <p
                                                                        className={cn(
                                                                            "text-base md:text-lg mb-8 opacity-90 leading-relaxed",
                                                                            align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center mx-auto max-w-xl'
                                                                        )}
                                                                        style={{ color: sectionStyles.color, fontFamily: sectionStyles.fontFamily }}
                                                                    >
                                                                        {settings.body || 'Empowering Indian entrepreneurs with stories that inspire and insights that matter.'}
                                                                    </p>
                                                                    <div className={cn(
                                                                        "flex flex-wrap gap-4",
                                                                        align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
                                                                    )}>
                                                                        <Button className="bg-orange-600 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-orange-600/20">{settings.buttonText || 'Explore Stories'}</Button>
                                                                        {settings.secondaryButtonText && <Button variant="outline" className="h-12 px-8 rounded-xl">{settings.secondaryButtonText}</Button>}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'text':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    {settings.title && <h2 className="text-3xl font-bold mb-4" style={titleStyle}>{settings.title}</h2>}
                                                                    <div
                                                                        className={cn(
                                                                            "prose prose-slate max-w-none",
                                                                            align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                                                                        )}
                                                                        dangerouslySetInnerHTML={{ __html: settings.body || '<p>Add your text content here...</p>' }}
                                                                        style={{ color: sectionStyles.color, fontFamily: sectionStyles.fontFamily, fontSize: sectionStyles.fontSize }}
                                                                    />
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'image':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group flex items-center justify-center">
                                                                        {settings.imageUrl ? (
                                                                            <img src={settings.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="text-slate-400 text-center">
                                                                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                                                                <p className="text-sm font-medium">No image selected</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {settings.caption && (
                                                                        <p
                                                                            className={cn(
                                                                                "text-sm text-slate-500 mt-4 italic",
                                                                                align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center mx-auto'
                                                                            )}
                                                                            style={{ color: sectionStyles.color, fontFamily: sectionStyles.fontFamily }}
                                                                        >
                                                                            {settings.caption}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'custom_content':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    <div
                                                                        className={cn(
                                                                            "max-w-4xl",
                                                                            align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto'
                                                                        )}
                                                                    >
                                                                        {settings.title && <h2 className="text-3xl font-bold mb-6" style={titleStyle}>{settings.title}</h2>}
                                                                        <div
                                                                            className={cn(
                                                                                "prose prose-lg max-w-none",
                                                                                align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                                                                            )}
                                                                            dangerouslySetInnerHTML={{ __html: settings.body || '<p>Custom content goes here...</p>' }}
                                                                            style={{ color: sectionStyles.color, fontFamily: sectionStyles.fontFamily, fontSize: sectionStyles.fontSize }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'mission_vision':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    {settings.title && (
                                                                        <div className={cn(
                                                                            "mb-10",
                                                                            align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
                                                                        )}>
                                                                            <h2 className="text-3xl font-bold" style={titleStyle}>{settings.title}</h2>
                                                                            {settings.subtitle && <p className="text-slate-500 mt-2 text-lg">{settings.subtitle}</p>}
                                                                        </div>
                                                                    )}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        {(settings.cards && settings.cards.length > 0 ? settings.cards : [
                                                                            { icon: '🎯', title: 'Our Mission', description: 'StartupSaga.in was founded with a simple belief: every founder\'s journey deserves to be told.', color: '#FEF3E8' },
                                                                            { icon: '🌐', title: 'Our Vision', description: 'To become India\'s most trusted platform for startup news, insights, and community.', color: '#EEF6FF' }
                                                                        ]).map((card: any, i: number) => (
                                                                            <div key={i} className="rounded-2xl p-6 border border-slate-100" style={{ backgroundColor: card.color || '#F8FAFC' }}>
                                                                                <div className="flex items-center gap-3 mb-4">
                                                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                                                                                        {card.icon || '⭐'}
                                                                                    </div>
                                                                                    <h3 className="text-xl font-bold text-slate-900">{card.title || 'Section Title'}</h3>
                                                                                </div>
                                                                                <p className="text-slate-600 leading-relaxed">{card.description || 'Add a description for this card.'}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'stats_bar':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    {settings.title && (
                                                                        <h2 className="text-2xl font-bold mb-8" style={titleStyle}>
                                                                            {settings.title}
                                                                        </h2>
                                                                    )}
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                        {(settings.cards && settings.cards.length > 0 ? settings.cards : [
                                                                            { stat_value: '5,000+', stat_label: 'Startups Covered' },
                                                                            { stat_value: '10,000+', stat_label: 'Stories Published' },
                                                                            { stat_value: '2M+', stat_label: 'Monthly Readers' },
                                                                            { stat_value: '50+', stat_label: 'Cities Tracked' }
                                                                        ]).map((card: any, i: number) => (
                                                                            <div key={i} className="text-center p-6 rounded-2xl border border-slate-100 bg-white shadow-sm">
                                                                                <div className="text-3xl font-black text-orange-500 mb-1">{card.stat_value || '0'}</div>
                                                                                <div className="text-sm text-slate-500 font-medium">{card.stat_label || 'Stat Label'}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'team_grid':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    <div className={cn("flex items-center gap-3 mb-10", align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center')}>
                                                                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><User size={18} /></div>
                                                                        <h2 className="text-2xl font-bold" style={titleStyle}>{settings.title || 'Our Team'}</h2>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                                        {(settings.cards && settings.cards.length > 0 ? settings.cards : [
                                                                            { title: 'Team Member', role: 'Co-Founder', image: '' },
                                                                            { title: 'Team Member', role: 'Editor', image: '' }
                                                                        ]).map((card: any, i: number) => (
                                                                            <div key={i} className="group text-center">
                                                                                <div className="w-24 h-24 mx-auto rounded-2xl mb-3 bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                                                                    {card.image ? (
                                                                                        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <span className="text-2xl font-bold text-slate-400">{(card.title || 'T')[0]}</span>
                                                                                    )}
                                                                                </div>
                                                                                <h4 className="font-bold text-slate-900">{card.title || 'Name'}</h4>
                                                                                <p className="text-sm text-orange-500 font-medium">{card.role || 'Role'}</p>
                                                                                {card.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.description}</p>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'values_grid':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    <div className={cn("flex items-center gap-3 mb-10", align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center')}>
                                                                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">🏅</div>
                                                                        <h2 className="text-2xl font-bold" style={titleStyle}>{settings.title || 'Our Values'}</h2>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                                        {(settings.cards && settings.cards.length > 0 ? settings.cards : [
                                                                            { title: 'Authenticity', description: 'We tell real stories with honesty and integrity, celebrating both successes and failures.' },
                                                                            { title: 'Inclusivity', description: 'We believe entrepreneurship is for everyone, from metros to Tier-3 towns.' },
                                                                            { title: 'Impact', description: 'Every story we tell aims to inspire action and drive positive change.' }
                                                                        ]).map((card: any, i: number) => (
                                                                            <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                                                <h3 className="font-bold text-slate-900 text-lg mb-2">{card.title || 'Value Name'}</h3>
                                                                                <p className="text-slate-500 text-sm leading-relaxed">{card.description || 'Describe this core value.'}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'policy_section':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6 max-w-4xl mx-auto">
                                                                    {settings.title && <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-slate-200" style={titleStyle}>{settings.title}</h2>}
                                                                    <div className="prose prose-slate max-w-none text-sm leading-relaxed"
                                                                        dangerouslySetInnerHTML={{ __html: settings.body || '<p>Policy content goes here...</p>' }}
                                                                        style={{ color: sectionStyles.color, fontFamily: sectionStyles.fontFamily, fontSize: sectionStyles.fontSize }}
                                                                    />
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'faq':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6 max-w-3xl mx-auto">
                                                                    {settings.title && (
                                                                        <h2 className="text-2xl font-bold mb-8 text-center" style={titleStyle}>
                                                                            {settings.title}
                                                                        </h2>
                                                                    )}
                                                                    <div className="space-y-3">
                                                                        {(settings.cards && settings.cards.length > 0 ? settings.cards : [
                                                                            { question: 'What information do we collect?', answer: 'We collect information you provide directly.' },
                                                                            { question: 'How is your data used?', answer: 'To provide and improve our services.' }
                                                                        ]).map((card: any, i: number) => (
                                                                            <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                                                <p className="font-bold text-slate-900 mb-2">{card.question || card.title}</p>
                                                                                <p className="text-slate-500 text-sm leading-relaxed">{card.answer || card.description}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'callout':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    <div className="flex items-start gap-4 p-5 rounded-xl" style={{ backgroundColor: settings.backgroundColor || '#FEF3E8', border: `1px solid ${settings.textColor || '#F97316'}30` }}>
                                                                        <span className="text-2xl mt-0.5">{settings.icon || '⚠️'}</span>
                                                                        <div>
                                                                            {settings.title && <p className="font-bold mb-1" style={{ color: settings.textColor || '#9A3412' }}>{settings.title}</p>}
                                                                            <p className="text-sm leading-relaxed" style={{ color: settings.textColor || '#9A3412' }}>{settings.body || 'This is an important notice.'}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'related_cards':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    {settings.title && <h2 className="text-2xl font-bold mb-8" style={titleStyle}>{settings.title}</h2>}
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                        {(settings.cards && settings.cards.length > 0 ? settings.cards : [
                                                                            { title: 'Privacy Policy', description: 'How we handle your data.', link: '/privacy-policy', icon: '🔒' },
                                                                            { title: 'Cookie Policy', description: 'How we use cookies.', link: '/cookie-policy', icon: '🍪' }
                                                                        ]).map((card: any, i: number) => (
                                                                            <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all group no-underline">
                                                                                <span className="text-2xl">{card.icon || '📄'}</span>
                                                                                <div>
                                                                                    <p className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">{card.title}</p>
                                                                                    <p className="text-slate-500 text-xs mt-0.5">{card.description}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'image_gallery':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6">
                                                                    {settings.title && <h2 className="text-2xl font-bold mb-8" style={titleStyle}>{settings.title}</h2>}
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                                        {(settings.cards && settings.cards.length > 0 ? settings.cards : [
                                                                            { image: '', title: 'Image 1' }, { image: '', title: 'Image 2' }, { image: '', title: 'Image 3' }
                                                                        ]).map((card: any, i: number) => (
                                                                            <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                                                {card.image ? (
                                                                                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                                                        <span className="text-3xl mb-1">🖼️</span>
                                                                                        <span className="text-xs">{card.title || 'No image'}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'newsletter':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6 text-center">
                                                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 mb-6">
                                                                        <Mail className="h-8 w-8 text-orange-600" />
                                                                    </div>
                                                                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={titleStyle}>
                                                                        {settings.title || "Stay Updated with Startup Stories"}
                                                                    </h2>
                                                                    <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto" style={{ fontFamily: sectionStyles.fontFamily }}>
                                                                        {settings.body || "Get the latest startup stories, founder insights, and ecosystem updates delivered to your inbox every week."}
                                                                    </p>
                                                                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                                                        <div className="flex-1 h-12 bg-white border border-slate-200 rounded-lg flex items-center px-4 text-slate-400 text-sm">
                                                                            Enter your email
                                                                        </div>
                                                                        <Button type="button" className="bg-orange-600 text-white h-12 px-6 rounded-lg font-bold gap-2">
                                                                            {settings.buttonText || "Subscribe"}
                                                                            <ArrowRight className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    case 'table_of_contents':
                                                        return (
                                                            <section style={sectionStyles}>
                                                                <div className="px-6 max-w-2xl">
                                                                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                                        {settings.title && <p className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">{settings.title}</p>}
                                                                        <ol className="space-y-2">
                                                                            {(settings.cards && settings.cards.length > 0 ? settings.cards : [
                                                                                { title: 'Introduction', link: '#intro' },
                                                                                { title: 'Your Rights', link: '#rights' }
                                                                            ]).map((card: any, i: number) => (
                                                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                                                    <span className="text-orange-500 font-bold font-mono">{String(i + 1).padStart(2, '0')}</span>
                                                                                    <div className="text-slate-700">{card.title}</div>
                                                                                </li>
                                                                            ))}
                                                                        </ol>
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        );

                                                    default:
                                                        return <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">Preview not available for {type}</div>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                );
                            }


                        default:
                            return <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">Preview not available for {type}</div>;
                    }
                })()}
            </div>
        </div>
    );
}

export default function EditPage() {
    const params = useParams();
    const router = useRouter();
    const pageId = params?.id;

    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnapplied, setHasUnapplied] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("structure");
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    // Core Data
    const [formData, setFormData] = useState<any>({
        title: "",
        slug: "",
        content: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        status: "draft",
        theme_overrides: {
            sections: []
        }
    });

    // Always-fresh ref so handleSubmit never closes over stale formData
    const formDataRef = useRef<any>(null);
    useEffect(() => { formDataRef.current = formData; }, [formData]);

    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [recentStories, setRecentStories] = useState<any[]>([]);
    const [recentStartups, setRecentStartups] = useState<any[]>([]);
    const [initialSectionIds, setInitialSectionIds] = useState<number[]>([]);
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const addSectionMenuRef = useRef<HTMLDivElement | null>(null);

    // Close "Add Section" dropdown when clicking outside
    useEffect(() => {
        if (!addSectionOpen) return;
        const onDocClick = (e: MouseEvent) => {
            if (addSectionMenuRef.current && !addSectionMenuRef.current.contains(e.target as Node)) {
                setAddSectionOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [addSectionOpen]);

    // Initial Data Fetch
    useEffect(() => {
        if (!pageId) return;

        const fetchData = async () => {
            setIsFetching(true);
            try {
                const pageData = await getPageById(pageId as string);

                // Fetch section data logic (simplified for brevity, assuming standard fetch)
                let systemSections: any[] = [];
                const systemSlugToPageKey: Record<string, string> = { 'home': 'homepage', 'stories': 'stories', 'startups': 'startups' };
                const sysKey = systemSlugToPageKey[pageData.slug];

                if (sysKey) {
                    const rawSections = await fetchAPI(`/sections/?page=${sysKey}`);
                    systemSections = Array.isArray(rawSections) ? rawSections.map((s: any) => ({
                        id: `${s.section_type}-${s.id}`,
                        type: s.section_type as SectionType,
                        settings: {
                            title: s.title,
                            subtitle: s.subtitle,
                            body: s.description || s.content,
                            imageUrl: s.image,
                            buttonText: s.link_text,
                            buttonLink: s.link_url,
                            ...(s.settings || {})
                        },
                        is_active: s.is_active,
                        db_id: s.id
                    })) : [];
                }

                // Merge Theme overrides
                const defaultTheme = { sections: [] as PageSection[] };
                const mergedTheme = { ...defaultTheme, ...(pageData.theme_overrides || {}) };
                if (systemSections.length > 0) {
                    // Create a lookup for system sections by their invariant DB ID
                    const systemDbMap = new Map<number, any>();
                    systemSections.forEach(s => {
                        if (typeof s.db_id === 'number') {
                            systemDbMap.set(s.db_id, s);
                        }
                    });

                    const finalSections: any[] = [];
                    const processedDbIds = new Set<number>();

                    // 1. Process existing overrides
                    (mergedTheme.sections || []).forEach((override: any) => {
                        // If this override maps to a real DB section
                        if (override.db_id && systemDbMap.has(override.db_id)) {
                            // Deduplicate: If we already processed this DB ID, skip (fixes same-db-id duplicates)
                            if (processedDbIds.has(override.db_id)) return;

                            const systemSection = systemDbMap.get(override.db_id);
                            // Merge override into system section to keep latest edits, BUT enforce system ID
                            finalSections.push({
                                ...override,
                                id: systemSection.id, // FORCE canonical ID
                                db_id: systemSection.db_id // Ensure db_id is preserved
                            });
                            processedDbIds.add(override.db_id);
                        } else {
                            // It's a purely local section (newly added) with no db_id yet, or legacy without db_id
                            finalSections.push(override);
                        }
                    });

                    // 2. Add any missing system sections (that weren't in overrides)
                    systemSections.forEach(s => {
                        if (s.db_id && !processedDbIds.has(s.db_id)) {
                            finalSections.push(s);
                            processedDbIds.add(s.db_id);
                        }
                    });

                    // 3. Final safety: Allow NO duplicates by ID string
                    const uniqueFinalSections = [];
                    const seenIds = new Set();
                    for (const s of finalSections) {
                        if (!seenIds.has(s.id)) {
                            uniqueFinalSections.push(s);
                            seenIds.add(s.id);
                        }
                    }

                    mergedTheme.sections = uniqueFinalSections;

                    // Update initial IDs based on the database IDs we found
                    const dbIds = systemSections.map((s: any) => s.db_id).filter((id: any) => typeof id === 'number');
                    setInitialSectionIds(dbIds as number[]);
                } else {
                    // Custom page: initial section IDs = db_ids from theme_overrides so delete API is called when user removes one
                    const dbIds = (mergedTheme.sections || [])
                        .map((s: any) => s.db_id)
                        .filter((id: any) => typeof id === 'number');
                    setInitialSectionIds(dbIds);
                }

                setFormData({
                    title: pageData.title || "",
                    slug: pageData.slug || "",
                    content: pageData.content || "",
                    meta_title: pageData.meta_title || "",
                    meta_description: pageData.meta_description || "",
                    meta_keywords: pageData.meta_keywords || "",
                    status: pageData.status || "draft",
                    theme_overrides: mergedTheme
                });

            } catch (error) {
                console.error("Error loading editor data:", error);
                toast.error("Failed to load page data");
            } finally {
                setIsFetching(false);
            }
        };

        const fetchMedia = async () => {
            try {
                const data = await fetchAPI("/media/");
                setMediaItems(Array.isArray(data) ? data : []);
            } catch (err) { console.error("Media fail", err); }
        };

        const fetchResources = async () => {
            try {
                const [cData, catData, sData, stData] = await Promise.all([
                    fetchAPI("/cities/"),
                    fetchAPI("/categories/"),
                    fetchAPI("/stories/"),
                    fetchAPI("/startups/")
                ]);
                setCities(Array.isArray(cData) ? cData : []);
                setCategories(Array.isArray(catData) ? catData : []);
                setRecentStories(Array.isArray(sData) ? sData.slice(0, 5) : (sData?.results ? sData.results.slice(0, 5) : []));
                setRecentStartups(Array.isArray(stData) ? stData.slice(0, 5) : (stData?.results ? stData.results.slice(0, 5) : []));
            } catch (err) { console.error("Resource fail", err); }
        };

        fetchData();
        fetchMedia();
        fetchResources();
    }, [pageId]);

    // Handlers
    const handleAiRewrite = async (text: string, field: string, sectionId: string, itemIndex?: number, itemField?: string) => {
        if (!text) return;
        const toastId = `ai-${Date.now()}`;
        setAiLoading(toastId);
        toast.loading("AI rewrite in progress...", { id: toastId });

        try {
            const defaultPrompt = `Rewrite the following text to be more professional, engaging, and concise for a startup ecosystem platform. Keep the meaning but improve the tone. Text: {text}`;
            const template = await getPromptTemplate("SEO Rewrite", defaultPrompt);
            const prompt = fillTemplate(template, { text, content: text });
            const res = await generateContent(prompt);

            if (res && res.content) {
                const newText = res.content.trim();

                if (sectionId === 'header') {
                    // Header specific logic if needed
                } else if (sectionId === 'general') {
                    // General field update
                    setFormData((prev: any) => ({ ...prev, [field]: newText }));
                } else {
                    // Section Update
                    if (itemIndex !== undefined && itemField) {
                        const section = (formData.theme_overrides.sections || []).find((s: any) => s.id === sectionId);
                        if (section) {
                            const newItems = [...(section.settings.items || [])];
                            newItems[itemIndex] = { ...newItems[itemIndex], [itemField]: newText };
                            updateSection(sectionId, { items: newItems });
                        }
                    } else {
                        updateSection(sectionId, { [field]: newText });
                    }
                }
                toast.success("Content rewritten!", { id: toastId });
                setHasUnapplied(true);
            } else {
                toast.error("Failed to generate content", { id: toastId });
            }
        } catch (error) {
            toast.error("AI service unavailable", { id: toastId });
        } finally {
            setAiLoading(null);
        }
    };

    const handleGenerateSEO = async () => {
        const toastId = `ai-seo-${Date.now()}`;
        setAiLoading(toastId);
        toast.loading("Generating SEO metadata...", { id: toastId });

        try {
            // 1. Gather Context
            const sections = formData.theme_overrides?.sections || [];
            const sectionsSummary = sections.map((s: any) => `${s.type}: ${s.settings?.title || ''} - ${s.settings?.subtitle || ''}`).join('; ');
            const pageContext = `Page Title: ${formData.title}\nPage Slug: ${formData.slug}\nSections: ${sectionsSummary}\nContent Preview: ${formData.content?.substring(0, 500) || "Startups and innovation content"}`;

            // 2. prompt
            const defaultPrompt = `Generate SEO metadata for the following webpage context in strictly valid JSON format.
Context:
{context}

Requirements:
- meta_title: A compelling, SEO-friendly title (50-60 chars)
- meta_description: A concise summary of the page content (150-160 chars)
- meta_keywords: A comma-separated list of 5-10 relevant keywords

Response Format (JSON ONLY, no markdown):
{
"meta_title": "...",
"meta_description": "...",
"meta_keywords": "..."
}`;

            const template = await getPromptTemplate("SEO Generation", defaultPrompt);
            const prompt = fillTemplate(template, { context: pageContext });

            // 3. Call AI
            const res = await generateContent(prompt);

            if (res && res.content) {
                let jsonStr = res.content.trim();

                // Robust JSON extraction: Find the first '{' and last '}'
                const firstBrace = jsonStr.indexOf('{');
                const lastBrace = jsonStr.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
                } else if (jsonStr.startsWith("```")) {
                    // Fallback for code blocks if braces aren't clear (though unlikely)
                    jsonStr = jsonStr.replace(/^```(json)?|```$/g, "").trim();
                }

                try {
                    const seoData = JSON.parse(jsonStr);
                    setFormData((prev: any) => ({
                        ...prev,
                        meta_title: seoData.meta_title || prev.meta_title,
                        meta_description: seoData.meta_description || prev.meta_description,
                        meta_keywords: seoData.meta_keywords || prev.meta_keywords
                    }));
                    setHasUnapplied(true);
                    toast.success("SEO metadata generated!", { id: toastId });
                } catch (e) {
                    console.error("JSON Parse Error", e);
                    toast.error("Failed to parse AI response. Please try again.", { id: toastId });
                }
            } else {
                toast.error("Failed to generate content", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("AI service unavailable", { id: toastId });
        } finally {
            setAiLoading(null);
        }
    };

    // Components moved outside


    const updateSection = (id: string, patch: Partial<SectionSettings>) => {
        setFormData((prev: any) => {
            const nextSections = (prev.theme_overrides.sections || []).map((section: PageSection) => {
                if (section.id !== id) return section;
                return { ...section, settings: { ...section.settings, ...patch } };
            });
            return {
                ...prev,
                theme_overrides: { ...prev.theme_overrides, sections: nextSections }
            };
        });
        setHasUnapplied(true);
    };

    const addSection = (type: SectionType) => {
        const baseSettings: Record<SectionType, SectionSettings> = {
            hero: { title: "New Hero Section", subtitle: "", buttonText: "Get Started", align: "left", backgroundColor: "transparent", titleSize: 48, contentWidth: "wide", paddingY: 32, paddingX: 0 },
            text: { title: "Content Section", body: "Write your story here...", align: "left", backgroundColor: "#ffffff", titleSize: 32, contentWidth: "normal" },
            image: { caption: "Featured image caption", align: "center", backgroundColor: "#ffffff", contentWidth: "wide" },
            video: { caption: "Video documentation", align: "center", backgroundColor: "#0f172a", textColor: "#ffffff", contentWidth: "wide" },
            banner: { title: "Promotional Banner", subtitle: "", buttonText: "Explore Now", backgroundColor: "#FF5722", textColor: "#FFFFFF" },
            featured_stories: { title: "Featured Stories", subtitle: "" },
            latest_stories: { title: "Latest Stories", subtitle: "" },
            featured_startups: { title: "Featured Startups", subtitle: "" },
            startup_cards: { title: "Startup Directory", subtitle: "" },
            category_grid: { title: "Browse by Category", subtitle: "" },
            city_grid: { title: "Startup Hubs", subtitle: "" },
            rising_hubs: { title: "Rising Startup Hubs", subtitle: "" },
            newsletter: { title: "Stay Updated", body: "Get the latest startup stories delivered to your inbox.", buttonText: "Subscribe Now" },
            cta: { title: "Ready to launch?", body: "Submit your startup today and get featured.", buttonText: "Submit Startup", buttonLink: "/submit" },
            trending_stories: { title: "Trending Stories", subtitle: "" },
            custom_content: { title: "Custom Content", body: "<p>Add your custom content here...</p>", align: "left", backgroundColor: "#ffffff", contentWidth: "normal" },
            mission_vision: {
                title: "Our Mission & Vision",
                backgroundColor: "#ffffff",
                paddingY: 48,
                cards: [
                    { icon: "🎯", title: "Our Mission", description: "StartupSaga.in was founded with a simple belief: every founder's journey deserves to be told. We aim to inspire, educate, and connect India's startup ecosystem.", color: "#FEF3E8" },
                    { icon: "🌐", title: "Our Vision", description: "To become India's most trusted platform for startup news, insights, and community. We envision a future where every aspiring entrepreneur has access to knowledge.", color: "#EEF6FF" }
                ]
            },
            stats_bar: {
                title: "",
                backgroundColor: "#ffffff",
                paddingY: 32,
                cards: [
                    { stat_value: "5,000+", stat_label: "Startups Covered" },
                    { stat_value: "10,000+", stat_label: "Stories Published" },
                    { stat_value: "2M+", stat_label: "Monthly Readers" },
                    { stat_value: "50+", stat_label: "Cities Tracked" }
                ]
            },
            team_grid: {
                title: "Our Team",
                backgroundColor: "#ffffff",
                paddingY: 48,
                cards: [
                    { title: "Team Member", role: "Co-Founder & CEO", description: "Visionary leader driving the platform forward.", image: "" },
                    { title: "Team Member", role: "Editor-in-Chief", description: "Storyteller at heart, covering India's startup ecosystem.", image: "" }
                ]
            },
            values_grid: {
                title: "Our Values",
                backgroundColor: "#ffffff",
                paddingY: 48,
                cards: [
                    { title: "Authenticity", description: "We tell real stories with honesty and integrity, celebrating both successes and failures." },
                    { title: "Inclusivity", description: "We believe entrepreneurship is for everyone, from metros to Tier-3 towns." },
                    { title: "Impact", description: "Every story we tell aims to inspire action and drive positive change." }
                ]
            },
            policy_section: {
                title: "Policy Section",
                body: "<p>Add your policy content here. Clearly explain your data practices, rights, and responsibilities.</p>",
                align: "left",
                backgroundColor: "#ffffff",
                contentWidth: "normal",
                paddingY: 48
            },
            faq: {
                title: "Frequently Asked Questions",
                backgroundColor: "#f8fafc",
                paddingY: 48,
                cards: [
                    { question: "What information do we collect?", answer: "We collect information you provide directly to us, such as when you create an account, submit a startup, or contact us." },
                    { question: "How do we use your data?", answer: "We use your information to provide, maintain, and improve our services, and to communicate with you." }
                ]
            },
            callout: {
                title: "Important Notice",
                body: "This is a key piece of information you want to highlight to your readers.",
                backgroundColor: "#FEF3E8",
                textColor: "#9A3412",
                paddingY: 24
            },
            related_cards: {
                title: "Related Policies",
                backgroundColor: "#f8fafc",
                paddingY: 48,
                cards: [
                    { title: "Privacy Policy", description: "How we collect and use your data.", link: "/privacy-policy", icon: "🔒" },
                    { title: "Cookie Policy", description: "How we use cookies on our site.", link: "/cookie-policy", icon: "🍪" },
                    { title: "Editorial Policy", description: "Our standards for content creation.", link: "/editorial-policy", icon: "📋" }
                ]
            },
            image_gallery: {
                title: "Gallery",
                backgroundColor: "#ffffff",
                paddingY: 40,
                cards: []
            },
            table_of_contents: {
                title: "Table of Contents",
                backgroundColor: "#f8fafc",
                paddingY: 24,
                cards: [
                    { title: "Introduction", link: "#introduction" },
                    { title: "Data Collection", link: "#data-collection" },
                    { title: "Your Rights", link: "#your-rights" }
                ]
            }
        };

        const newSection: PageSection = {
            id: `${type}-${Date.now()}`,
            type,
            settings: baseSettings[type],
            is_active: true
        };

        setFormData((prev: any) => ({
            ...prev,
            theme_overrides: {
                ...prev.theme_overrides,
                sections: [...(prev.theme_overrides.sections || []), newSection]
            }
        }));
        setActiveTab(newSection.id);
        setHasUnapplied(true);
    };

    const deleteSection = (id: string) => {
        setFormData((prev: any) => ({
            ...prev,
            theme_overrides: {
                ...prev.theme_overrides,
                sections: (prev.theme_overrides.sections || []).filter((s: any) => s.id !== id)
            }
        }));
        setActiveTab("general");
        setHasUnapplied(true);
    };

    /** Delete section by index so one click removes exactly one row (works with duplicate IDs). */
    const deleteSectionAt = (index: number) => {
        setFormData((prev: any) => {
            const list = prev.theme_overrides.sections || [];
            const next = list.filter((_: any, i: number) => i !== index);
            return {
                ...prev,
                theme_overrides: { ...prev.theme_overrides, sections: next }
            };
        });
        setActiveTab("structure");
        setHasUnapplied(true);
    };

    const moveSection = (id: string, direction: 'up' | 'down') => {
        const sections = formData.theme_overrides.sections || [];
        const idx = sections.findIndex((s: any) => s.id === id);
        if (idx === -1) return;

        if (direction === 'up' && idx > 0) {
            const newSections = [...sections];
            [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
            setFormData((prev: any) => ({ ...prev, theme_overrides: { ...prev.theme_overrides, sections: newSections } }));
        } else if (direction === 'down' && idx < sections.length - 1) {
            const newSections = [...sections];
            [newSections[idx + 1], newSections[idx]] = [newSections[idx], newSections[idx + 1]];
            setFormData((prev: any) => ({ ...prev, theme_overrides: { ...prev.theme_overrides, sections: newSections } }));
        }
        setHasUnapplied(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        // Always read the freshest formData via ref to avoid stale closure
        const currentFormData = formDataRef.current || formData;
        try {
            let updatedSections = [...(currentFormData.theme_overrides.sections || [])];

            // 1. Handle Page Sections (System + Custom) - SAVE SECTIONS FIRST
            const systemPages = ['home', 'stories', 'startups'];
            const currentSlug = currentFormData.slug?.toLowerCase().trim();
            const isSystemPage = systemPages.includes(currentSlug);

            // Determine Page Key and Context
            let pageKey = 'custom';
            if (isSystemPage) {
                const slugToPageKey: Record<string, string> = {
                    'home': 'homepage',
                    'stories': 'stories',
                    'startups': 'startups'
                };
                pageKey = slugToPageKey[currentSlug] || 'homepage';
            }

            // ALWAYS Run Sync Logic for Sections
            // This ensures deleting sections works for BOTH system pages and custom pages

            // A. Handle Deletions - Delete IDs that were initially present but are no longer in updatedSections
            const currentDbIds = new Set(updatedSections.map((s: any) => s.db_id).filter((id: any) => typeof id === 'number'));
            const deletedIds = initialSectionIds.filter(id => !currentDbIds.has(id));

            for (const delId of deletedIds) {
                await fetchAPI(`/sections/${delId}/delete/`, { method: "DELETE" });
            }

            // B. Update/Create Sections and Synchronize IDs
            const newSectionIds: number[] = [];

            for (let i = 0; i < updatedSections.length; i++) {
                const section = updatedSections[i];
                const isNew = !section.db_id;
                const url = isNew ? "/sections/create/" : `/sections/${section.db_id}/update/`;

                const payload = {
                    page: pageKey,
                    // If it's a custom page, we MUST link it to the Page object via page_obj (ID)
                    // If it's a system page, page_obj can be null as 'page' field suffices
                    page_obj: isSystemPage ? null : pageId,
                    section_type: section.type,
                    title: section.settings.title || "",
                    subtitle: section.settings.subtitle || "",
                    description: section.settings.body || "",
                    content: section.settings.body || "",
                    link_text: section.settings.buttonText || "",
                    link_url: section.settings.buttonLink || "",
                    order: i,
                    is_active: section.is_active !== undefined ? section.is_active : true,
                    settings: {
                        align: section.settings.align,
                        backgroundColor: section.settings.backgroundColor,
                        textColor: section.settings.textColor,
                        titleSize: section.settings.titleSize,
                        textSize: section.settings.textSize,
                        contentWidth: section.settings.contentWidth,
                        paddingY: section.settings.paddingY,
                        paddingX: section.settings.paddingX,
                        marginTop: section.settings.marginTop,
                        marginBottom: section.settings.marginBottom,
                        marginLeft: section.settings.marginLeft,
                        marginRight: section.settings.marginRight,
                        linkRel: section.settings.linkRel,
                        caption: section.settings.caption,
                        items: section.settings.items,
                        cards: section.settings.cards,
                        body: section.settings.body,
                        icon: section.settings.icon,
                        fontFamily: section.settings.fontFamily,
                        fontSize: section.settings.fontSize,
                        buttonText: section.settings.buttonText,
                        buttonLink: section.settings.buttonLink,
                        buttonStyle: section.settings.buttonStyle,
                        secondaryButtonText: section.settings.secondaryButtonText,
                        secondaryButtonLink: section.settings.secondaryButtonLink,
                        secondaryButtonStyle: section.settings.secondaryButtonStyle,
                        extraButtons: section.settings.extraButtons,
                        videoUrl: section.settings.videoUrl,
                        showInput: section.settings.showInput,
                        imageUrl: section.settings.imageUrl,
                        customId: section.settings.customId,
                        altText: section.settings.altText,
                        meta_title: section.settings.meta_title,
                        meta_description: section.settings.meta_description,
                        meta_keywords: section.settings.meta_keywords
                    }
                };

                const savedSection = await fetchAPI(url, {
                    method: isNew ? "POST" : "PUT",
                    body: JSON.stringify(payload)
                });

                if (savedSection && savedSection.id) {
                    // Crucial: Update the section in our list with the real ID and DB ID
                    updatedSections[i] = {
                        ...section,
                        id: `${savedSection.section_type}-${savedSection.id}`, // Maintain consistent ID format
                        db_id: savedSection.id,
                        settings: { ...section.settings }
                    };
                    newSectionIds.push(savedSection.id);
                }
            }

            setInitialSectionIds(newSectionIds);

            // 2. Save Page Meta & Theme (using the Updated Sections with real IDs)
            const updatedFormData = {
                ...currentFormData,
                theme_overrides: {
                    ...currentFormData.theme_overrides,
                    sections: updatedSections
                }
            };

            // Sync local state immediately so UI reflects reality
            setFormData(updatedFormData);
            formDataRef.current = updatedFormData;

            await fetchAPI(`/pages/${pageId}/update/`, {
                method: "PUT",
                body: JSON.stringify(updatedFormData)
            });

            toast.success("Page updated successfully");
            setHasUnapplied(false);
            // Omit router.refresh() to avoid reloading old state or causing blinks

        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex h-screen items-center justify-center gap-3">
                <Loader2 className="animate-spin text-purple-500" size={24} />
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading...</span>
            </div>
        );
    }

    const sections = formData.theme_overrides.sections || [];
    const activeSection = sections.find((s: any) => s.id === activeTab);

    // Helpers
    const getSectionLabel = (s: PageSection) => s.settings.title || s.type.replace(/_/g, " ").toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 pb-20">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <Layout className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Pages</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">{formData.title || "Edit Page"}</h1>
                        </div>
                    </div>

                    {/* Viewport Toggles - Centered */}
                    <div className="hidden lg:flex items-center gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                        <button
                            onClick={() => setViewport('desktop')}
                            title="Desktop View"
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewport === 'desktop' ? "bg-white text-purple-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            <Monitor size={16} />
                        </button>
                        <button
                            onClick={() => setViewport('tablet')}
                            title="Tablet View"
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewport === 'tablet' ? "bg-white text-purple-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            <Tablet size={16} />
                        </button>
                        <button
                            onClick={() => setViewport('mobile')}
                            title="Mobile View"
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewport === 'mobile' ? "bg-white text-purple-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            <Smartphone size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${['home', 'homepage'].includes(formData.slug?.toLowerCase()) ? '' : formData.slug}`} target="_blank">
                            <button className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5">
                                <Eye size={14} /> Preview
                            </button>
                        </Link>
                        {/* Publish / Draft toggle — always visible in the header */}
                        <button
                            onClick={() => {
                                const newStatus = formData.status === 'published' ? 'draft' : 'published';
                                setFormData((prev: any) => ({ ...prev, status: newStatus }));
                                setHasUnapplied(true);
                            }}
                            className={`h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${formData.status === 'published'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${formData.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {formData.status === 'published' ? 'Published' : 'Draft'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Pill-Style Tabs Bar */}
                <div className="flex justify-center my-4">
                    <div className="bg-slate-100/80 p-1.5 rounded-full flex items-center gap-1 border border-slate-200/50 overflow-x-auto no-scrollbar max-w-full">
                        <TabButton id="structure" label="Structure" active={activeTab} onClick={setActiveTab} icon={Layout} />
                        <div className="w-px h-4 bg-slate-300 mx-1" />
                        <TabButton id="general" label="Settings" active={activeTab} onClick={setActiveTab} icon={Type} />

                        {sections.map((s: PageSection) => (
                            <TabButton
                                key={s.id}
                                id={s.id}
                                label={getSectionLabel(s)}
                                active={activeTab}
                                onClick={setActiveTab}
                                icon={s.type === 'hero' ? Sparkles : undefined}
                            />
                        ))}

                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <TabButton id="seo" label="SEO" active={activeTab} onClick={setActiveTab} icon={Globe} />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                    {/* Tab Content Body */}
                    <div className="p-6 flex-1 bg-white">

                        {/* 0. Page Structure (The "Real Time Sections" View) */}
                        {activeTab === 'structure' && (
                            <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h2 className="text-base font-bold text-slate-800">Page Sections</h2>
                                        <p className="text-xs text-slate-500">Manage the order and layout of your page content.</p>
                                    </div>

                                    {/* Add Section Dropdown - opens on click so it doesn't cover list and block delete buttons */}
                                    <div className="relative" ref={(el) => { addSectionMenuRef.current = el; }}>
                                        <Button
                                            type="button"
                                            className="gap-2 h-8 text-xs"
                                            onClick={() => setAddSectionOpen((o) => !o)}
                                            aria-expanded={addSectionOpen}
                                            aria-haspopup="true"
                                        >
                                            <Plus size={14} /> Add New Section
                                        </Button>
                                        {addSectionOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-100 rounded-lg shadow-xl p-2 z-50 max-h-96 overflow-y-auto">
                                                <div className="grid grid-cols-1 gap-1">
                                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Core Layout</div>
                                                    {["hero", "text", "image", "cta"].map((type: string) => (
                                                        <button key={type} type="button" onClick={() => { addSection(type as SectionType); setAddSectionOpen(false); }} className="text-left px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md capitalize flex items-center justify-between group/btn">
                                                            {type.replace(/_/g, " ")}
                                                            <Plus size={12} className="opacity-0 group-hover/btn:opacity-100 text-blue-500" />
                                                        </button>
                                                    ))}
                                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider mt-2">About Page</div>
                                                    {["mission_vision", "stats_bar", "team_grid", "values_grid"].map((type: string) => (
                                                        <button key={type} type="button" onClick={() => { addSection(type as SectionType); setAddSectionOpen(false); }} className="text-left px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-600 rounded-md capitalize flex items-center justify-between group/btn">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="text-[10px]">{
                                                                    type === 'mission_vision' ? '🎯' :
                                                                        type === 'stats_bar' ? '📊' :
                                                                            type === 'team_grid' ? '👥' : '🏅'
                                                                }</span>
                                                                {type.replace(/_/g, " ")}
                                                            </span>
                                                            <Plus size={12} className="opacity-0 group-hover/btn:opacity-100 text-violet-500" />
                                                        </button>
                                                    ))}
                                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider mt-2">Policy &amp; Content</div>
                                                    {(["policy_section", "faq", "callout", "related_cards", "image_gallery", "table_of_contents"] as const).map((type) => (
                                                        <button key={type} type="button" onClick={() => { addSection(type as SectionType); setAddSectionOpen(false); }} className="text-left px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-md capitalize flex items-center justify-between group/btn">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="text-[10px]">{type === 'policy_section' ? '📋' : type === 'faq' ? '❓' : type === 'callout' ? '⚠️' : type === 'related_cards' ? '🔗' : type === 'image_gallery' ? '🖼️' : '📑'}</span>
                                                                {type.replace(/_/g, " ")}
                                                            </span>
                                                            <Plus size={12} className="opacity-0 group-hover/btn:opacity-100 text-emerald-500" />
                                                        </button>
                                                    ))}
                                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider mt-2">Dynamic Feeds</div>
                                                    {["latest_stories", "featured_startups", "startup_cards", "category_grid", "city_grid", "rising_hubs", "newsletter"].map((type: string) => (
                                                        <button key={type} type="button" onClick={() => { addSection(type as SectionType); setAddSectionOpen(false); }} className="text-left px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md capitalize flex items-center justify-between group/btn">
                                                            {type.replace(/_/g, " ")}
                                                            <Plus size={12} className="opacity-0 group-hover/btn:opacity-100 text-blue-500" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {sections.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                            <Layout size={32} className="mx-auto text-slate-300 mb-2" />
                                            <h3 className="text-slate-900 font-medium text-sm">No sections yet</h3>
                                            <p className="text-slate-500 text-xs">Add your first section to start building the page.</p>
                                        </div>
                                    )}

                                    {sections.map((s: PageSection, idx: number) => (
                                        <div key={`${s.id}-${idx}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-all group relative z-10">
                                            <div className="h-8 w-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                                                {s.type === 'hero' ? <Sparkles size={16} /> :
                                                    s.type.includes('story') ? <Layout size={16} /> :
                                                        s.type.includes('image') ? <ImageIcon size={16} /> :
                                                            <PanelBottom size={16} />}
                                            </div>

                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveTab(s.id)}>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 uppercase tracking-wider">{s.type.replace(/_/g, " ")}</Badge>
                                                    {!s.is_active && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-400">Hidden</Badge>}
                                                </div>
                                                <h3 className="font-semibold text-sm text-slate-800 truncate">{getSectionLabel(s)}</h3>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex bg-slate-100 rounded-md p-0.5">
                                                    <button type="button" onClick={() => moveSection(s.id, 'up')} disabled={idx === 0} className="p-1 hover:bg-white rounded disabled:opacity-30"><ChevronUp size={12} /></button>
                                                    <button type="button" onClick={() => moveSection(s.id, 'down')} disabled={idx === sections.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-30"><ChevronDown size={12} /></button>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setActiveTab(s.id)}>Edit</Button>
                                                <button
                                                    type="button"
                                                    className="h-7 w-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        if (confirm("Are you sure you want to delete this section?")) {
                                                            deleteSectionAt(idx);
                                                        }
                                                    }}
                                                    title="Delete Section"
                                                    aria-label="Delete section"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'general' && (
                            <div className="max-w-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-3">
                                    <h2 className="text-base font-bold text-slate-800 border-b pb-1">Page Details</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Page Title</Label>
                                            <Input className="h-8 text-sm" value={formData.title} onChange={e => { setFormData({ ...formData, title: e.target.value }); setHasUnapplied(true); }} placeholder="e.g. About Us" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">URL Slug</Label>
                                            <Input className="h-8 text-sm" value={formData.slug} onChange={e => { setFormData({ ...formData, slug: e.target.value }); setHasUnapplied(true); }} placeholder="e.g. about-us" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Publish Status</Label>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={formData.status === 'published' ? 'default' : 'secondary'} className="cursor-pointer text-[10px] px-2 py-0.5" onClick={() => { setFormData({ ...formData, status: 'published' }); setHasUnapplied(true); }}>Published</Badge>
                                            <Badge variant={formData.status === 'draft' ? 'default' : 'secondary'} className="cursor-pointer text-[10px] px-2 py-0.5" onClick={() => { setFormData({ ...formData, status: 'draft' }); setHasUnapplied(true); }}>Draft</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. SEO Tab */}
                        {activeTab === 'seo' && (
                            <div className="max-w-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b pb-1">
                                        <h2 className="text-base font-bold text-slate-800">Search Engine Optimization</h2>
                                        <Button
                                            type="button"
                                            onClick={handleGenerateSEO}
                                            disabled={!!aiLoading}
                                            variant="outline"
                                            size="sm"
                                            className="h-6 gap-1 px-2 rounded-lg border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all text-[8px] font-bold uppercase tracking-wider"
                                        >
                                            {aiLoading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Sparkles className="h-2.5 w-2.5" />}
                                            AI Rewrite
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Meta Title</Label>
                                            <Input className="h-8 text-sm" value={formData.meta_title} onChange={e => { setFormData({ ...formData, meta_title: e.target.value }); setHasUnapplied(true); }} placeholder="SEO Title" />
                                            <p className="text-[10px] text-slate-400">Recommended length: 50-60 characters</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Meta Description</Label>
                                            <Textarea value={formData.meta_description} onChange={e => { setFormData({ ...formData, meta_description: e.target.value }); setHasUnapplied(true); }} placeholder="Brief description for search results..." className="min-h-[80px] text-sm" />
                                            <p className="text-[10px] text-slate-400">Recommended length: 150-160 characters</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Keywords</Label>
                                            <Input className="h-8 text-sm" value={formData.meta_keywords} onChange={e => { setFormData({ ...formData, meta_keywords: e.target.value }); setHasUnapplied(true); }} placeholder="comma, separated, keywords" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Section Editors */}
                        {activeSection && (
                            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="uppercase tracking-widest text-[9px] px-1.5">{activeSection.type}</Badge>
                                        <h2 className="text-base font-bold text-slate-800">{getSectionLabel(activeSection)}</h2>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => moveSection(activeSection.id, 'up')}><ChevronUp size={12} /></Button>
                                        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => moveSection(activeSection.id, 'down')}><ChevronDown size={12} /></Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            type="button"
                                            onClick={() => {
                                                const idx = sections.findIndex((sec: any) => sec.id === activeSection.id);
                                                if (idx !== -1) deleteSectionAt(idx);
                                                else deleteSection(activeSection.id);
                                            }}
                                            className="ml-2 gap-1 h-7 text-xs px-2"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </Button>
                                    </div>
                                </div>

                                <SectionPreview
                                    section={activeSection}
                                    viewport={viewport}
                                    sampleData={{
                                        stories: recentStories,
                                        startups: recentStartups,
                                        cities: cities,
                                        categories: categories
                                    }}
                                />

                                <div className="grid grid-cols-12 gap-6">
                                    {/* Left Content Column */}
                                    <div className="col-span-8 space-y-4">
                                        {/* Standard Fields */}
                                        <div className="space-y-4">
                                            {activeSection.type !== 'image' && (
                                                <AiInputWithRewrite
                                                    label="Headline / Title"
                                                    value={activeSection.settings.title}
                                                    onChange={(val: string) => updateSection(activeSection.id, { title: val })}
                                                    sectionId={activeSection.id}
                                                    fieldName="title"
                                                    aiLoading={aiLoading}
                                                    onAiRewrite={handleAiRewrite}
                                                />
                                            )}
                                            {['hero', 'banner', 'cta', 'text'].includes(activeSection.type) && (
                                                <AiInputWithRewrite
                                                    label="Subtitle"
                                                    value={activeSection.settings.subtitle}
                                                    onChange={(val: string) => updateSection(activeSection.id, { subtitle: val })}
                                                    sectionId={activeSection.id}
                                                    fieldName="subtitle"
                                                    aiLoading={aiLoading}
                                                    onAiRewrite={handleAiRewrite}
                                                />
                                            )}
                                            {activeSection.type !== 'image' && (
                                                <AiInputWithRewrite
                                                    label="Main Content"
                                                    rich={true}
                                                    value={activeSection.settings.body}
                                                    onChange={(val: string) => updateSection(activeSection.id, { body: val })}
                                                    sectionId={activeSection.id}
                                                    fieldName="body"
                                                    aiLoading={aiLoading}
                                                    onAiRewrite={handleAiRewrite}
                                                />
                                            )}
                                            {['hero', 'banner', 'cta', 'text', 'image'].includes(activeSection.type) && (
                                                <>
                                                    {/* ── PRIMARY BUTTON ── */}
                                                    <div className="pt-4 mt-2 border-t border-slate-100">
                                                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3">Primary Button</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <AiInputWithRewrite
                                                                label="Button Text"
                                                                value={activeSection.settings.buttonText}
                                                                onChange={(val: string) => updateSection(activeSection.id, { buttonText: val })}
                                                                sectionId={activeSection.id}
                                                                fieldName="buttonText"
                                                                aiLoading={aiLoading}
                                                                onAiRewrite={handleAiRewrite}
                                                            />
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold uppercase text-slate-500">Button Link</Label>
                                                                <Input
                                                                    className="h-10 text-sm"
                                                                    placeholder="/path/to/page"
                                                                    value={activeSection.settings.buttonLink || ""}
                                                                    onChange={e => updateSection(activeSection.id, { buttonLink: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold uppercase text-slate-500">Style</Label>
                                                                <select
                                                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                                                    value={activeSection.settings.buttonStyle || "primary"}
                                                                    onChange={e => updateSection(activeSection.id, { buttonStyle: e.target.value as "primary" | "secondary" | "outline" })}
                                                                >
                                                                    <option value="primary">Primary (Orange)</option>
                                                                    <option value="secondary">Secondary (White)</option>
                                                                    <option value="outline">Outline</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ── SECONDARY BUTTON ── */}
                                                    <div className="pt-4 mt-2 border-t border-slate-100">
                                                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3">Secondary Button</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold uppercase text-slate-500">Button Text</Label>
                                                                <Input
                                                                    className="h-10 text-sm"
                                                                    placeholder="e.g. Submit Your Journey"
                                                                    value={activeSection.settings.secondaryButtonText || ""}
                                                                    onChange={e => updateSection(activeSection.id, { secondaryButtonText: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold uppercase text-slate-500">Button Link</Label>
                                                                <Input
                                                                    className="h-10 text-sm"
                                                                    placeholder="/submit"
                                                                    value={activeSection.settings.secondaryButtonLink || ""}
                                                                    onChange={e => updateSection(activeSection.id, { secondaryButtonLink: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold uppercase text-slate-500">Style</Label>
                                                                <select
                                                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                                                    value={activeSection.settings.secondaryButtonStyle || "secondary"}
                                                                    onChange={e => updateSection(activeSection.id, { secondaryButtonStyle: e.target.value as "primary" | "secondary" | "outline" })}
                                                                >
                                                                    <option value="primary">Primary (Orange)</option>
                                                                    <option value="secondary">Secondary (White)</option>
                                                                    <option value="outline">Outline</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ── EXTRA BUTTONS ── */}
                                                    <div className="pt-4 mt-2 border-t border-slate-100">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">More Buttons</p>
                                                            <button
                                                                onClick={() => {
                                                                    const existing = activeSection.settings.extraButtons || [];
                                                                    updateSection(activeSection.id, {
                                                                        extraButtons: [...existing, { text: "New Button", link: "/", style: "outline" }]
                                                                    });
                                                                }}
                                                                className="flex items-center gap-1 h-7 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold transition-all"
                                                            >
                                                                <Plus size={11} /> Add Button
                                                            </button>
                                                        </div>
                                                        {(activeSection.settings.extraButtons || []).length === 0 && (
                                                            <p className="text-xs text-slate-400 italic">No extra buttons. Click "Add Button" to create one.</p>
                                                        )}
                                                        <div className="space-y-3">
                                                            {(activeSection.settings.extraButtons || []).map((btn: any, idx: number) => (
                                                                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 relative">
                                                                    <button
                                                                        onClick={() => {
                                                                            const updated = [...(activeSection.settings.extraButtons || [])];
                                                                            updated.splice(idx, 1);
                                                                            updateSection(activeSection.id, { extraButtons: updated });
                                                                        }}
                                                                        className="absolute top-2 right-2 h-5 w-5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-500 text-xs font-bold flex items-center justify-center transition-all"
                                                                        title="Remove button"
                                                                    >×</button>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs font-semibold uppercase text-slate-400">Text</Label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            placeholder="Button label"
                                                                            value={btn.text}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.extraButtons || [])];
                                                                                updated[idx] = { ...updated[idx], text: e.target.value };
                                                                                updateSection(activeSection.id, { extraButtons: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs font-semibold uppercase text-slate-400">Link</Label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            placeholder="/path"
                                                                            value={btn.link}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.extraButtons || [])];
                                                                                updated[idx] = { ...updated[idx], link: e.target.value };
                                                                                updateSection(activeSection.id, { extraButtons: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs font-semibold uppercase text-slate-400">Style</Label>
                                                                        <select
                                                                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                                                            value={btn.style || "outline"}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.extraButtons || [])];
                                                                                updated[idx] = { ...updated[idx], style: e.target.value as "primary" | "secondary" | "outline" };
                                                                                updateSection(activeSection.id, { extraButtons: updated });
                                                                            }}
                                                                        >
                                                                            <option value="primary">Primary (Orange)</option>
                                                                            <option value="secondary">Secondary (White)</option>
                                                                            <option value="outline">Outline</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Card Editor for About page section types */}
                                        {['mission_vision', 'stats_bar', 'team_grid', 'values_grid'].includes(activeSection.type) && (
                                            <div className="space-y-4 pt-4 mt-2 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase text-slate-600">
                                                            {activeSection.type === 'mission_vision' && '🎯 Mission/Vision Cards'}
                                                            {activeSection.type === 'stats_bar' && '📊 Stats'}
                                                            {activeSection.type === 'team_grid' && '👥 Team Members'}
                                                            {activeSection.type === 'values_grid' && '🏅 Values'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">Edit each card's content below</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const existing = activeSection.settings.cards || [];
                                                            const newCard: any =
                                                                activeSection.type === 'mission_vision' ? { icon: '⭐', title: 'New Card', description: 'Card description here.', color: '#F8FAFC' } :
                                                                    activeSection.type === 'stats_bar' ? { stat_value: '0+', stat_label: 'New Stat' } :
                                                                        activeSection.type === 'team_grid' ? { title: 'Team Member', role: 'Role Title', description: '', image: '' } :
                                                                            { title: 'New Value', description: 'Describe this value.' };
                                                            updateSection(activeSection.id, { cards: [...existing, newCard] });
                                                        }}
                                                        className="flex items-center gap-1 h-7 px-3 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-bold transition-all"
                                                    >
                                                        <Plus size={11} /> Add Card
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {(activeSection.settings.cards || []).map((card: any, ci: number) => (
                                                        <div key={ci} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                                                            <button
                                                                onClick={() => {
                                                                    const updated = [...(activeSection.settings.cards || [])];
                                                                    updated.splice(ci, 1);
                                                                    updateSection(activeSection.id, { cards: updated });
                                                                }}
                                                                className="absolute top-2 right-2 h-5 w-5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-500 text-xs font-bold flex items-center justify-center"
                                                            >×</button>

                                                            {/* Stats Bar fields */}
                                                            {activeSection.type === 'stats_bar' && (
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Stat Value</Label>
                                                                        <Input
                                                                            className="h-8 text-sm bg-white font-bold"
                                                                            placeholder="e.g. 5,000+"
                                                                            value={card.stat_value || ''}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], stat_value: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Stat Label</Label>
                                                                        <Input
                                                                            className="h-8 text-sm bg-white"
                                                                            placeholder="e.g. Startups Covered"
                                                                            value={card.stat_label || ''}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], stat_label: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Mission/Vision fields */}
                                                            {activeSection.type === 'mission_vision' && (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[10px] uppercase text-slate-500">Emoji Icon</Label>
                                                                            <Input
                                                                                className="h-8 text-sm bg-white"
                                                                                placeholder="e.g. 🎯"
                                                                                value={card.icon || ''}
                                                                                onChange={e => {
                                                                                    const updated = [...(activeSection.settings.cards || [])];
                                                                                    updated[ci] = { ...updated[ci], icon: e.target.value };
                                                                                    updateSection(activeSection.id, { cards: updated });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[10px] uppercase text-slate-500">Card Color</Label>
                                                                            <Input
                                                                                type="color"
                                                                                className="h-8 w-full p-0 cursor-pointer bg-white"
                                                                                value={card.color || '#F8FAFC'}
                                                                                onChange={e => {
                                                                                    const updated = [...(activeSection.settings.cards || [])];
                                                                                    updated[ci] = { ...updated[ci], color: e.target.value };
                                                                                    updateSection(activeSection.id, { cards: updated });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Title</Label>
                                                                        <Input
                                                                            className="h-8 text-sm bg-white"
                                                                            placeholder="e.g. Our Mission"
                                                                            value={card.title || ''}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], title: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Description</Label>
                                                                        <Textarea
                                                                            className="min-h-[72px] text-sm bg-white"
                                                                            placeholder="Card description..."
                                                                            value={card.description || ''}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], description: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* Team Grid fields */}
                                                            {activeSection.type === 'team_grid' && (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[10px] uppercase text-slate-500">Name</Label>
                                                                            <Input
                                                                                className="h-8 text-sm bg-white"
                                                                                placeholder="Full Name"
                                                                                value={card.title || ''}
                                                                                onChange={e => {
                                                                                    const updated = [...(activeSection.settings.cards || [])];
                                                                                    updated[ci] = { ...updated[ci], title: e.target.value };
                                                                                    updateSection(activeSection.id, { cards: updated });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[10px] uppercase text-slate-500">Role / Title</Label>
                                                                            <Input
                                                                                className="h-8 text-sm bg-white"
                                                                                placeholder="e.g. Co-Founder"
                                                                                value={card.role || ''}
                                                                                onChange={e => {
                                                                                    const updated = [...(activeSection.settings.cards || [])];
                                                                                    updated[ci] = { ...updated[ci], role: e.target.value };
                                                                                    updateSection(activeSection.id, { cards: updated });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Photo URL</Label>
                                                                        <Input
                                                                            className="h-8 text-xs bg-white font-mono"
                                                                            placeholder="https://... or pick from media"
                                                                            value={card.image || ''}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], image: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    {mediaItems.length > 0 && (
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[10px] uppercase text-slate-500">Pick from Media Library</Label>
                                                                            <select
                                                                                className="w-full h-7 rounded border bg-white px-2 text-[10px]"
                                                                                value={card.image || ''}
                                                                                onChange={e => {
                                                                                    const updated = [...(activeSection.settings.cards || [])];
                                                                                    updated[ci] = { ...updated[ci], image: e.target.value };
                                                                                    updateSection(activeSection.id, { cards: updated });
                                                                                }}
                                                                            >
                                                                                <option value="">— Select —</option>
                                                                                {mediaItems.map((m: any) => <option key={m.id} value={m.url}>{m.title || m.url}</option>)}
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Short Bio</Label>
                                                                        <Textarea
                                                                            className="min-h-[56px] text-xs bg-white"
                                                                            placeholder="Brief bio..."
                                                                            value={card.description || ''}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], description: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* Values Grid fields */}
                                                            {activeSection.type === 'values_grid' && (
                                                                <>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Value Name</Label>
                                                                        <Input
                                                                            className="h-8 text-sm bg-white"
                                                                            placeholder="e.g. Authenticity"
                                                                            value={card.title || ''}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], title: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Description</Label>
                                                                        <Textarea
                                                                            className="min-h-[72px] text-sm bg-white"
                                                                            placeholder="What does this value mean?"
                                                                            value={card.description || ''}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], description: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* FAQ cards editor */}
                                        {activeSection.type === 'faq' && (
                                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-slate-700 text-xs uppercase">FAQ Items</h3>
                                                    <button onClick={() => {
                                                        const existing = activeSection.settings.cards || [];
                                                        updateSection(activeSection.id, { cards: [...existing, { question: 'New Question', answer: 'Answer here.' }] });
                                                    }} className="flex items-center gap-1 h-7 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold transition-all">
                                                        <Plus size={11} /> Add FAQ
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(activeSection.settings.cards || []).map((card: any, ci: number) => (
                                                        <div key={ci} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                                                            <button onClick={() => { const u = [...(activeSection.settings.cards || [])]; u.splice(ci, 1); updateSection(activeSection.id, { cards: u }); }} className="absolute top-2 right-2 h-5 w-5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-500 text-xs font-bold flex items-center justify-center">×</button>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] uppercase text-slate-500">Question</Label>
                                                                <Input className="h-8 text-sm bg-white" placeholder="What is...?" value={card.question || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], question: e.target.value }; updateSection(activeSection.id, { cards: u }); }} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] uppercase text-slate-500">Answer</Label>
                                                                <Textarea className="min-h-[72px] text-sm bg-white" placeholder="The answer..." value={card.answer || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], answer: e.target.value }; updateSection(activeSection.id, { cards: u }); }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Related Cards / Image Gallery / Table of Contents card editors */}
                                        {['related_cards', 'image_gallery', 'table_of_contents'].includes(activeSection.type) && (
                                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-slate-700 text-xs uppercase">{activeSection.type === 'related_cards' ? 'Link Cards' : activeSection.type === 'image_gallery' ? 'Images' : 'TOC Items'}</h3>
                                                    <button onClick={() => {
                                                        const existing = activeSection.settings.cards || [];
                                                        const newCard: any = activeSection.type === 'related_cards'
                                                            ? { title: 'Related Page', description: 'Description', link: '/', icon: '📄' }
                                                            : activeSection.type === 'image_gallery'
                                                                ? { title: 'Image', image: '' }
                                                                : { title: 'Section', link: '#section' };
                                                        updateSection(activeSection.id, { cards: [...existing, newCard] });
                                                    }} className="flex items-center gap-1 h-7 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold transition-all">
                                                        <Plus size={11} /> Add Item
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(activeSection.settings.cards || []).map((card: any, ci: number) => (
                                                        <div key={ci} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                                                            <button onClick={() => { const u = [...(activeSection.settings.cards || [])]; u.splice(ci, 1); updateSection(activeSection.id, { cards: u }); }} className="absolute top-2 right-2 h-5 w-5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-500 text-xs font-bold flex items-center justify-center">×</button>

                                                            {/* Related Cards fields */}
                                                            {activeSection.type === 'related_cards' && (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Icon (emoji)</Label><Input className="h-8 text-sm bg-white" placeholder="🔒" value={card.icon || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], icon: e.target.value }; updateSection(activeSection.id, { cards: u }); }} /></div>
                                                                        <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Title</Label><Input className="h-8 text-sm bg-white" placeholder="Privacy Policy" value={card.title || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], title: e.target.value }; updateSection(activeSection.id, { cards: u }); }} /></div>
                                                                    </div>
                                                                    <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Short Description</Label><Input className="h-8 text-sm bg-white" placeholder="What this policy covers" value={card.description || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], description: e.target.value }; updateSection(activeSection.id, { cards: u }); }} /></div>
                                                                    <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Link URL</Label><Input className="h-8 text-xs bg-white font-mono" placeholder="/privacy-policy" value={card.link || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], link: e.target.value }; updateSection(activeSection.id, { cards: u }); }} /></div>
                                                                </>
                                                            )}

                                                            {/* Image Gallery fields */}
                                                            {activeSection.type === 'image_gallery' && (
                                                                <>
                                                                    <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Caption</Label><Input className="h-8 text-sm bg-white" placeholder="Image caption" value={card.title || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], title: e.target.value }; updateSection(activeSection.id, { cards: u }); }} /></div>
                                                                    <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Image URL</Label><Input className="h-8 text-xs bg-white font-mono" placeholder="https://..." value={card.image || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], image: e.target.value }; updateSection(activeSection.id, { cards: u }); }} /></div>
                                                                    {mediaItems.length > 0 && (<div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Or pick from library</Label><select className="w-full h-7 rounded border bg-white px-2 text-[10px]" value={card.image || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], image: e.target.value }; updateSection(activeSection.id, { cards: u }); }}><option value="">— Select —</option>{mediaItems.map((m: any) => <option key={m.id} value={m.url}>{m.title || m.url}</option>)}</select></div>)}
                                                                </>
                                                            )}

                                                            {/* Table of Contents fields */}
                                                            {activeSection.type === 'table_of_contents' && (
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Section Name</Label><Input className="h-8 text-sm bg-white" placeholder="Introduction" value={card.title || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], title: e.target.value }; updateSection(activeSection.id, { cards: u }); }} /></div>
                                                                    <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Anchor Link</Label><Input className="h-8 text-xs bg-white font-mono" placeholder="#section-id" value={card.link || ''} onChange={e => { const u = [...(activeSection.settings.cards || [])]; u[ci] = { ...u[ci], link: e.target.value }; updateSection(activeSection.id, { cards: u }); }} /></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Dynamic Items (if applicable) */}
                                        {['featured_stories', 'latest_stories', 'category_grid', 'city_grid', 'rising_hubs'].includes(activeSection.type) && activeSection.settings.items && activeSection.settings.items.length > 0 && (
                                            <div className="space-y-3 pt-4 mt-4 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-slate-700 text-xs uppercase">List Items</h3>
                                                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => {
                                                        const newItems = [...(activeSection.settings.items || [])];
                                                        newItems.push({ title: "New Item", description: "" });
                                                        updateSection(activeSection.id, { items: newItems });
                                                    }}><Plus size={12} className="mr-1" /> Add</Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {activeSection.settings.items.map((item: any, i: number) => (
                                                        <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                                                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => {
                                                                const newItems = [...(activeSection.settings.items || [])];
                                                                newItems.splice(i, 1);
                                                                updateSection(activeSection.id, { items: newItems });
                                                            }}><X size={12} /></Button>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-0.5">
                                                                    <Label className="text-[10px] uppercase text-slate-500">Title</Label>
                                                                    <Input value={item.title || item.name} onChange={e => {
                                                                        const newItems = [...activeSection.settings.items];
                                                                        newItems[i] = { ...newItems[i], title: e.target.value, name: e.target.value };
                                                                        updateSection(activeSection.id, { items: newItems });
                                                                    }} className="bg-white h-8 text-xs" />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label className="text-[10px] uppercase text-slate-500">Image Asset</Label>
                                                                        {mediaItems.length === 0 && (
                                                                            <Link href="/dashboard/media" target="_blank" className="text-[9px] text-blue-600 hover:underline flex items-center gap-0.5">
                                                                                <Plus size={8} /> Upload
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                    <select className="w-full h-8 rounded border text-xs bg-white px-2" value={item.thumbnail || item.image || ""} onChange={e => {
                                                                        const newItems = [...activeSection.settings.items];
                                                                        newItems[i] = { ...newItems[i], thumbnail: e.target.value, image: e.target.value };
                                                                        updateSection(activeSection.id, { items: newItems });
                                                                    }}>
                                                                        <option value="">None</option>
                                                                        {mediaItems.map((m: any) => <option key={m.id} value={m.url}>{m.title || m.url}</option>)}
                                                                        {/* Also include city/category images if applicable */}
                                                                        {cities.some(c => c.image === (item.thumbnail || item.image)) && <option value={item.thumbnail || item.image}>City Image (Selected)</option>}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            {/* Resource Picker Helpers */}
                                                            {['city_grid', 'rising_hubs'].includes(activeSection.type) && (
                                                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                                                    <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-tight">Quick Pick: City</Label>
                                                                    <select
                                                                        className="w-full h-7 rounded border bg-white px-2 text-[10px] font-medium"
                                                                        onChange={e => {
                                                                            const city = cities.find(c => c.slug === e.target.value);
                                                                            if (city) {
                                                                                const newItems = [...activeSection.settings.items];
                                                                                newItems[i] = {
                                                                                    ...newItems[i],
                                                                                    title: city.name,
                                                                                    name: city.name,
                                                                                    slug: city.slug,
                                                                                    image: city.image,
                                                                                    thumbnail: city.image,
                                                                                    tier: city.tier
                                                                                };
                                                                                updateSection(activeSection.id, { items: newItems });
                                                                            }
                                                                        }}
                                                                        value={item.slug || ""}
                                                                    >
                                                                        <option value="">— Select a City —</option>
                                                                        {cities.map((c: any) => <option key={c.id} value={c.slug}>{c.name} (Tier {c.tier})</option>)}
                                                                    </select>
                                                                </div>
                                                            )}

                                                            {activeSection.type === 'category_grid' && (
                                                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                                                    <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-tight">Quick Pick: Category</Label>
                                                                    <select
                                                                        className="w-full h-7 rounded border bg-white px-2 text-[10px] font-medium"
                                                                        onChange={e => {
                                                                            const cat = categories.find(c => c.slug === e.target.value);
                                                                            if (cat) {
                                                                                const newItems = [...activeSection.settings.items];
                                                                                newItems[i] = {
                                                                                    ...newItems[i],
                                                                                    title: cat.name,
                                                                                    name: cat.name,
                                                                                    slug: cat.slug,
                                                                                    image: cat.image,
                                                                                    thumbnail: cat.image
                                                                                };
                                                                                updateSection(activeSection.id, { items: newItems });
                                                                            }
                                                                        }}
                                                                        value={item.slug || ""}
                                                                    >
                                                                        <option value="">— Select a Category —</option>
                                                                        {categories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                                                    </select>
                                                                </div>
                                                            )}

                                                            {['featured_stories', 'latest_stories', 'trending_stories'].includes(activeSection.type) && (
                                                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                                                    <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-tight">Quick Pick: Story</Label>
                                                                    <select
                                                                        className="w-full h-7 rounded border bg-white px-2 text-[10px] font-medium"
                                                                        onChange={e => {
                                                                            const story = recentStories.find(s => s.slug === e.target.value);
                                                                            if (story) {
                                                                                const newItems = [...activeSection.settings.items];
                                                                                newItems[i] = {
                                                                                    ...newItems[i],
                                                                                    title: story.title,
                                                                                    slug: story.slug,
                                                                                    image: story.thumbnail_image || story.image,
                                                                                    thumbnail: story.thumbnail_image || story.image,
                                                                                    category: story.category_name,
                                                                                    date: story.created_at
                                                                                };
                                                                                updateSection(activeSection.id, { items: newItems });
                                                                            }
                                                                        }}
                                                                        value={item.slug || ""}
                                                                    >
                                                                        <option value="">— Recent Stories —</option>
                                                                        {recentStories.map((s: any) => <option key={s.id} value={s.slug}>{s.title}</option>)}
                                                                    </select>
                                                                </div>
                                                            )}

                                                            {['featured_startups', 'startup_cards'].includes(activeSection.type) && (
                                                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                                                    <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-tight">Quick Pick: Startup</Label>
                                                                    <select
                                                                        className="w-full h-7 rounded border bg-white px-2 text-[10px] font-medium"
                                                                        onChange={e => {
                                                                            const startup = recentStartups.find(s => s.slug === e.target.value);
                                                                            if (startup) {
                                                                                const newItems = [...activeSection.settings.items];
                                                                                newItems[i] = {
                                                                                    ...newItems[i],
                                                                                    title: startup.name,
                                                                                    slug: startup.slug,
                                                                                    image: startup.logo,
                                                                                    thumbnail: startup.logo,
                                                                                    category: startup.category_name,
                                                                                    city: startup.city_name,
                                                                                    description: startup.description
                                                                                };
                                                                                updateSection(activeSection.id, { items: newItems });
                                                                            }
                                                                        }}
                                                                        value={item.slug || ""}
                                                                    >
                                                                        <option value="">— Recent Startups —</option>
                                                                        {recentStartups.map((s: any) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                                                                    </select>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Fallback to show Add Item button even if empty for compatible types */}
                                        {['featured_stories', 'latest_stories', 'trending_stories', 'featured_startups', 'startup_cards', 'category_grid', 'city_grid', 'rising_hubs'].includes(activeSection.type) && (!activeSection.settings.items || activeSection.settings.items.length === 0) && (
                                            <div className="pt-2">
                                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                                                    const newItems = [];
                                                    newItems.push({ title: "New Item", description: "" });
                                                    updateSection(activeSection.id, { items: newItems });
                                                }}><Plus size={12} className="mr-1" /> Add First Item</Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Settings Column */}
                                    <div className="col-span-4 space-y-4">
                                        <Card className="shadow-none border border-slate-200 bg-slate-50">
                                            <CardContent className="p-3 space-y-3">
                                                <h3 className="font-bold text-slate-700 text-xs border-b pb-1">Visual Style</h3>
                                                <div className="space-y-2">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-[10px] uppercase text-slate-500">Background</Label>
                                                        <div className="flex gap-2">
                                                            <Input type="color" className="w-full h-6 p-0 cursor-pointer" value={activeSection.settings.backgroundColor || "#ffffff"} onChange={e => updateSection(activeSection.id, { backgroundColor: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label className="text-[10px] uppercase text-slate-500">Alignment</Label>
                                                        <div className="flex bg-white rounded border p-0.5">
                                                            {['left', 'center', 'right'].map((align: string) => (
                                                                <button key={align} onClick={() => updateSection(activeSection.id, { align: align as any })} className={cn("flex-1 h-5 text-[9px] uppercase font-bold rounded transition-colors", activeSection.settings.align === align || (!activeSection.settings.align && align === 'left') ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100")}>{align}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label className="text-[10px] uppercase text-slate-500">Width</Label>
                                                        <select className="w-full h-7 px-1 text-xs border rounded bg-white" value={activeSection.settings.contentWidth || "normal"} onChange={e => updateSection(activeSection.id, { contentWidth: e.target.value as any })}>
                                                            <option value="normal">Normal</option>
                                                            <option value="wide">Wide</option>
                                                            <option value="narrow">Narrow</option>
                                                            <option value="full">Full Screen</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {['hero', 'cta', 'banner'].includes(activeSection.type) && (
                                            <Card className="shadow-none border border-slate-200 bg-slate-50">
                                                <CardContent className="p-3 space-y-3">
                                                    <h3 className="font-bold text-slate-700 text-xs border-b pb-1">Actions</h3>
                                                    <div className="space-y-2">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-[10px] uppercase text-slate-500">Button Label</Label>
                                                            <Input value={activeSection.settings.buttonText || ""} onChange={e => updateSection(activeSection.id, { buttonText: e.target.value })} className="h-7 text-xs bg-white" placeholder="Click here" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <Label className="text-[10px] uppercase text-slate-500">Deep Link</Label>
                                                            <Input value={activeSection.settings.buttonLink || ""} onChange={e => updateSection(activeSection.id, { buttonLink: e.target.value })} className="h-7 bg-white font-mono text-[10px]" placeholder="/path" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        <Card className="shadow-none border border-slate-200 bg-slate-50">
                                            <CardContent className="p-3 space-y-3">
                                                <h3 className="font-bold text-slate-700 text-xs border-b pb-1">Typography</h3>
                                                <div className="space-y-3">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-[10px] uppercase text-slate-500">Font Family</Label>
                                                        <select
                                                            className="w-full h-7 px-1 text-xs border rounded bg-white shadow-sm"
                                                            value={activeSection.settings.fontFamily || 'inherit'}
                                                            onChange={e => updateSection(activeSection.id, { fontFamily: e.target.value })}
                                                        >
                                                            <option value="inherit">Default (Inherit)</option>
                                                            <option value="'Inter', sans-serif">Inter (Sans)</option>
                                                            <option value="'Outfit', sans-serif">Outfit (Premium)</option>
                                                            <option value="'Roboto', sans-serif">Roboto</option>
                                                            <option value="'Merriweather', serif">Merriweather (Serif)</option>
                                                            <option value="'Playfair Display', serif">Playfair Display (Elegant)</option>
                                                            <option value="'Source Code Pro', monospace">Mono Space</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-[10px] uppercase text-slate-500">Font Size</Label>
                                                            <span className="text-[10px] font-mono text-slate-600 bg-white border rounded px-1 shadow-sm">{activeSection.settings.fontSize ?? 16}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min={12}
                                                            max={80}
                                                            step={1}
                                                            value={activeSection.settings.fontSize ?? 16}
                                                            onChange={e => updateSection(activeSection.id, { fontSize: Number(e.target.value) })}
                                                            className="w-full h-1.5 accent-indigo-600 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label className="text-[10px] uppercase text-slate-500">Text Color</Label>
                                                        <div className="flex gap-2 items-center">
                                                            <Input
                                                                type="color"
                                                                className="w-10 h-6 p-0 cursor-pointer border rounded shadow-sm"
                                                                value={activeSection.settings.textColor || '#0F172A'}
                                                                onChange={e => updateSection(activeSection.id, { textColor: e.target.value })}
                                                            />
                                                            <Input
                                                                className="h-6 text-xs font-mono flex-1 bg-white"
                                                                value={activeSection.settings.textColor || '#0F172A'}
                                                                onChange={e => updateSection(activeSection.id, { textColor: e.target.value })}
                                                                placeholder="#0F172A"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-none border border-slate-200 bg-slate-50">
                                            <CardContent className="p-3 space-y-3">
                                                <h3 className="font-bold text-slate-700 text-xs border-b pb-1">Spacing & Margins</h3>
                                                <div className="space-y-4">
                                                    {/* Padding */}
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black uppercase text-slate-400">Padding (Inner)</p>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Vertical ({activeSection.settings.paddingY ?? 80}px)</Label>
                                                                <Input type="number" className="h-7 text-xs bg-white" value={activeSection.settings.paddingY ?? 80} onChange={e => updateSection(activeSection.id, { paddingY: Number(e.target.value) })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Horizontal ({activeSection.settings.paddingX ?? 0}px)</Label>
                                                                <Input type="number" className="h-7 text-xs bg-white" value={activeSection.settings.paddingX ?? 0} onChange={e => updateSection(activeSection.id, { paddingX: Number(e.target.value) })} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Margins */}
                                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                                        <p className="text-[9px] font-black uppercase text-slate-400">Margins (Outer)</p>
                                                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Top</Label>
                                                                <Input type="number" className="h-7 text-xs bg-white" placeholder="0" value={activeSection.settings.marginTop ?? 0} onChange={e => updateSection(activeSection.id, { marginTop: Number(e.target.value) })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Bottom</Label>
                                                                <Input type="number" className="h-7 text-xs bg-white" placeholder="0" value={activeSection.settings.marginBottom ?? 0} onChange={e => updateSection(activeSection.id, { marginBottom: Number(e.target.value) })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Left</Label>
                                                                <Input type="number" className="h-7 text-xs bg-white" placeholder="0" value={activeSection.settings.marginLeft ?? 0} onChange={e => updateSection(activeSection.id, { marginLeft: Number(e.target.value) })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Right</Label>
                                                                <Input type="number" className="h-7 text-xs bg-white" placeholder="0" value={activeSection.settings.marginRight ?? 0} onChange={e => updateSection(activeSection.id, { marginRight: Number(e.target.value) })} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-none border border-slate-200 bg-slate-50">
                                            <CardContent className="p-3 space-y-3">
                                                <h3 className="font-bold text-slate-700 text-xs border-b pb-1">Media</h3>
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase text-slate-500">Pick from Library</Label>
                                                        <select
                                                            className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            value={activeSection.settings.imageUrl || ""}
                                                            onChange={e => updateSection(activeSection.id, { imageUrl: e.target.value })}
                                                        >
                                                            <option value="">— None —</option>
                                                            {mediaItems.map((m: any) => (
                                                                <option key={m.id} value={m.url}>{m.title || m.url || "Untitled"}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase text-slate-500">Or paste image URL</Label>
                                                        <Input
                                                            className="h-7 text-xs bg-white font-mono"
                                                            value={activeSection.settings.imageUrl || ""}
                                                            onChange={e => updateSection(activeSection.id, { imageUrl: e.target.value })}
                                                            placeholder="https://... or /media/..."
                                                        />
                                                    </div>
                                                    {activeSection.settings.imageUrl && (
                                                        <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={getSafeImageSrc(activeSection.settings.imageUrl)}
                                                                alt="Preview"
                                                                className="w-full h-28 object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                            <div className="px-2 py-1 text-[10px] text-slate-400 truncate">
                                                                {mediaItems.find(m => m.url === activeSection.settings.imageUrl)?.title || activeSection.settings.imageUrl}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {activeSection.type === 'image' && (
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase text-slate-500">Caption</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                value={activeSection.settings.caption || ""}
                                                                onChange={e => updateSection(activeSection.id, { caption: e.target.value })}
                                                                placeholder="Optional image caption"
                                                            />
                                                        </div>
                                                    )}
                                                    {mediaItems.length === 0 && (
                                                        <Link href="/dashboard/media" target="_blank" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                                                            <Plus size={10} /> Upload media first
                                                        </Link>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
