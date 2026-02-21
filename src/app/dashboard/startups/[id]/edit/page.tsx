"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchAPI, startupsApi, categoriesApi, hubsApi, generateSEO } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Loader2, BookOpen, User, Tag, Eye, ExternalLink, Sparkles, Upload, Image as ImageIcon, X, Building, Edit, Plus, ChevronLeft, Globe, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSafeImageSrc } from "@/lib/images";

export default function StartupEditPage() {
    const router = useRouter();
    const params = useParams();
    const startupSlug = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const [startup, cats, hubs] = await Promise.all([
                    startupsApi.get(startupSlug),
                    categoriesApi.list(),
                    hubsApi.list()
                ]);

                fetchAPI("/media/").then(data => setMediaItems(Array.isArray(data) ? data : [])).catch(e => console.error(e));

                const processedStartup = {
                    ...startup,
                    category: typeof startup.category === 'object' ? startup.category?.id : startup.category,
                    city: typeof startup.city === 'object' ? startup.city?.id : startup.city,
                    stage: startup.funding_stage || startup.stage || "",
                    business_model: startup.business_model || "",
                    founded_year: startup.founded_year || "",
                    team_size: startup.team_size || "",
                    sector: Array.isArray(startup.industry_tags) ? startup.industry_tags[0] : (startup.industry_tags || startup.sector || ""),
                    thumbnail: startup.og_image || "",
                    meta_keywords: startup.meta_keywords || "",
                    image_alt: startup.og_image_alt || "",
                };
                setFormData(processedStartup);
                setCategories(cats);
                setCities(hubs);
            } catch (error) {
                console.error("Failed to load startup data", error);
                toast.error("Failed to load startup data");
                router.push("/dashboard/startups");
            } finally {
                setIsLoading(false);
            }
        };

        if (startupSlug) loadData();
    }, [startupSlug, router]);

    const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateSEO = async () => {
        if (!formData.name || !formData.description) {
            toast.error("Please fill in Startup Name and Description first");
            return;
        }
        setIsGeneratingSEO(true);
        try {
            const data = await generateSEO({
                title: formData.name,
                description: formData.description,
                content: `Startup: ${formData.name}. Description: ${formData.description}. Founder: ${formData.founder_name || ''}. Website: ${formData.website_url || ''}`,
                type: 'startup'
            });
            if (data) {
                setFormData((prev: any) => ({
                    ...prev,
                    meta_title: data.meta_title || prev.meta_title,
                    meta_description: data.meta_description || prev.meta_description,
                    meta_keywords: data.meta_keywords || prev.meta_keywords,
                }));
                toast.success("SEO content generated!");
            }
        } catch (error) {
            toast.error("Failed to generate SEO content");
        } finally {
            setIsGeneratingSEO(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const addFounder = () => {
        setFormData((prev: any) => ({
            ...prev,
            founders_data: [...(prev.founders_data || []), { name: "", role: "", linkedin: "", image: "" }]
        }));
    };

    const removeFounder = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            founders_data: (prev.founders_data || []).filter((_: any, i: number) => i !== index)
        }));
    };

    const updateFounder = (index: number, field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            founders_data: (prev.founders_data || []).map((f: any, i: number) => i === index ? { ...f, [field]: value } : f)
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const cleanData = {
                name: formData.name,
                tagline: formData.tagline || "",
                description: formData.description,
                website_url: formData.website_url,
                founder_name: formData.founder_name,
                founder_linkedin: formData.founder_linkedin,
                founded_year: formData.founded_year ? parseInt(formData.founded_year.toString()) : undefined,
                funding_stage: formData.stage || "",
                business_model: formData.business_model || "",
                industry_tags: formData.sector ? [formData.sector] : [],
                team_size: formData.team_size || "",
                founders_data: formData.founders_data || [],
                is_featured: formData.is_featured,
                status: formData.status,
                category: formData.category,
                city: formData.city,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                meta_keywords: formData.meta_keywords || "",
                og_image: formData.thumbnail,
                og_image_alt: formData.image_alt || "",
                logo: formData.logo
            };

            await startupsApi.update(startupSlug, cleanData);
            toast.success("Startup updated successfully");
            router.push("/dashboard/startups");
        } catch (error) {
            toast.error("Failed to update startup");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-6 flex flex-col min-h-screen">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200 overflow-hidden shrink-0">
                            {formData.logo ? (
                                <img src={getSafeImageSrc(formData.logo)} alt="" className="h-full w-full object-contain p-1.5" />
                            ) : (
                                <Building className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Startups</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                                {formData.name || "Edit Startup"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push("/dashboard/startups")}
                            className="h-9 w-9 rounded-xl border border-zinc-200 hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm transition-all flex items-center justify-center"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </button>

                        <button
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_SITE_URL}/startups/${startupSlug}`, '_blank')}
                            className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <ExternalLink className="h-3.5 w-3.5" /> Preview
                        </button>

                        <button
                            onClick={onSubmit}
                            disabled={isSaving}
                            className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                        >
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Startup Details */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Building className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Startup Details</span>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Name</Label>
                                        <Input
                                            value={formData.name || ""}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            className="h-9 rounded-xl text-sm border-zinc-200 bg-zinc-50 focus:bg-white transition-all"
                                            placeholder="Startup name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Tagline</Label>
                                        <Input
                                            value={formData.tagline || ""}
                                            onChange={(e) => handleChange("tagline", e.target.value)}
                                            className="h-9 rounded-xl text-sm border-zinc-200 bg-zinc-50 focus:bg-white transition-all"
                                            placeholder="Short pitch"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Description</Label>
                                    <Textarea
                                        value={formData.description || ""}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        className="min-h-[80px] rounded-xl text-sm resize-none border-zinc-200 bg-zinc-50 focus:bg-white transition-all"
                                        placeholder="Company description..."
                                    />
                                </div>

                                {/* Logo + OG Image */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-zinc-100">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Logo</Label>
                                        <div className="flex flex-col gap-2">
                                            <div
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                                className="h-20 w-20 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:border-purple-300 hover:bg-purple-50/20 transition-all"
                                            >
                                                {formData.logo ? (
                                                    <>
                                                        <img src={getSafeImageSrc(formData.logo)} alt="Logo" className="h-full w-full object-contain p-2.5" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-[9px] font-bold bg-black/20 px-2 py-1 rounded-md uppercase">Change</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-70 transition-all">
                                                        <Upload className="h-4 w-4" />
                                                        <span className="text-[9px] font-bold uppercase">Upload</span>
                                                    </div>
                                                )}
                                                <input id="logo-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e, "logo")} />
                                            </div>
                                            <select
                                                className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-2 text-[11px] text-zinc-700 outline-none focus:bg-white transition-all"
                                                value={formData.logo || ""}
                                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                            >
                                                <option value="">Pick from Media Library</option>
                                                {mediaItems.map((m) => (
                                                    <option key={m.id} value={m.url}>{m.title || m.url || "Untitled"}</option>
                                                ))}
                                            </select>
                                            <Input
                                                placeholder="Or paste logo URL..."
                                                value={formData.logo || ""}
                                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                                className="h-9 rounded-xl bg-zinc-50 border-zinc-200 text-[11px] focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Cover Image (OG)</Label>
                                        <div className="flex flex-col gap-2">
                                            <div
                                                onClick={() => document.getElementById('og-upload')?.click()}
                                                className="aspect-video w-full rounded-xl bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:border-purple-300 hover:bg-purple-50/20 transition-all"
                                            >
                                                {formData.thumbnail ? (
                                                    <>
                                                        <img src={getSafeImageSrc(formData.thumbnail)} alt="OG" className="h-full w-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-[9px] font-bold bg-black/20 px-2.5 py-1.5 rounded-md uppercase">Change</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1.5 opacity-40 group-hover:opacity-70 transition-all">
                                                        <ImageIcon className="h-5 w-5" />
                                                        <span className="text-[9px] font-bold uppercase">Upload</span>
                                                    </div>
                                                )}
                                                <input id="og-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e, "thumbnail")} />
                                            </div>
                                            <select
                                                className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-2 text-[11px] text-zinc-700 outline-none focus:bg-white transition-all"
                                                value={formData.thumbnail || ""}
                                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            >
                                                <option value="">Pick from Media Library</option>
                                                {mediaItems.map((m) => (
                                                    <option key={m.id} value={m.url}>{m.title || m.url || "Untitled"}</option>
                                                ))}
                                            </select>
                                            <Input
                                                placeholder="Or paste image URL..."
                                                value={formData.thumbnail || ""}
                                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                                className="h-9 rounded-xl bg-zinc-50 border-zinc-200 text-[11px] focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categorization */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Tag className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Categorization</span>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Category</Label>
                                        <select
                                            className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:bg-white transition-all"
                                            value={formData.category || ""}
                                            onChange={(e) => handleChange("category", e.target.value)}
                                        >
                                            <option value="">None</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">City</Label>
                                        <select
                                            className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:bg-white transition-all"
                                            value={formData.city || ""}
                                            onChange={(e) => handleChange("city", e.target.value)}
                                        >
                                            <option value="">Global / Remote</option>
                                            {cities.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Stage</Label>
                                        <select
                                            className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:bg-white transition-all"
                                            value={formData.stage || ""}
                                            onChange={(e) => handleChange("stage", e.target.value)}
                                        >
                                            <option value="">Unspecified</option>
                                            {["Bootstrapped", "Pre-Seed", "Seed", "Series A", "Series B+", "IPO", "Unicorn"].map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Sector</Label>
                                        <select
                                            className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:bg-white transition-all"
                                            value={formData.sector || ""}
                                            onChange={(e) => handleChange("sector", e.target.value)}
                                        >
                                            <option value="">Multi-Sector</option>
                                            {["B2B SaaS", "B2C Consumer", "Marketplace", "Fintech", "Healthtech", "Deeptech/AI"].map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Founded</Label>
                                            <Input
                                                type="number"
                                                value={formData.founded_year || ""}
                                                onChange={(e) => handleChange("founded_year", parseInt(e.target.value))}
                                                className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs transition-all"
                                                placeholder="YYYY"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Team Size</Label>
                                            <select
                                                className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:bg-white transition-all"
                                                value={formData.team_size || ""}
                                                onChange={(e) => handleChange("team_size", e.target.value)}
                                            >
                                                <option value="">N/A</option>
                                                {["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Business Model</Label>
                                        <select
                                            className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 outline-none focus:bg-white transition-all"
                                            value={formData.business_model || ""}
                                            onChange={(e) => handleChange("business_model", e.target.value)}
                                        >
                                            <option value="">None</option>
                                            {["b2b", "b2c", "b2b2c", "d2c", "saas", "marketplace", "subscription", "freemium", "platform"].map((m) => (
                                                <option key={m} value={m}>{m.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Status</Label>
                                        <div className="flex gap-2">
                                            {['draft', 'published', 'blocked'].map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => handleChange("status", status)}
                                                    className={cn(
                                                        "flex-1 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                                                        formData.status === status
                                                            ? status === 'published' ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                                                : status === 'blocked' ? "bg-rose-500 border-rose-500 text-white shadow-sm"
                                                                    : "bg-amber-500 border-amber-500 text-white shadow-sm"
                                                            : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                                                    )}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Stories */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <BookOpen className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Related Stories</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {formData.related_stories && formData.related_stories.length > 0 && (
                                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 font-bold text-[9px] px-2 py-0 h-5">
                                            {formData.related_stories.length}
                                        </Badge>
                                    )}
                                    <Link
                                        href={`/dashboard/stories/new?startup=${formData.id}`}
                                        className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center gap-1 text-[10px] font-bold text-zinc-600 transition-all"
                                    >
                                        <Plus className="h-3 w-3" /> New Story
                                    </Link>
                                </div>
                            </div>
                            <div className="p-5">
                                {formData.related_stories && formData.related_stories.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {formData.related_stories.map((story: any) => (
                                            <div key={story.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all group">
                                                {story.thumbnail && (
                                                    <div className="h-10 w-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200/50">
                                                        <img src={getSafeImageSrc(story.thumbnail)} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-[11px] text-zinc-900 truncate">{story.title}</h3>
                                                    <Badge variant={story.status === "published" ? "default" : "secondary"} className={cn(
                                                        "text-[8px] font-bold uppercase tracking-tight px-1 h-3.5 mt-0.5",
                                                        story.status === 'published' ? "bg-emerald-500" : "bg-zinc-200 text-zinc-500"
                                                    )}>
                                                        {story.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Link href={`/dashboard/stories/new?editId=${story.id}`} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-violet-50 text-zinc-400 hover:text-violet-600 transition-all">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Link>
                                                    {story.status === "published" && (
                                                        <a href={`/stories/${story.slug}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-sky-50 text-zinc-400 hover:text-sky-600 transition-all">
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50/30">
                                        <BookOpen className="h-6 w-6 text-zinc-200 mx-auto mb-2" />
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No stories connected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <div className="space-y-5">

                        {/* Founders */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <User className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Founders</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={addFounder}
                                    className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center gap-1 text-[10px] font-bold text-zinc-600 transition-all"
                                >
                                    <Plus className="h-3 w-3" /> Add
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {(formData.founders_data || []).length === 0 && (
                                    <div className="text-center py-6 border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50/30">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No founders listed</p>
                                    </div>
                                )}
                                {(formData.founders_data || []).map((founder: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeFounder(idx)}
                                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-300 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                value={founder.name}
                                                onChange={(e) => updateFounder(idx, "name", e.target.value)}
                                                className="h-8 rounded-lg border-zinc-200 bg-white text-[11px]"
                                                placeholder="Name"
                                            />
                                            <Input
                                                value={founder.role}
                                                onChange={(e) => updateFounder(idx, "role", e.target.value)}
                                                className="h-8 rounded-lg border-zinc-200 bg-white text-[11px]"
                                                placeholder="Role"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-300" />
                                            <Input
                                                value={founder.linkedin}
                                                onChange={(e) => updateFounder(idx, "linkedin", e.target.value)}
                                                className="h-8 rounded-lg border-zinc-200 bg-white pl-7 text-[11px]"
                                                placeholder="LinkedIn URL"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SEO Settings</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGenerateSEO}
                                    disabled={isGeneratingSEO}
                                    className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 transition-all"
                                >
                                    {isGeneratingSEO ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                                    Auto-Fill
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Meta Title</Label>
                                        <span className={cn("text-[9px] font-bold", (formData.meta_title?.length || 0) > 60 ? "text-rose-500" : "text-zinc-300")}>
                                            {formData.meta_title?.length || 0}/60
                                        </span>
                                    </div>
                                    <Input
                                        value={formData.meta_title || ""}
                                        onChange={(e) => handleChange("meta_title", e.target.value)}
                                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs transition-all"
                                        placeholder="SEO-optimized title (max 60 chars)"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Meta Description</Label>
                                        <span className={cn("text-[9px] font-bold", (formData.meta_description?.length || 0) > 160 ? "text-rose-500" : "text-zinc-300")}>
                                            {formData.meta_description?.length || 0}/160
                                        </span>
                                    </div>
                                    <Textarea
                                        value={formData.meta_description || ""}
                                        onChange={(e) => handleChange("meta_description", e.target.value)}
                                        className="min-h-[80px] rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs resize-none transition-all"
                                        placeholder="SEO-optimized description (max 160 chars)"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Meta Keywords</Label>
                                    <Input
                                        value={formData.meta_keywords || ""}
                                        onChange={(e) => handleChange("meta_keywords", e.target.value)}
                                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs transition-all"
                                        placeholder="Keywords, separated, by, commas"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Image Alt Text</Label>
                                    <Input
                                        value={formData.image_alt || ""}
                                        onChange={(e) => handleChange("image_alt", e.target.value)}
                                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs transition-all"
                                        placeholder="Descriptive alt text for cover image"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social & Web */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <ExternalLink className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Social & Web</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Website</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                                        <Input
                                            type="url"
                                            value={formData.website_url || ""}
                                            onChange={(e) => handleChange("website_url", e.target.value)}
                                            className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white pl-8 text-xs transition-all"
                                            placeholder="https://company.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Founder LinkedIn</Label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                                        <Input
                                            type="url"
                                            value={formData.founder_linkedin || ""}
                                            onChange={(e) => handleChange("founder_linkedin", e.target.value)}
                                            className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white pl-8 text-xs transition-all"
                                            placeholder="linkedin.com/in/user"
                                        />
                                    </div>
                                </div>

                                {/* Featured toggle */}
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                                    <div>
                                        <div className="text-sm font-black text-zinc-900">Featured</div>
                                        <div className="text-[10px] text-zinc-500">Highlight on homepage</div>
                                    </div>
                                    <Switch
                                        checked={formData.is_featured || false}
                                        onCheckedChange={(checked) => handleChange("is_featured", checked)}
                                        className="data-[state=checked]:bg-purple-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
