"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { generateContent, generateSEO, categoriesApi, Category } from "@/lib/api";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Icon presets matching the frontend category style
const ICON_PRESETS = [
    { name: "fintech", label: "Fintech" },
    { name: "saas", label: "SaaS" },
    { name: "e-commerce", label: "E-commerce" },
    { name: "edtech", label: "Edtech" },
    { name: "healthtech", label: "Healthtech" },
    { name: "mobility", label: "Mobility" },
    { name: "d2c", label: "D2C" },
    { name: "agritech", label: "Agritech" },
    { name: "proptech", label: "Proptech" },
    { name: "travel", label: "Travel" },
    { name: "cybersecurity", label: "Cybersecurity" },
    { name: "ai", label: "AI / ML" },
    { name: "energy", label: "Energy" },
    { name: "gaming", label: "Gaming" },
    { name: "foodtech", label: "Foodtech" },
    { name: "logistics", label: "Logistics" },
    { name: "govtech", label: "Govtech" },
    { name: "media", label: "Media" },
    { name: "hr-tech", label: "HR Tech" },
    { name: "help-circle", label: "Other" },
];

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        iconName: "help-circle",
        meta_title: "",
        meta_description: ""
    });

    useEffect(() => {
        if (slug) {
            loadCategory();
        }
    }, [slug]);

    const loadCategory = async () => {
        setIsFetching(true);
        try {
            const categories = await categoriesApi.list();
            const category = categories.find((c: Category) => c.slug === slug);

            if (category) {
                setFormData({
                    name: category.name || "",
                    slug: category.slug || "",
                    description: category.description || "",
                    iconName: category.iconName || "help-circle",
                    meta_title: "",
                    meta_description: ""
                });
            } else {
                toast.error("Category not found");
                router.push("/dashboard/categories");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load category details");
        } finally {
            setIsFetching(false);
        }
    };

    const handleGenerateContent = async () => {
        if (!formData.name) {
            toast.error("Please enter a category name first");
            return;
        }
        setIsGenerating(true);
        try {
            // Generate description
            const descResult = await generateContent(`Write a clear, professional 2-sentence description for a business category named "${formData.name}". Focus on what kind of companies belong to this category.`);

            // Generate SEO metadata
            const seoResult = await generateSEO({
                title: formData.name,
                description: descResult.content || formData.name,
                content: descResult.content || formData.name,
                type: 'category'
            });

            setFormData(prev => ({
                ...prev,
                description: descResult.content ? descResult.content.trim() : prev.description,
                meta_title: seoResult.meta_title || `${formData.name} Startups | Ecosystem Directory`,
                meta_description: seoResult.meta_description || descResult.content || ""
            }));

            toast.success("Content generated with AI");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate content");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await categoriesApi.update(slug, formData);
            toast.success("Category updated successfully");
            router.push("/dashboard/categories");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to update category");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="admin-page space-y-6 pb-12 max-w-5xl mx-auto">
            {/* Compact Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/40 transition-all active:scale-95"
                    asChild
                >
                    <Link href="/dashboard/categories">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 text-primary font-bold text-[9px] uppercase tracking-[0.2em] mb-0.5"
                    >
                        <Layers className="h-3 w-3" /> Taxonomy Engine
                    </motion.div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                        Edit Category
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                >
                    <div className="px-5 py-4 border-b border-border/40 bg-zinc-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                                <Tag className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900">Basic Information</h2>
                                <p className="text-[10px] text-zinc-500 font-medium">Define the category name and description</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 px-3 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all text-[10px] font-bold uppercase tracking-wider"
                            onClick={handleGenerateContent}
                            disabled={isGenerating || !formData.name}
                        >
                            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                            Auto-Fill with AI
                        </Button>
                    </div>
                    <div className="p-5 space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-700">Category Name</Label>
                            <Input
                                placeholder="e.g. Fintech, Edtech, SaaS"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-10 px-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-700">Description</Label>
                            <Textarea
                                placeholder="Briefly describe what this category covers..."
                                className="min-h-[100px] px-3 py-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10 resize-none leading-relaxed transition-all"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Visual & SEO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="px-5 py-4 border-b border-border/40 bg-zinc-50/50 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                                <Palette className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900">Icon & Style</h2>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                                {ICON_PRESETS.map((preset) => {
                                    const PresetIcon = getIcon(preset.name);
                                    const isSelected = formData.iconName === preset.name;
                                    return (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, iconName: preset.name })}
                                            className={cn(
                                                "aspect-square rounded-xl border-1.5 flex flex-col items-center justify-center transition-all duration-300",
                                                isSelected
                                                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                    : "border-border/40 bg-secondary/10 text-muted-foreground/50 hover:border-primary/40 hover:bg-primary/5"
                                            )}
                                        >
                                            <PresetIcon className={cn("h-4.5 w-4.5 transition-transform", isSelected ? "text-primary scale-110" : "text-foreground/60")} />
                                            <span className={cn("text-[7px] font-black mt-1 uppercase truncate w-full px-1 text-center", isSelected ? "text-primary" : "text-muted-foreground/40")}>
                                                {preset.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-5">
                                <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-1.5 block">Custom Identifier</Label>
                                <Input
                                    placeholder="e.g. credit-card"
                                    value={formData.iconName}
                                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                                    className="h-9 px-3 rounded-lg border-border/40 bg-secondary/10 focus:bg-background text-[11px] font-bold shadow-inner"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* SEO Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="px-5 py-4 border-b border-border/40 bg-zinc-50/50 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                                <Globe className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900">SEO Settings</h2>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-zinc-700">Meta Title</Label>
                                <Input
                                    placeholder="SEO Title..."
                                    className="h-10 px-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10"
                                    value={formData.meta_title}
                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-zinc-700">Meta Description</Label>
                                <Textarea
                                    placeholder="SEO Description..."
                                    className="min-h-[100px] px-3 py-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10 resize-none"
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 sticky bottom-0 bg-[#F8FAFC] py-4 z-10">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-11 px-6 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 uppercase tracking-wide"
                        onClick={() => router.back()}
                    >
                        Discard
                    </Button>
                    <Button
                        type="submit"
                        className="h-11 px-8 rounded-xl text-xs font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
