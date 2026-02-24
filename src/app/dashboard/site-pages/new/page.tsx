"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Save, Loader2, Trash2, Plus, ChevronUp, ChevronDown, Sparkles, X, Layout, Globe, MessageSquare, Image as ImageIcon, Search, Rocket, Eye, PanelBottom, ArrowLeft,
    Settings,
    Type,
    Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { fetchAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import Link from "next/link";

type SectionType = "hero" | "text" | "image" | "video" | "banner" |
    "featured_stories" | "latest_stories" | "featured_startups" |
    "startup_cards" | "category_grid" | "city_grid" | "newsletter" | "cta" | "trending_stories" |
    "policy_section" | "faq" | "callout" | "related_cards" | "image_gallery" | "table_of_contents" |
    "mission_vision" | "stats_bar" | "team_grid" | "values_grid";

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
    paddingY?: number;
    paddingX?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    titleSize?: number;
    contentWidth?: "full" | "wide" | "normal" | "narrow";
    items?: any[];
    cards?: any[];
    customId?: string;
    altText?: string;
    linkRel?: string;
    fontFamily?: string;
    fontSize?: number;
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
};

const ICON_MAP: Record<string, any> = {
    hero: Sparkles,
    text: Type,
    image: ImageIcon,
    video: Rocket,
    banner: Globe,
    cta: MessageSquare,
    featured_stories: Layout,
    latest_stories: Layout,
    featured_startups: PanelBottom,
    startup_cards: PanelBottom,
    category_grid: Layout,
    city_grid: Layout,
    newsletter: MessageSquare,
    trending_stories: Layout,
    policy_section: Type,
    faq: MessageSquare,
    callout: MessageSquare,
    related_cards: Layout,
    image_gallery: ImageIcon,
    table_of_contents: Layout,
    mission_vision: Layout,
    stats_bar: PanelBottom,
    team_grid: PanelBottom,
    values_grid: Layout,
};

function TabButton({ id, label, active, onClick, icon: Icon }: any) {
    const isActive = active === id;
    return (
        <button
            type="button"
            onClick={() => onClick(id)}
            className={cn(
                "px-5 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap min-w-fit",
                isActive
                    ? "border-purple-600 text-purple-600 bg-purple-50/30"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
            )}
        >
            {Icon && <Icon size={14} className={cn(isActive ? "text-purple-600" : "text-slate-400")} />}
            {label}
        </button>
    );
}

export default function NewPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("general");
    const [formData, setFormData] = useState<any>({
        title: "",
        slug: "",
        content: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        status: "draft",
    });

    const [sections, setSections] = useState<PageSection[]>([]);
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

    const addSection = (type: SectionType) => {
        const baseSettings: Record<SectionType, SectionSettings> = {
            hero: { title: "New Hero Section", subtitle: "Highlight your key message.", buttonText: "Get Started", align: "center", backgroundColor: "#f8fafc", titleSize: 48, contentWidth: "wide", paddingY: 80 },
            text: { title: "Content Section", body: "Write your story here...", align: "left", backgroundColor: "#ffffff", titleSize: 32, contentWidth: "normal" },
            image: { caption: "Featured image caption", align: "center", backgroundColor: "#ffffff", contentWidth: "wide" },
            video: { caption: "Video documentation", align: "center", backgroundColor: "#0f172a", textColor: "#ffffff", contentWidth: "wide" },
            banner: { title: "Promotional Banner", subtitle: "LIMITED TIME", buttonText: "Explore Now", backgroundColor: "#FF5722", textColor: "#FFFFFF" },
            featured_stories: { title: "Featured Stories", subtitle: "Curated chronicles of success" },
            latest_stories: { title: "Latest Stories", subtitle: "Fresh insights from the ecosystem" },
            featured_startups: { title: "Featured Startups", subtitle: "Innovators making waves" },
            startup_cards: { title: "Startup Directory", subtitle: "Browse the complete list" },
            category_grid: { title: "Browse by Category", subtitle: "Find startups by industry" },
            city_grid: { title: "Startup Hubs", subtitle: "Explore innovation across cities" },
            newsletter: { title: "Stay Updated", body: "Get the latest startup stories delivered to your inbox.", buttonText: "Subscribe Now" },
            cta: { title: "Ready to launch?", body: "Submit your startup today and get featured.", buttonText: "Submit Startup", buttonLink: "/submit" },
            trending_stories: { title: "Trending Stories", subtitle: "Most popular reads" },
            policy_section: { title: "Policy Title", body: "Policy content goes here...", backgroundColor: "#ffffff" },
            faq: { title: "Frequently Asked Questions" },
            callout: { body: "Important notice or callout text.", backgroundColor: "#fff7ed", textColor: "#c2410c" },
            related_cards: { title: "Related Resources" },
            image_gallery: { title: "Image Gallery" },
            table_of_contents: { title: "Jump to Section" },
            mission_vision: { title: "Our Mission & Vision" },
            stats_bar: { title: "The Impact" },
            team_grid: { title: "Meet Our Team" },
            values_grid: { title: "Our Values" }
        };

        const newSection: PageSection = {
            id: `${type}-${Date.now()}`,
            type,
            settings: baseSettings[type],
            is_active: true
        };

        setSections([...sections, newSection]);
        setActiveTab(newSection.id);
        setAddSectionOpen(false);
    };

    const updateSection = (id: string, patch: Partial<SectionSettings>) => {
        setSections(sections.map(s => s.id === id ? { ...s, settings: { ...s.settings, ...patch } } : s));
    };

    const deleteSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
        setActiveTab("structure");
    };

    const moveSection = (id: string, direction: 'up' | 'down') => {
        const idx = sections.findIndex(s => s.id === id);
        if (idx === -1) return;
        const newSections = [...sections];
        if (direction === 'up' && idx > 0) {
            [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
        } else if (direction === 'down' && idx < sections.length - 1) {
            [newSections[idx + 1], newSections[idx]] = [newSections[idx], newSections[idx + 1]];
        }
        setSections(newSections);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error("Please enter a page title");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create the Page first
            const pagePayload = {
                ...formData,
                theme_overrides: {
                    sections: sections.map((s, i) => ({ ...s, order: i }))
                }
            };

            const createdPage = await fetchAPI("/pages/create/", {
                method: "POST",
                body: JSON.stringify(pagePayload)
            });

            if (!createdPage || !createdPage.id) {
                throw new Error("Failed to create page");
            }

            // 2. Create Sections linked to the new page
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const sectionPayload = {
                    page: 'custom',
                    page_obj: createdPage.id,
                    section_type: section.type,
                    title: section.settings.title || "",
                    subtitle: section.settings.subtitle || "",
                    content: section.settings.body || "",
                    link_text: section.settings.buttonText || "",
                    link_url: section.settings.buttonLink || "",
                    order: i,
                    is_active: section.is_active !== undefined ? section.is_active : true,
                    settings: section.settings
                };

                await fetchAPI("/sections/create/", {
                    method: "POST",
                    body: JSON.stringify(sectionPayload)
                });
            }

            toast.success("Page created successfully!");
            router.push("/dashboard/site-pages");
        } catch (error: any) {
            console.error("Creation error:", error);
            toast.error(error.message || "Failed to create page");
        } finally {
            setIsLoading(false);
        }
    };

    const activeSection = sections.find(s => s.id === activeTab);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-white border border-zinc-200 shadow-sm rounded-xl hover:bg-zinc-100" asChild>
                            <Link href="/dashboard/site-pages"><ArrowLeft size={16} className="text-zinc-600" /></Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                                <Plus className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Website</p>
                                <h1 className="text-xl font-bold tracking-tight text-zinc-900">Create New Page</h1>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Publish Page
                    </Button>
                </div>

                {/* Main Editor UI */}
                <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden min-h-[600px] flex flex-col">
                    {/* Tabs */}
                    <div className="border-b border-zinc-100 flex items-center gap-1 overflow-x-auto bg-zinc-50/50 no-scrollbar">
                        <TabButton id="general" label="Basic Info" active={activeTab} onClick={setActiveTab} icon={Type} />
                        <TabButton id="structure" label="Visual Layout" active={activeTab} onClick={setActiveTab} icon={Layout} />

                        {sections.map((s) => (
                            <TabButton
                                key={s.id}
                                id={s.id}
                                label={s.settings.title || s.type.replace(/_/g, " ").toUpperCase()}
                                active={activeTab}
                                onClick={setActiveTab}
                                icon={ICON_MAP[s.type]}
                            />
                        ))}

                        <div className="flex-1" />
                        <TabButton id="seo" label="SEO & Search" active={activeTab} onClick={setActiveTab} icon={Globe} />
                    </div>

                    <div className="p-8 flex-1">
                        {/* Basic Info */}
                        {activeTab === "general" && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Page Title</Label>
                                            <Input
                                                required
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. Our Success Story"
                                                className="h-12 text-base font-medium rounded-xl border-zinc-200 focus:ring-purple-500/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">URL Slug</Label>
                                            <Input
                                                value={formData.slug}
                                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                placeholder="e.g. success-story"
                                                className="h-12 font-mono text-sm rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Content (Simple Text)</Label>
                                        <RichTextEditor
                                            content={formData.content}
                                            onChange={content => setFormData({ ...formData, content })}
                                            placeholder="Standard page content (for simple pages)..."
                                        />
                                    </div>

                                    <div className="p-6 bg-purple-50/50 border border-purple-100/50 rounded-2xl flex items-start gap-4">
                                        <Sparkles className="text-purple-500 shrink-0" size={20} />
                                        <div>
                                            <h4 className="text-sm font-bold text-purple-900">Want a richer layout?</h4>
                                            <p className="text-xs text-purple-700/70 leading-relaxed">Go to the <strong>Visual Layout</strong> tab to build your page using modular sections like Heros, Story Grids, and CTAs.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Page Structure */}
                        {activeTab === "structure" && (
                            <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-bold text-slate-900 font-sans">Visual Storyboard</h2>
                                        <p className="text-xs text-slate-500 font-medium tracking-wide">Stack and arrange modular sections to build your page.</p>
                                    </div>

                                    <div className="relative" ref={addSectionMenuRef}>
                                        <Button
                                            type="button"
                                            onClick={() => setAddSectionOpen(!addSectionOpen)}
                                            className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-100 gap-2"
                                        >
                                            <Plus size={16} /> Add Section
                                        </Button>

                                        {addSectionOpen && (
                                            <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Core Elements</p>
                                                        {["hero", "text", "image", "cta", "banner", "callout"].map(type => (
                                                            <button key={type} onClick={() => addSection(type as any)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg flex items-center justify-between group">
                                                                <span className="capitalize">{type.replace(/_/g, " ")}</span>
                                                                <Plus size={14} className="opacity-0 group-hover:opacity-100 text-blue-400" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <p className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Content Modules</p>
                                                        {["faq", "policy_section", "related_cards", "image_gallery", "table_of_contents"].map(type => (
                                                            <button key={type} onClick={() => addSection(type as any)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg flex items-center justify-between group">
                                                                <span className="capitalize">{type.replace(/_/g, " ")}</span>
                                                                <Plus size={14} className="opacity-0 group-hover:opacity-100 text-blue-400" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <p className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">About & Stats</p>
                                                        {["mission_vision", "stats_bar", "team_grid", "values_grid"].map(type => (
                                                            <button key={type} onClick={() => addSection(type as any)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg flex items-center justify-between group">
                                                                <span className="capitalize">{type.replace(/_/g, " ")}</span>
                                                                <Plus size={14} className="opacity-0 group-hover:opacity-100 text-blue-400" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <p className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Dynamic Grids</p>
                                                        {["latest_stories", "trending_stories", "featured_startups", "startup_cards", "category_grid", "city_grid", "newsletter"].map(type => (
                                                            <button key={type} onClick={() => addSection(type as any)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg flex items-center justify-between group">
                                                                <span className="capitalize">{type.replace(/_/g, " ")}</span>
                                                                <Plus size={14} className="opacity-0 group-hover:opacity-100 text-blue-400" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {sections.map((s, idx) => (
                                        <div key={s.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-all group">
                                            <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                {(() => {
                                                    const Icon = ICON_MAP[s.type] || Layout;
                                                    return <Icon size={20} />;
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveTab(s.id)}>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <Badge className="text-[9px] uppercase tracking-widest px-1.5 h-4 bg-zinc-100 text-zinc-500 border-0">{s.type.replace(/_/g, " ")}</Badge>
                                                </div>
                                                <h3 className="font-bold text-sm text-slate-800">{s.settings.title || "Untitled Section"}</h3>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-purple-600 hover:bg-purple-50" onClick={() => moveSection(s.id, 'up')} disabled={idx === 0}><ChevronUp size={14} /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-purple-600 hover:bg-purple-50" onClick={() => moveSection(s.id, 'down')} disabled={idx === sections.length - 1}><ChevronDown size={14} /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteSection(s.id)}><Trash2 size={14} /></Button>
                                            </div>
                                        </div>
                                    ))}

                                    {sections.length === 0 && (
                                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                            <Layout size={40} className="mx-auto text-slate-200 mb-4" />
                                            <h3 className="font-bold text-slate-400">Your page is empty</h3>
                                            <p className="text-xs text-slate-400 mt-1">Start by adding a Hero section.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Partial: Dynamic Section Editor */}
                        {activeSection && (
                            <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                                            {(() => {
                                                const Icon = ICON_MAP[activeSection.type] || Layout;
                                                return <Icon size={16} />;
                                            })()}
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900 capitalize">{activeSection.type.replace(/_/g, " ")} Content</h2>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 font-bold" onClick={() => deleteSection(activeSection.id)}>
                                        <Trash2 size={14} className="mr-2" /> Delete Section
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-6">
                                        {(activeSection.type === 'hero' || activeSection.type === 'text' || activeSection.type === 'cta' || activeSection.type === 'banner' || activeSection.type === 'callout' || activeSection.type === 'policy_section') && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Section Heading</Label>
                                                    <Input
                                                        value={activeSection.settings.title || ""}
                                                        onChange={e => updateSection(activeSection.id, { title: e.target.value })}
                                                        placeholder="Enter heading..."
                                                        className="h-11 rounded-xl text-sm font-medium border-slate-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subheading / Description</Label>
                                                    <Textarea
                                                        value={activeSection.settings.subtitle || activeSection.settings.body || ""}
                                                        onChange={e => updateSection(activeSection.id, { [(['text', 'policy_section', 'callout'].includes(activeSection.type)) ? 'body' : 'subtitle']: e.target.value })}
                                                        placeholder="Write something engaging..."
                                                        className="min-h-[100px] rounded-xl text-sm border-slate-200"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {activeSection.type === 'image' && (
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Image URL</Label>
                                                <Input
                                                    value={activeSection.settings.imageUrl || ""}
                                                    onChange={e => updateSection(activeSection.id, { imageUrl: e.target.value })}
                                                    placeholder="https://example.com/image.jpg"
                                                    className="h-11 rounded-xl border-slate-200 text-sm"
                                                />
                                            </div>
                                        )}

                                        {(activeSection.type === 'hero' || activeSection.type === 'cta' || activeSection.type === 'banner' || activeSection.type === 'image') && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Button Text</Label>
                                                    <Input
                                                        value={activeSection.settings.buttonText || ""}
                                                        onChange={e => updateSection(activeSection.id, { buttonText: e.target.value })}
                                                        placeholder="e.g. Learn More"
                                                        className="h-11 rounded-xl border-slate-200 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Button URL</Label>
                                                    <Input
                                                        value={activeSection.settings.buttonLink || ""}
                                                        onChange={e => updateSection(activeSection.id, { buttonLink: e.target.value })}
                                                        placeholder="e.g. /about"
                                                        className="h-11 rounded-xl border-slate-200 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeSection.type === 'video' && (
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Video URL (YouTube/Vimeo)</Label>
                                                <Input
                                                    value={activeSection.settings.videoUrl || ""}
                                                    onChange={e => updateSection(activeSection.id, { videoUrl: e.target.value })}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    className="h-11 rounded-xl border-slate-200 text-sm"
                                                />
                                            </div>
                                        )}

                                        {/* Card Editor for FAQ, Related Cards, Gallery, etc. */}
                                        {['faq', 'related_cards', 'image_gallery', 'mission_vision', 'stats_bar', 'team_grid', 'values_grid', 'table_of_contents'].includes(activeSection.type) && (
                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Items / Cards</Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const existing = activeSection.settings.cards || [];
                                                            let newCard: any = { title: "New Item", description: "Body text" };
                                                            if (activeSection.type === 'faq') newCard = { question: "New Question", answer: "Definition..." };
                                                            if (activeSection.type === 'image_gallery') newCard = { title: "New Image", image: "" };
                                                            if (activeSection.type === 'team_grid') newCard = { title: "Name", role: "Role", image: "", description: "" };

                                                            updateSection(activeSection.id, { cards: [...existing, newCard] });
                                                        }}
                                                        className="h-7 text-[10px] font-bold uppercase text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3"
                                                    >
                                                        <Plus size={12} className="mr-1" /> Add Card
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    {(activeSection.settings.cards || []).map((card: any, ci: number) => (
                                                        <div key={ci} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3 relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...(activeSection.settings.cards || [])];
                                                                    updated.splice(ci, 1);
                                                                    updateSection(activeSection.id, { cards: updated });
                                                                }}
                                                                className="absolute top-2 right-2 h-5 w-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-[10px] hover:bg-rose-200 transition-colors"
                                                            >
                                                                ×
                                                            </button>

                                                            {activeSection.type === 'faq' ? (
                                                                <>
                                                                    <Input
                                                                        placeholder="Question"
                                                                        className="h-9 bg-white text-sm"
                                                                        value={card.question || ""}
                                                                        onChange={e => {
                                                                            const updated = [...(activeSection.settings.cards || [])];
                                                                            updated[ci] = { ...updated[ci], question: e.target.value };
                                                                            updateSection(activeSection.id, { cards: updated });
                                                                        }}
                                                                    />
                                                                    <Textarea
                                                                        placeholder="Answer"
                                                                        className="min-h-[60px] bg-white text-sm"
                                                                        value={card.answer || ""}
                                                                        onChange={e => {
                                                                            const updated = [...(activeSection.settings.cards || [])];
                                                                            updated[ci] = { ...updated[ci], answer: e.target.value };
                                                                            updateSection(activeSection.id, { cards: updated });
                                                                        }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Input
                                                                        placeholder="Title / Heading"
                                                                        className="h-9 bg-white text-sm"
                                                                        value={card.title || ""}
                                                                        onChange={e => {
                                                                            const updated = [...(activeSection.settings.cards || [])];
                                                                            updated[ci] = { ...updated[ci], title: e.target.value };
                                                                            updateSection(activeSection.id, { cards: updated });
                                                                        }}
                                                                    />
                                                                    {activeSection.type !== 'image_gallery' && (
                                                                        <Textarea
                                                                            placeholder="Description / Body"
                                                                            className="min-h-[60px] bg-white text-sm"
                                                                            value={card.description || ""}
                                                                            onChange={e => {
                                                                                const updated = [...(activeSection.settings.cards || [])];
                                                                                updated[ci] = { ...updated[ci], description: e.target.value };
                                                                                updateSection(activeSection.id, { cards: updated });
                                                                            }}
                                                                        />
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Style Controls */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                                            {/* Typography */}
                                            <Card className="shadow-none bg-slate-50/50 border-slate-200">
                                                <CardContent className="p-4 space-y-4">
                                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-2">Typography</h3>
                                                    <div className="space-y-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[11px] font-bold text-slate-600">Font Family</Label>
                                                            <select
                                                                className="w-full h-10 px-3 text-sm border rounded-xl bg-white shadow-sm"
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
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-[11px] font-bold text-slate-600">Font Size ({activeSection.settings.fontSize ?? 16}px)</Label>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min={12}
                                                                max={80}
                                                                step={1}
                                                                value={activeSection.settings.fontSize ?? 16}
                                                                onChange={e => updateSection(activeSection.id, { fontSize: Number(e.target.value) })}
                                                                className="w-full h-1.5 accent-purple-600 cursor-pointer"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[11px] font-bold text-slate-600">Text Color</Label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="color"
                                                                    className="w-12 h-10 p-1 cursor-pointer border rounded-xl shadow-sm bg-transparent"
                                                                    value={activeSection.settings.textColor || '#0F172A'}
                                                                    onChange={e => updateSection(activeSection.id, { textColor: e.target.value })}
                                                                />
                                                                <Input
                                                                    className="h-10 text-sm font-mono flex-1 bg-white rounded-xl"
                                                                    value={activeSection.settings.textColor || '#0F172A'}
                                                                    onChange={e => updateSection(activeSection.id, { textColor: e.target.value })}
                                                                    placeholder="#0F172A"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Layout & Spacing */}
                                            <Card className="shadow-none bg-slate-50/50 border-slate-200">
                                                <CardContent className="p-4 space-y-4">
                                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-2">Layout & Spacing</h3>
                                                    <div className="space-y-4">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[11px] font-bold text-slate-600">Background Color</Label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="color"
                                                                    className="w-12 h-10 p-1 cursor-pointer border rounded-xl shadow-sm bg-transparent"
                                                                    value={activeSection.settings.backgroundColor || '#FFFFFF'}
                                                                    onChange={e => updateSection(activeSection.id, { backgroundColor: e.target.value })}
                                                                />
                                                                <Input
                                                                    className="h-10 text-sm font-mono flex-1 bg-white rounded-xl"
                                                                    value={activeSection.settings.backgroundColor || '#FFFFFF'}
                                                                    onChange={e => updateSection(activeSection.id, { backgroundColor: e.target.value })}
                                                                    placeholder="#FFFFFF"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[11px] font-bold text-slate-600">Vertical Pad</Label>
                                                                <Input type="number" className="h-10 bg-white rounded-xl text-sm" value={activeSection.settings.paddingY ?? 80} onChange={e => updateSection(activeSection.id, { paddingY: Number(e.target.value) })} />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[11px] font-bold text-slate-600">Margin Top</Label>
                                                                <Input type="number" className="h-10 bg-white rounded-xl text-sm" placeholder="0" value={activeSection.settings.marginTop ?? 0} onChange={e => updateSection(activeSection.id, { marginTop: Number(e.target.value) })} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[11px] font-bold text-slate-600">Margin Bottom</Label>
                                                                <Input type="number" className="h-10 bg-white rounded-xl text-sm" placeholder="0" value={activeSection.settings.marginBottom ?? 0} onChange={e => updateSection(activeSection.id, { marginBottom: Number(e.target.value) })} />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[11px] font-bold text-slate-600">Horizontal Pad</Label>
                                                                <Input type="number" className="h-10 bg-white rounded-xl text-sm" placeholder="0" value={activeSection.settings.paddingX ?? 0} onChange={e => updateSection(activeSection.id, { paddingX: Number(e.target.value) })} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEO */}
                        {activeTab === "seo" && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Meta Title (Search Heading)</Label>
                                        <Input
                                            value={formData.meta_title}
                                            onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                                            placeholder="StartupSaga | Story Title"
                                            className="h-12 rounded-xl text-sm font-medium border-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Meta Description (Search Blurb)</Label>
                                        <Textarea
                                            value={formData.meta_description}
                                            onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                                            placeholder="Write a brief, catchy summary for Google..."
                                            className="min-h-[120px] rounded-xl border-slate-200 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</Label>
                                        <div className="flex gap-3">
                                            {["draft", "published"].map(s => (
                                                <Button
                                                    key={s}
                                                    type="button"
                                                    variant={formData.status === s ? "default" : "outline"}
                                                    onClick={() => setFormData({ ...formData, status: s })}
                                                    className={cn("h-10 px-6 rounded-xl capitalize font-bold", formData.status === s ? "bg-slate-900 border-slate-900" : "text-slate-500")}
                                                >
                                                    {s}
                                                </Button>
                                            ))}
                                        </div>
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
