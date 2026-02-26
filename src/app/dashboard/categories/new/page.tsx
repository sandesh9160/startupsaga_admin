"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    ChevronLeft,
    Sparkles,
    Save,
    Loader2,
    Layers,
    Tag,
    Palette,
    Globe,
} from "lucide-react";
import Link from "next/link";
import { generateContent, generateSEO, categoriesApi } from "@/lib/api";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ICON_PRESETS = [
    { name: "credit-card", label: "Fintech" },
    { name: "cloud", label: "SaaS" },
    { name: "shopping-cart", label: "E-commerce" },
    { name: "graduation-cap", label: "Edtech" },
    { name: "heart-pulse", label: "Healthtech" },
    { name: "car", label: "Mobility" },
    { name: "rocket", label: "D2C" },
    { name: "sprout", label: "Agritech" },
    { name: "building", label: "Proptech" },
    { name: "plane", label: "Travel" },
    { name: "shield", label: "Cybersecurity" },
    { name: "brain", label: "AI / ML" },
    { name: "zap", label: "Energy" },
    { name: "gamepad-2", label: "Gaming" },
    { name: "utensils", label: "Foodtech" },
    { name: "truck", label: "Logistics" },
    { name: "landmark", label: "Govtech" },
    { name: "music", label: "Media" },
    { name: "briefcase", label: "HR Tech" },
    { name: "help-circle", label: "Other" },
];

export default function NewCategoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        iconName: "help-circle",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
    });

    const handleGenerateContent = async () => {
        if (!formData.name) {
            toast.error("Please enter a category name first");
            return;
        }
        setIsGenerating(true);
        try {
            const descResult = await generateContent(
                `Write a clear, professional 2-sentence description for a business category named "${formData.name}". Focus on what kind of companies belong to this category.`
            );
            const seoResult = await generateSEO({
                title: formData.name,
                description: descResult.content || formData.name,
                content: descResult.content || formData.name,
                type: "category",
            });

            setFormData((prev) => ({
                ...prev,
                description: descResult.content ? descResult.content.trim() : prev.description,
                meta_title: seoResult.meta_title || `${formData.name} Startups | Ecosystem Directory`,
                meta_description: seoResult.meta_description || descResult.content || "",
                meta_keywords: seoResult.meta_keywords || prev.meta_keywords,
            }));
            toast.success("Content generated with AI");
        } catch {
            toast.error("Failed to generate content");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await categoriesApi.create(formData);
            toast.success("Category created successfully");
            router.push("/dashboard/categories");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to create category";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <Layers className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Categories</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">New Category</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/categories"
                            className="h-9 w-9 rounded-xl border border-zinc-200 hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm transition-all flex items-center justify-center"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </Link>

                        <button
                            type="button"
                            onClick={handleGenerateContent}
                            disabled={isGenerating || !formData.name}
                            className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
                        >
                            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                            Auto-Fill with AI
                        </button>

                        <button
                            type="submit"
                            form="category-form"
                            disabled={isLoading}
                            className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                        >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {isLoading ? "Saving..." : "Create Category"}
                        </button>
                    </div>
                </div>

                <form id="category-form" onSubmit={handleSubmit} className="space-y-5">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                <Tag className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Basic Info</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Category Name</Label>
                                <Input
                                    placeholder="e.g. Fintech, Edtech, SaaS"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Description</Label>
                                <Textarea
                                    placeholder="Briefly describe what this category covers..."
                                    className="min-h-[100px] rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white resize-none leading-relaxed transition-all text-sm"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Icon Picker + SEO side-by-side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Icon Picker */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Palette className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category Icon</span>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                                    {ICON_PRESETS.map((preset) => {
                                        const PresetIcon = getIcon(preset.name);
                                        const isSelected = formData.iconName === preset.name;
                                        return (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, iconName: preset.name })}
                                                title={preset.label}
                                                className={cn(
                                                    "aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all duration-200",
                                                    isSelected
                                                        ? "border-purple-400 bg-purple-50 text-purple-600 shadow-sm"
                                                        : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-purple-200 hover:bg-purple-50/50"
                                                )}
                                            >
                                                <PresetIcon className={cn("h-4 w-4 transition-transform", isSelected ? "text-purple-600 scale-110" : "text-zinc-400")} />
                                                <span className={cn("text-[6px] font-black uppercase truncate w-full px-0.5 text-center", isSelected ? "text-purple-500" : "text-zinc-300")}>
                                                    {preset.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Custom Icon Name</Label>
                                    <Input
                                        placeholder="e.g. credit-card"
                                        value={formData.iconName}
                                        onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-[11px] font-bold transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Globe className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SEO Settings</span>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Meta Title</Label>
                                        <span className={cn("text-[9px] font-bold", formData.meta_title.length > 60 ? "text-rose-500" : "text-zinc-300")}>
                                            {formData.meta_title.length}/60
                                        </span>
                                    </div>
                                    <Input
                                        placeholder="SEO-optimized title (max 60 chars)"
                                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs transition-all"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Meta Description</Label>
                                        <span className={cn("text-[9px] font-bold", formData.meta_description.length > 160 ? "text-rose-500" : "text-zinc-300")}>
                                            {formData.meta_description.length}/160
                                        </span>
                                    </div>
                                    <Textarea
                                        placeholder="SEO-optimized description (max 160 chars)"
                                        className="min-h-[80px] rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white resize-none text-xs transition-all"
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Meta Keywords</Label>
                                    <Input
                                        placeholder="Keywords, separated, by, commas"
                                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs transition-all"
                                        value={formData.meta_keywords}
                                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
