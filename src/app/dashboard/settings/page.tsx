"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Save, Globe, Mail, Settings, Search, Sparkles, Loader2, MapPin,
    Phone, ShieldCheck, Shield, Sliders, Zap, Bot, FileText, Cpu,
    Network, Trash2, LayoutGrid, CheckCircle2
} from "lucide-react";
import { getLayoutSettings, updateLayoutSettings, getSEOSettings, updateSEOSettings, generateSEO, generateContent, promptsApi, AIPrompt, systemApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
    const [isApplyingSEO, setIsApplyingSEO] = useState(false);
    const [isApplyingPrompts, setIsApplyingPrompts] = useState(false);
    const [aiLoading, setAiLoading] = useState<string | null>(null);

    const [generalSettings, setGeneralSettings] = useState({
        site_name: "StartupSaga",
        site_tagline: "Chronicles of Indian Innovation",
        site_logo: "",
        support_email: "hello@startupsaga.in",
        support_phone: "",
        support_address: ""
    });

    const [seoSettings, setSeoSettings] = useState<Record<string, any>>({
        default_meta_title: "",
        default_meta_description: "",
        global_keywords: "",
        robots_txt: "",
    });

    const [prompts, setPrompts] = useState<AIPrompt[]>([]);
    const [activeTab, setActiveTab] = useState("site");

    useEffect(() => {
        fetchSettings();
        if (typeof window !== 'undefined') {
            if (window.location.hash === '#seo') setActiveTab("seo");
            if (window.location.hash === '#prompts') setActiveTab("prompts");
        }
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const [layoutData, seoData, promptsData] = await Promise.all([
                getLayoutSettings(),
                getSEOSettings(),
                promptsApi.list().catch(() => [])
            ]);

            if (layoutData) {
                setGeneralSettings(prev => ({
                    ...prev,
                    site_name: layoutData.site_name || prev.site_name,
                    site_tagline: layoutData.site_tagline || prev.site_tagline,
                    site_logo: layoutData.site_logo || prev.site_logo,
                    support_email: layoutData.support_email || prev.support_email,
                    support_phone: layoutData.support_phone || prev.support_phone,
                    support_address: layoutData.support_address || prev.support_address,
                }));
            }

            if (seoData) {
                setSeoSettings(prev => ({
                    ...prev,
                    ...seoData,
                    robots_txt: seoData.robots_txt || prev.robots_txt,
                }));
            }

            if (promptsData) {
                setPrompts(promptsData);
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateLayoutSettings(generalSettings);
            await updateSEOSettings(seoSettings);
            toast.success("System configurations updated");
        } catch (error) {
            // console.error("Failed to save settings", error);
            toast.error("Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAiRewrite = async (text: string, field: string, type: 'general' | 'seo') => {
        if (!text) return;
        const toastId = `ai-${Date.now()}`;
        setAiLoading(toastId);
        toast.loading("Optimizing content...", { id: toastId });

        try {
            const prompt = `Rewrite the following text to be more professional, engaging, and concise for a startup ecosystem platform settings. Text: "${text}"`;
            const res = await generateContent(prompt);

            if (res && res.content) {
                const newText = res.content.trim();
                if (type === 'general') {
                    setGeneralSettings(prev => ({ ...prev, [field]: newText }));
                } else {
                    setSeoSettings(prev => ({ ...prev, [field]: newText }));
                }
                toast.success("Content optimized!", { id: toastId });
            } else {
                toast.error("AI generation failed", { id: toastId });
            }
        } catch (error) {
            toast.error("AI unavailable", { id: toastId });
        } finally {
            setAiLoading(null);
        }
    };

    const handleGenerateSEO = async () => {
        setIsGeneratingSEO(true);
        try {
            const result = await generateSEO({
                title: generalSettings.site_name,
                description: generalSettings.site_tagline,
                content: `Site Name: ${generalSettings.site_name}. Tagline: ${generalSettings.site_tagline}. Platform for Indian startups.`,
                type: 'homepage'
            });

            if (result && !result.error) {
                setSeoSettings(prev => ({
                    ...prev,
                    default_meta_title: result.meta_title || prev.default_meta_title,
                    default_meta_description: result.meta_description || prev.default_meta_description,
                    global_keywords: result.keywords || prev.global_keywords
                }));
                toast.success("AI Search Engine Optimization generated");
            }
        } finally {
            setIsGeneratingSEO(false);
        }
    };

    const handleApplyAllSEO = async () => {
        if (!confirm("This will regenerate SEO metadata for all existing stories, startups, and hubs based on global rules. Continue?")) return;
        setIsApplyingSEO(true);
        const tid = toast.loading("Applying SEO architecture to all nodes...");
        try {
            await systemApi.applyAllSEO();
            toast.success("Global SEO sync complete", { id: tid });
        } catch (error) {
            toast.error("Global sync failed", { id: tid });
        } finally {
            setIsApplyingSEO(false);
        }
    };

    const handleApplyAllPrompts = async () => {
        if (!confirm("This will update all existing pages using these AI rules. Continue?")) return;
        setIsApplyingPrompts(true);
        const tid = toast.loading("Updating website content with new AI rules...");
        try {
            await promptsApi.applyAll();
            toast.success("All pages updated with new AI rules", { id: tid });
        } catch (error) {
            toast.error("Failed to update pages", { id: tid });
        } finally {
            setIsApplyingPrompts(false);
        }
    };

    const handleUpdatePrompt = async (id: number, text: string) => {
        try {
            await promptsApi.update(id, { prompt_text: text });
            toast.success("Prompt Template Updated");
            // Optimistically update local state
            setPrompts(prompts.map(p => p.id === id ? { ...p, prompt_text: text } : p));
        } catch (e) {
            toast.error("Failed to update prompt");
        }
    };

    const handleCreatePrompt = async () => {
        try {
            const newPrompt = {
                name: "New Prompt",
                slug: `prompt-${Date.now()}`,
                prompt_text: "",
                category: "general",
                is_active: true
            };
            const created = await promptsApi.create(newPrompt);
            if (created) {
                setPrompts([...prompts, created]);
                toast.success("New prompt template created");
            }
        } catch (e) {
            toast.error("Failed to create prompt");
        }
    };

    const handleDeletePrompt = async (id: number) => {
        if (!confirm("Are you sure you want to delete this prompt template?")) return;
        try {
            await promptsApi.delete(id);
            setPrompts(prompts.filter(p => p.id !== id));
            toast.success("Prompt deleted");
        } catch (e) {
            toast.error("Failed to delete prompt");
        }
    };

    const AiInput = ({ value, onChange, label, field, type, textarea = false }: any) => (
        <div className="space-y-1 w-full group/ai">
            <div className="flex items-center justify-between">
                <Label className="text-[9px] font-bold uppercase opacity-50 tracking-widest text-[#64748b]">{label}</Label>
                <button
                    onClick={() => handleAiRewrite(value, field, type)}
                    disabled={!!aiLoading || !value}
                    className="opacity-0 group-hover/ai:opacity-100 transition-all duration-300 text-[8px] font-black uppercase text-indigo-500 hover:text-indigo-600 flex items-center gap-1 bg-indigo-50/50 px-1.5 py-0.5 rounded-md"
                >
                    <Sparkles size={10} className="animate-pulse" /> AI Optimize
                </button>
            </div>
            {textarea ? (
                <Textarea
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className="min-h-[50px] rounded-xl text-[11px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all resize-none font-medium text-zinc-800 placeholder:text-zinc-300 shadow-sm"
                />
            ) : (
                <Input
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className="rounded-xl h-9 text-[11px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium text-zinc-800 placeholder:text-zinc-300 shadow-sm"
                />
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 relative">
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500 relative z-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse relative z-10">Initializing Architecture</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans pb-20">
            <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">

                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 pb-6">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-indigo-500 mb-1">
                            <div className="p-1.5 bg-indigo-50 rounded-lg shadow-sm border border-indigo-100/50">
                                <Settings size={16} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Site Management</span>
                        </div>
                        <h1 className="text-xl font-black text-zinc-900 tracking-tight uppercase">
                            Website Settings
                        </h1>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            Identity & Search Optimization <span className="h-1 w-1 rounded-full bg-zinc-200" /> AI Rules
                        </p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-zinc-900 hover:bg-black text-white rounded-xl px-5 font-black text-[9px] uppercase tracking-widest shadow-lg shadow-zinc-900/10 h-9 transition-all active:scale-95 flex items-center gap-2 flex-none"
                    >
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Save Settings
                    </Button>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 backdrop-blur-sm rounded-xl border border-zinc-200/50 w-fit">
                        {[
                            { id: "site", label: "Identity", icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
                            { id: "seo", label: "SEO", icon: Search, color: "text-indigo-500", bg: "bg-indigo-50" },
                            { id: "prompts", label: "AI Writing", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-50" },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id
                                        ? "bg-white text-zinc-900 shadow-md shadow-zinc-200 ring-1 ring-zinc-200/50"
                                        : "text-zinc-500 hover:text-zinc-800"
                                )}
                            >
                                <tab.icon size={12} className={cn(activeTab === tab.id ? tab.color : "opacity-40")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="w-full">
                        <AnimatePresence mode="wait">
                            {activeTab === 'site' && (
                                <motion.div
                                    key="site"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Brand Assets */}
                                        <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative overflow-hidden group/card hover:border-blue-200/50 transition-colors">
                                            <div className="absolute -top-10 -right-10 p-6 opacity-[0.02] group-hover/card:scale-110 transition-transform duration-700">
                                                <Globe size={200} />
                                            </div>

                                            <div className="flex items-center gap-3 border-b border-zinc-50 pb-3 relative z-10">
                                                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50">
                                                    <Globe size={14} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">Brand Info</h3>
                                                    <p className="text-[8px] font-medium text-zinc-400">Basic website identification</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold uppercase opacity-50 tracking-widest text-[#64748b]">Logo URL</Label>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Input
                                                                value={generalSettings.site_logo || ""}
                                                                onChange={e => setGeneralSettings({ ...generalSettings, site_logo: e.target.value })}
                                                                className="rounded-xl h-9 text-[11px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium text-zinc-800 placeholder:text-zinc-300 shadow-sm"
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                        {generalSettings.site_logo && (
                                                            <div className="h-9 w-9 rounded-lg border border-zinc-200/50 bg-white p-1 flex items-center justify-center shrink-0">
                                                                <img src={generalSettings.site_logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <AiInput
                                                    label="Site Name"
                                                    value={generalSettings.site_name}
                                                    onChange={(v: string) => setGeneralSettings({ ...generalSettings, site_name: v })}
                                                    field="site_name"
                                                    type="general"
                                                />
                                                <AiInput
                                                    label="Platform Tagline"
                                                    value={generalSettings.site_tagline}
                                                    onChange={(v: string) => setGeneralSettings({ ...generalSettings, site_tagline: v })}
                                                    field="site_tagline"
                                                    type="general"
                                                />
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative overflow-hidden group/card hover:border-emerald-200/50 transition-colors">
                                            <div className="absolute -top-10 -right-10 p-6 opacity-[0.02] group-hover/card:scale-110 transition-transform duration-700">
                                                <Mail size={200} />
                                            </div>

                                            <div className="flex items-center gap-3 border-b border-zinc-50 pb-3 relative z-10">
                                                <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
                                                    <Zap size={14} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">Contact Info</h3>
                                                    <p className="text-[8px] font-medium text-zinc-400">How users can reach you</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <AiInput
                                                        label="Support Email"
                                                        value={generalSettings.support_email}
                                                        onChange={(v: string) => setGeneralSettings({ ...generalSettings, support_email: v })}
                                                        field="support_email"
                                                        type="general"
                                                    />
                                                    <AiInput
                                                        label="Phone Number"
                                                        value={generalSettings.support_phone}
                                                        onChange={(v: string) => setGeneralSettings({ ...generalSettings, support_phone: v })}
                                                        field="support_phone"
                                                        type="general"
                                                    />
                                                </div>
                                                <AiInput
                                                    label="Office Address"
                                                    value={generalSettings.support_address}
                                                    onChange={(v: string) => setGeneralSettings({ ...generalSettings, support_address: v })}
                                                    field="support_address"
                                                    type="general"
                                                    textarea
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'seo' && (
                                <motion.div
                                    key="seo"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative overflow-hidden group/card">
                                        <div className="absolute -top-10 -right-10 p-6 opacity-[0.02] group-hover/card:scale-110 transition-transform duration-700">
                                            <Search size={250} />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-50 pb-3 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100/50">
                                                    <Search size={14} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">SEO Settings</h3>
                                                    <p className="text-[8px] font-medium text-zinc-400">Improve search engine ranking</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleGenerateSEO}
                                                    disabled={isGeneratingSEO}
                                                    className="h-7 px-3 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all font-black text-[8px] uppercase tracking-widest gap-1.5"
                                                >
                                                    {isGeneratingSEO ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                                    AI Auto-Generate
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={handleApplyAllSEO}
                                                    disabled={isApplyingSEO}
                                                    className="h-7 px-3 rounded-lg bg-zinc-900 text-white hover:bg-black transition-all font-black text-[8px] uppercase tracking-widest gap-1.5 shadow-sm"
                                                >
                                                    {isApplyingSEO ? <Loader2 size={10} className="animate-spin" /> : <LayoutGrid size={10} />}
                                                    Apply SEO to All Pages
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                                            <div className="lg:col-span-8 space-y-4">
                                                <AiInput
                                                    label="Global Meta Title"
                                                    value={seoSettings.default_meta_title}
                                                    onChange={(v: string) => setSeoSettings({ ...seoSettings, default_meta_title: v })}
                                                    field="default_meta_title"
                                                    type="seo"
                                                />
                                                <AiInput
                                                    label="Global Meta Keywords"
                                                    value={seoSettings.global_keywords}
                                                    onChange={(v: string) => setSeoSettings({ ...seoSettings, global_keywords: v })}
                                                    field="global_keywords"
                                                    type="seo"
                                                />
                                                <AiInput
                                                    label="Global Meta Description"
                                                    value={seoSettings.default_meta_description}
                                                    onChange={(v: string) => setSeoSettings({ ...seoSettings, default_meta_description: v })}
                                                    field="default_meta_description"
                                                    type="seo"
                                                    textarea
                                                />
                                            </div>

                                            <div className="lg:col-span-4 flex flex-col gap-3">
                                                <div className="flex-1 p-4 rounded-xl bg-zinc-900 text-zinc-400 flex flex-col justify-center gap-3 relative overflow-hidden group">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 z-0" />
                                                    <div className="relative z-10 space-y-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="p-1 rounded bg-emerald-500/10">
                                                                <ShieldCheck size={12} className="text-emerald-400" />
                                                            </div>
                                                            <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-white">SEO Quality</h4>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-tight">
                                                                <span className="opacity-50">Title Length</span>
                                                                <span className={cn(seoSettings.default_meta_title?.length < 60 ? "text-emerald-400" : "text-amber-400")}>{seoSettings.default_meta_title?.length}/60</span>
                                                            </div>
                                                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className="h-full bg-emerald-400"
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.min((seoSettings.default_meta_title?.length || 0) / 60 * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-tight">
                                                                <span className="opacity-50">Description Length</span>
                                                                <span className={cn(seoSettings.default_meta_description?.length < 160 ? "text-emerald-400" : "text-amber-400")}>{seoSettings.default_meta_description?.length}/160</span>
                                                            </div>
                                                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className="h-full bg-indigo-400"
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.min((seoSettings.default_meta_description?.length || 0) / 160 * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <p className="text-[7px] uppercase leading-relaxed font-bold opacity-30 mt-2">
                                                            * Global rules apply during system-wide sync.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Robots.txt and Sitemap */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative overflow-hidden group/card hover:border-orange-200/50 transition-colors">
                                            <div className="flex items-center gap-3 border-b border-zinc-50 pb-3 relative z-10">
                                                <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100/50">
                                                    <Bot size={14} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">Search Engine Instructions</h3>
                                                    <p className="text-[8px] font-medium text-zinc-400">Control search engine behavior (Robots.txt)</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 relative z-10">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[9px] font-bold uppercase opacity-50 tracking-widest">Robots.txt Content</Label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setSeoSettings({ ...seoSettings, robots_txt: "User-agent: *\nAllow: /" })}
                                                            className="text-[8px] font-bold uppercase text-zinc-400 hover:text-zinc-600 transition-colors bg-zinc-50 px-1.5 py-0.5 rounded"
                                                        >
                                                            Allow All
                                                        </button>
                                                        <button
                                                            onClick={() => setSeoSettings({ ...seoSettings, robots_txt: seoSettings.robots_txt + "\n\nUser-agent: GPTBot\nDisallow: /" })}
                                                            className="text-[8px] font-bold uppercase text-zinc-400 hover:text-red-500 transition-colors bg-zinc-50 px-1.5 py-0.5 rounded"
                                                        >
                                                            Block AI
                                                        </button>
                                                    </div>
                                                </div>
                                                <Textarea
                                                    value={seoSettings.robots_txt}
                                                    onChange={(e) => setSeoSettings({ ...seoSettings, robots_txt: e.target.value })}
                                                    className="min-h-[100px] font-mono text-[10px] bg-zinc-50/50 border-zinc-200/80 resize-none text-zinc-600 focus:bg-white transition-all leading-relaxed rounded-xl"
                                                    placeholder="User-agent: *&#10;Allow: /"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative overflow-hidden group/card hover:border-blue-200/50 transition-colors">
                                            <div className="flex items-center gap-3 border-b border-zinc-50 pb-3 relative z-10">
                                                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50">
                                                    <Network size={14} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">Website Map</h3>
                                                    <p className="text-[8px] font-medium text-zinc-400">Sitemap settings</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Label className="text-[9px] font-bold uppercase opacity-50 tracking-widest">Sitemap XML</Label>
                                                        <a
                                                            href="https://search.google.com/search-console"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[8px] font-bold uppercase text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1 bg-blue-50/50 px-2 py-0.5 rounded-md shadow-sm"
                                                        >
                                                            Console <Sparkles size={8} />
                                                        </a>
                                                    </div>
                                                    <div className="bg-[#fcfdfe] rounded-xl p-3 border border-blue-100/30 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-blue-200/50 transition-all shadow-sm" onClick={() => window.open('/sitemap.xml', '_blank')}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                                <FileText size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                                            </div>
                                                            <code className="text-[10px] font-bold text-zinc-600 tracking-tight">/sitemap.xml</code>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-[9px] text-zinc-400 font-medium leading-relaxed max-w-xs">
                                                        Dynamic sitemap indexing is enabled. All updates are automatically added to your sitemap in real-time.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'prompts' && (
                                <motion.div
                                    key="prompts"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative overflow-hidden group/card">
                                        <div className="absolute -top-10 -right-10 p-6 opacity-[0.02] group-hover/card:scale-110 transition-transform duration-700">
                                            <Bot size={250} />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-50 pb-3 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-7 w-7 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 shadow-sm border border-pink-100/50">
                                                    <Cpu size={14} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">AI Writing Rules</h3>
                                                    <p className="text-[8px] font-medium text-zinc-400">How AI writes your website content</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    variant="secondary"
                                                    onClick={handleApplyAllPrompts}
                                                    disabled={isApplyingPrompts}
                                                    className="h-7 px-3 rounded-lg bg-zinc-900 text-white hover:bg-black transition-all font-black text-[8px] uppercase tracking-widest gap-1.5 shadow-sm"
                                                >
                                                    {isApplyingPrompts ? <Loader2 size={10} className="animate-spin" /> : <LayoutGrid size={10} />}
                                                    Apply Rules to All Pages
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleCreatePrompt}
                                                    className="h-7 px-3 rounded-lg text-pink-600 hover:bg-pink-50 transition-all font-black text-[8px] uppercase tracking-widest gap-1.5"
                                                >
                                                    <Sparkles size={10} className="animate-pulse" />
                                                    Add New Rule
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                            {prompts.map((prompt) => (
                                                <div key={prompt.id} className="space-y-2 group/item p-3 rounded-xl border border-zinc-100 hover:border-pink-200/50 hover:bg-pink-50/10 transition-all bg-[#fafafa]">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[9px] font-black uppercase opacity-60 tracking-widest flex items-center gap-2 text-zinc-600">
                                                            <Sparkles size={10} className="text-pink-400" />
                                                            {prompt.name}
                                                        </Label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[7px] font-black uppercase tracking-widest text-[#a1a1aa] transition-colors">{prompt.category}</div>
                                                            <button
                                                                onClick={() => handleDeletePrompt(prompt.id)}
                                                                className="opacity-0 group-item-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <Textarea
                                                        value={prompt.prompt_text}
                                                        onChange={(e) => {
                                                            const newText = e.target.value;
                                                            setPrompts(prompts.map(p => p.id === prompt.id ? { ...p, prompt_text: newText } : p));
                                                        }}
                                                        onBlur={() => handleUpdatePrompt(prompt.id, prompt.prompt_text)}
                                                        className="min-h-[80px] font-medium text-[10px] bg-white border-zinc-200/60 resize-none text-zinc-700 focus:ring-1 focus:ring-pink-500/20 rounded-lg shadow-sm leading-relaxed"
                                                        placeholder="Enter AI writing instruction..."
                                                    />
                                                    <div className="flex items-center justify-between pt-1.5 opacity-60 group-item-hover:opacity-100 transition-opacity">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[7px] font-black uppercase tracking-tight text-zinc-400">Tokens:</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200/50 uppercase tracking-tighter shadow-sm">{`{title}`}</span>
                                                                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200/50 uppercase tracking-tighter shadow-sm">{`{description}`}</span>
                                                                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200/50 uppercase tracking-tighter shadow-sm">{`{content}`}</span>
                                                                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200/50 uppercase tracking-tighter shadow-sm">{`{slug}`}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-zinc-400 group-item-hover:text-emerald-500 transition-colors flex items-center gap-1 cursor-default text-[7px] font-black uppercase tracking-widest leading-none">
                                                            <CheckCircle2 size={8} /> Sync Ready
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {prompts.length === 0 && (
                                                <div className="col-span-2 py-8 text-center border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-zinc-50/50">
                                                    <Bot size={20} className="text-zinc-200 mb-1" />
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">No AI Rules Found</p>
                                                    <p className="text-[9px] text-zinc-300">Add your first AI writing rule to begin</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
