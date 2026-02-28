"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Save, Globe, Mail, Settings, Search, Sparkles, Loader2, MapPin,
    Phone, ShieldCheck, Shield, Sliders, Zap, Bot, FileText, Cpu,
    Network, Trash2, LayoutGrid, CheckCircle2, Upload
} from "lucide-react";
import { getLayoutSettings, updateLayoutSettings, getSEOSettings, updateSEOSettings, generateContent, systemApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState<string | null>(null);

    const [generalSettings, setGeneralSettings] = useState({
        site_name: "StartupSaga",
        site_tagline: "Chronicles of Indian Innovation",
        site_logo: "",
        site_favicon: "",
        support_email: "hello@startupsaga.in",
        support_phone: "",
        support_address: ""
    });

    const faviconInputRef = useRef<HTMLInputElement>(null);

    const [seoSettings, setSeoSettings] = useState<Record<string, any>>({
        google_analytics_id: "",
        google_site_verification: "",
        robots_txt: "",
    });

    const [activeTab, setActiveTab] = useState("site");

    useEffect(() => {
        fetchSettings();
        if (typeof window !== 'undefined') {
            if (window.location.hash === '#seo') setActiveTab("seo");
        }
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const [layoutData, seoData] = await Promise.all([
                getLayoutSettings(),
                getSEOSettings()
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
                    google_analytics_id: seoData.google_analytics_id || prev.google_analytics_id,
                    google_site_verification: seoData.google_site_verification || prev.google_site_verification,
                    robots_txt: seoData.robots_txt || prev.robots_txt,
                }));
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

    const AiInput = ({ value, onChange, label, field, type, textarea = false }: any) => (
        <div className="space-y-2 w-full group/ai">
            <div className="flex items-center justify-between">
                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">{label}</Label>
                <button
                    onClick={() => handleAiRewrite(value, field, type)}
                    disabled={!!aiLoading || !value}
                    className="opacity-0 group-hover/ai:opacity-100 transition-all duration-300 text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-600 flex items-center gap-1 bg-indigo-50/50 px-2 py-1 rounded-md"
                >
                    <Sparkles size={12} className="animate-pulse" /> AI Optimize
                </button>
            </div>
            {textarea ? (
                <Textarea
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className="min-h-[50px] rounded-xl text-[13px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all resize-none font-medium text-zinc-800 placeholder:text-zinc-400 shadow-sm"
                />
            ) : (
                <Input
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className="rounded-xl h-10 text-[13px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium text-zinc-800 placeholder:text-zinc-400 shadow-sm"
                />
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-4 border-zinc-50 border-t-indigo-500 animate-spin" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-8 px-6 pt-6">
            <div className="max-w-[1100px] mx-auto space-y-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 px-5 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100/50">
                            <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">Configuration</p>
                            <h1 className="text-lg font-bold tracking-tight text-zinc-900 leading-none">Website Settings</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 p-1 bg-white border border-zinc-200 rounded-lg">
                            {[
                                { id: "site", label: "Identity", icon: Globe },
                                { id: "seo", label: "SEO", icon: Search },

                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                        activeTab === tab.id
                                            ? "bg-zinc-900 text-white shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                                    )}
                                >
                                    <tab.icon size={11} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-[11px] gap-2 transition-all active:scale-95 flex-none"
                        >
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                            Save
                        </Button>
                    </div>
                </div>

                {/* ── CONTENT ── */}
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
                                                <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">Brand Info</h3>
                                                <p className="text-[11px] font-medium text-zinc-400">Basic website identification</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="space-y-1">
                                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Logo URL</Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            value={generalSettings.site_logo || ""}
                                                            onChange={e => setGeneralSettings({ ...generalSettings, site_logo: e.target.value })}
                                                            className="rounded-xl h-10 text-[13px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium text-zinc-800 placeholder:text-zinc-400 shadow-sm"
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

                                            {/* Favicon Upload */}
                                            <div className="space-y-2">
                                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Favicon</Label>
                                                <div className="flex gap-3 items-center">
                                                    <div
                                                        onClick={() => faviconInputRef.current?.click()}
                                                        className={cn(
                                                            "h-14 w-14 shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden group/fav",
                                                            generalSettings.site_favicon
                                                                ? "border-blue-300 bg-blue-50/40"
                                                                : "border-zinc-300 bg-zinc-50 hover:border-blue-400 hover:bg-blue-50/30"
                                                        )}
                                                    >
                                                        {generalSettings.site_favicon ? (
                                                            <img src={generalSettings.site_favicon} alt="Favicon" className="h-full w-full object-contain p-1" />
                                                        ) : (
                                                            <Upload className="h-5 w-5 text-zinc-400 group-hover/fav:text-blue-500 transition-colors" />
                                                        )}
                                                    </div>
                                                    <input
                                                        ref={faviconInputRef}
                                                        type="file"
                                                        accept="image/x-icon,image/png,image/svg+xml,image/ico,.ico"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setGeneralSettings(prev => ({ ...prev, site_favicon: reader.result as string }));
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                        <Input
                                                            value={generalSettings.site_favicon || ""}
                                                            onChange={e => setGeneralSettings({ ...generalSettings, site_favicon: e.target.value })}
                                                            className="rounded-xl h-10 text-[13px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium text-zinc-800 placeholder:text-zinc-400 shadow-sm"
                                                            placeholder="https://... or click icon to upload"
                                                        />
                                                        <p className="text-[10px] text-zinc-400 font-medium">Supports .ico, .png, .svg — recommended 32×32px</p>
                                                    </div>
                                                    {generalSettings.site_favicon && (
                                                        <button
                                                            onClick={() => setGeneralSettings(prev => ({ ...prev, site_favicon: "" }))}
                                                            className="h-10 w-10 shrink-0 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-all"
                                                            title="Remove favicon"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
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
                                    <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative group/card hover:border-emerald-200/50 transition-colors">
                                        <div className="flex items-center gap-3 border-b border-zinc-50 pb-3 relative z-10">
                                            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
                                                <Zap size={14} />
                                            </div>
                                            <div>
                                                <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">Contact Info</h3>
                                                <p className="text-[11px] font-medium text-zinc-400">How users can reach you</p>
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
                                <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative group/card">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-50 pb-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100/50">
                                                <Search size={14} />
                                            </div>
                                            <div>
                                                <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">Analytics Settings</h3>
                                                <p className="text-[11px] font-medium text-zinc-400">Track and monitor your website reach</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                        <div className="space-y-4">
                                            <div className="space-y-1 w-full">
                                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Google Analytics ID (G-XXXXXX)</Label>
                                                <Input
                                                    value={seoSettings.google_analytics_id || ""}
                                                    onChange={(e) => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
                                                    placeholder="G-EX4MPL31D"
                                                    className="rounded-xl h-10 text-[13px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium text-zinc-800 placeholder:text-zinc-400 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1 w-full">
                                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Google Site Verification</Label>
                                                <Input
                                                    value={seoSettings.google_site_verification || ""}
                                                    onChange={(e) => setSeoSettings({ ...seoSettings, google_site_verification: e.target.value })}
                                                    placeholder="verification-code-hash"
                                                    className="rounded-xl h-10 text-[13px] bg-white border-zinc-200/60 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium text-zinc-800 placeholder:text-zinc-400 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Robots.txt and Sitemap */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative group/card hover:border-orange-200/50 transition-colors">
                                        <div className="flex items-center gap-3 border-b border-zinc-50 pb-3 relative z-10">
                                            <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100/50">
                                                <Bot size={14} />
                                            </div>
                                            <div>
                                                <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">Search Engine Instructions</h3>
                                                <p className="text-[11px] font-medium text-zinc-400">Control search engine behavior (Robots.txt)</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Robots.txt Content</Label>
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

                                    <div className="p-5 rounded-2xl bg-white border border-zinc-200/50 shadow-sm space-y-4 relative group/card hover:border-blue-200/50 transition-colors">
                                        <div className="flex items-center gap-3 border-b border-zinc-50 pb-3 relative z-10">
                                            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50">
                                                <Network size={14} />
                                            </div>
                                            <div>
                                                <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">Website Map</h3>
                                                <p className="text-[11px] font-medium text-zinc-400">Sitemap settings</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Sitemap XML</Label>
                                                    <a
                                                        href="https://search.google.com/search-console"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase text-white bg-blue-600 hover:bg-blue-700 transition-all px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md"
                                                    >
                                                        <Search size={12} /> Search Console
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

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
