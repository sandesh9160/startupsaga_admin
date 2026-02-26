"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Save, Globe, Mail, Settings, Search, Sparkles, Loader2, MapPin,
    Phone, ShieldCheck, Shield, Sliders, Zap, Bot, FileText, Cpu,
    Network, Trash2, LayoutGrid, CheckCircle2, Share2, Instagram,
    Twitter, Linkedin, Facebook, Youtube, ExternalLink, RefreshCcw,
    Monitor, Lock, Bell, Images, Upload
} from "lucide-react";
import {
    getLayoutSettings,
    updateLayoutSettings,
    getSEOSettings,
    updateSEOSettings,
    generateSEO,
    generateContent,
    systemApi
} from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
    const [isApplyingSEO, setIsApplyingSEO] = useState(false);
    const [aiLoading, setAiLoading] = useState<string | null>(null);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const [generalSettings, setGeneralSettings] = useState({
        site_name: "StartupSaga",
        site_tagline: "Chronicles of Indian Innovation",
        site_logo: "",
        site_favicon: "",
        support_email: "hello@startupsaga.in",
        support_phone: "",
        support_address: "",
        facebook_url: "",
        twitter_url: "",
        linkedin_url: "",
        instagram_url: "",
        youtube_url: ""
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    const [seoSettings, setSeoSettings] = useState<Record<string, any>>({
        default_meta_title: "",
        default_meta_description: "",
        global_keywords: "",
        robots_txt: "",
    });

    const [activeTab, setActiveTab] = useState("identity");

    useEffect(() => {
        fetchSettings();
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace('#', '');
            if (hash && ["identity", "seo", "social", "advanced"].includes(hash)) {
                setActiveTab(hash);
            }
        }
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const [layoutData, seoData] = await Promise.all([
                getLayoutSettings(),
                getSEOSettings(),
            ]);

            if (layoutData) {
                setGeneralSettings(prev => ({
                    ...prev,
                    ...layoutData
                }));
            }

            if (seoData) {
                setSeoSettings(prev => ({
                    ...prev,
                    ...seoData,
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

            // Handle Multipart/FormData if files are selected
            if (logoFile || faviconFile) {
                const formData = new FormData();
                Object.entries(generalSettings).forEach(([key, value]) => {
                    formData.append(key, value || "");
                });
                if (logoFile) formData.append('site_logo', logoFile);
                if (faviconFile) formData.append('site_favicon', faviconFile);

                await updateLayoutSettings(formData);
                setLogoFile(null);
                setFaviconFile(null);
                setLogoPreview(null);
                setFaviconPreview(null);
            } else {
                await updateLayoutSettings(generalSettings);
            }

            await updateSEOSettings(seoSettings);

            // Refresh settings to get actual URLs back from backend
            fetchSettings();
            toast.success("System configurations updated");
        } catch (error) {
            toast.error("Update failed");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'logo') {
                setLogoFile(file);
                setLogoPreview(reader.result as string);
            } else {
                setFaviconFile(file);
                setFaviconPreview(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
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

    const NavItem = ({ id, label, icon: Icon, color }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full",
                activeTab === id
                    ? "bg-violet-50 text-violet-700 shadow-sm border-l-4 border-l-violet-600"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 border-l-4 border-l-transparent"
            )}
        >
            <Icon size={16} className={cn(activeTab === id ? "text-violet-600" : "text-zinc-400")} />
            <span className="flex-1 text-left">{label}</span>
            {activeTab === id && (
                <CheckCircle2 size={12} className="text-violet-600" />
            )}
        </button>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Syncing System Data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
                            <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Configuration</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">System Settings</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchSettings}
                            className="flex items-center gap-2 h-10 px-4 bg-white border border-zinc-200 text-zinc-500 hover:text-violet-600 hover:border-violet-200 rounded-xl font-bold text-xs transition-all shadow-sm"
                        >
                            <RefreshCcw size={14} className={cn(isSaving && "animate-spin")} />
                            Reload
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm shadow-violet-200 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <Save size={15} strokeWidth={2.5} />
                            )}
                            Update Platform
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Nav */}
                    <aside className="lg:w-64 grow-0 space-y-6">
                        <Card className="p-3 rounded-2xl border-zinc-100 bg-white shadow-sm space-y-1">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-3 mb-2 pt-2">Global Settings</p>
                            <NavItem id="identity" label="Site Identity" icon={Globe} />
                            <NavItem id="seo" label="SEO Engine" icon={Search} />
                            <NavItem id="social" label="Social Channels" icon={Share2} />

                            <div className="my-3 border-t border-zinc-50 mx-2" />
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-3 mb-2">Systems</p>
                            <NavItem id="advanced" label="Maintenance" icon={Sliders} />
                            <Link href="/dashboard/prompts" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 border-l-4 border-l-transparent transition-all">
                                <Sparkles size={16} className="text-zinc-400" />
                                AI Writing Rules
                                <ExternalLink size={10} className="ml-auto opacity-40" />
                            </Link>
                        </Card>

                        {/* Status Card */}
                        <div className="p-5 rounded-2xl bg-zinc-900 text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Zap size={80} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Sync Status</p>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs font-bold">Operational</span>
                                </div>
                                <p className="text-[10px] leading-relaxed opacity-70 font-medium">
                                    Global configurations affect all stories and architecture nodes.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "identity" && (
                                    <div className="space-y-6">
                                        <Card className="p-8 rounded-2xl border-zinc-100 shadow-sm bg-white space-y-8">
                                            <div className="space-y-1">
                                                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Identity & Branding</h2>
                                                <p className="text-zinc-400 text-xs font-medium">Update site favicon for browser visibility.</p>
                                            </div>

                                            <div className="max-w-md">
                                                {/* Favicon Upload */}
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Site Favicon</Label>
                                                    <div className="flex items-center gap-6">
                                                        <div
                                                            onClick={() => faviconInputRef.current?.click()}
                                                            className="w-16 h-16 rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-100 flex items-center justify-center overflow-hidden shrink-0 group relative cursor-pointer hover:border-violet-300 transition-colors"
                                                        >
                                                            {(faviconPreview || generalSettings.site_favicon) ? (
                                                                <img src={faviconPreview || generalSettings.site_favicon} alt="Favicon" className="max-w-[70%] max-h-[70%] object-contain" />
                                                            ) : (
                                                                <div className="text-[10px] font-black text-zinc-300">ICO</div>
                                                            )}
                                                            <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Upload size={16} className="text-white" />
                                                            </div>
                                                            <input
                                                                type="file"
                                                                ref={faviconInputRef}
                                                                className="hidden"
                                                                onChange={(e) => handleFileChange(e, 'favicon')}
                                                                accept="image/x-icon,image/png,image/svg+xml"
                                                            />
                                                        </div>
                                                        <div className="space-y-2 flex-1">
                                                            <Input
                                                                value={generalSettings.site_favicon || ""}
                                                                onChange={e => setGeneralSettings({ ...generalSettings, site_favicon: e.target.value })}
                                                                placeholder="Enter URL or upload..."
                                                                className="h-10 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all text-xs font-medium"
                                                            />
                                                            <p className="text-[10px] font-medium text-zinc-400">Standard 32x32px ICO/PNG</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </Card>
                                    </div>
                                )}

                                {activeTab === "seo" && (
                                    <div className="space-y-6">
                                        <Card className="p-8 rounded-2xl border-zinc-100 shadow-sm bg-white space-y-8">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">SEO Architecture</h2>
                                                    <p className="text-zinc-400 text-xs font-medium">Manage global metadata patterns and robots rules.</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleGenerateSEO}
                                                        disabled={isGeneratingSEO}
                                                        className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center gap-2"
                                                    >
                                                        {isGeneratingSEO ? <Loader2 size={13} className="animate-spin" /> : <Bot size={13} />}
                                                        Generate
                                                    </button>
                                                    <button
                                                        onClick={handleApplyAllSEO}
                                                        disabled={isApplyingSEO}
                                                        className="h-9 px-4 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
                                                    >
                                                        {isApplyingSEO ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                                                        Sync Site
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                                <div className="xl:col-span-2 space-y-6">
                                                    <AiField
                                                        label="Default Meta Title"
                                                        value={seoSettings.default_meta_title}
                                                        onChange={(v: string) => setSeoSettings({ ...seoSettings, default_meta_title: v })}
                                                        loading={!!aiLoading}
                                                        onAi={() => handleAiRewrite(seoSettings.default_meta_title, 'default_meta_title', 'seo')}
                                                    />
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Global Keywords</Label>
                                                        <Input
                                                            value={seoSettings.global_keywords}
                                                            onChange={e => setSeoSettings({ ...seoSettings, global_keywords: e.target.value })}
                                                            placeholder="Startup, Innovation, Venture..."
                                                            className="h-10 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all text-xs font-medium px-4"
                                                        />
                                                    </div>
                                                    <AiField
                                                        label="Default Meta Description"
                                                        value={seoSettings.default_meta_description}
                                                        onChange={(v: string) => setSeoSettings({ ...seoSettings, default_meta_description: v })}
                                                        loading={!!aiLoading}
                                                        onAi={() => handleAiRewrite(seoSettings.default_meta_description, 'default_meta_description', 'seo')}
                                                        textarea
                                                    />
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-5">
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck size={16} className="text-violet-600" />
                                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Health Audit</h4>
                                                        </div>
                                                        <div className="space-y-5">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-[10px] font-bold">
                                                                    <span className="text-zinc-400">Title Length</span>
                                                                    <span className={cn(seoSettings.default_meta_title?.length < 60 ? "text-emerald-500" : "text-amber-500")}>{seoSettings.default_meta_title?.length || 0}/60</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-violet-600 transition-all" style={{ width: `${Math.min((seoSettings.default_meta_title?.length || 0) / 60 * 100, 100)}%` }} />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-[10px] font-bold">
                                                                    <span className="text-zinc-400">Description Length</span>
                                                                    <span className={cn(seoSettings.default_meta_description?.length < 160 ? "text-emerald-500" : "text-amber-500")}>{seoSettings.default_meta_description?.length || 0}/160</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min((seoSettings.default_meta_description?.length || 0) / 160 * 100, 100)}%` }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-zinc-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <Network size={16} className="text-zinc-400" />
                                                        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Robots.txt Control</h3>
                                                    </div>
                                                    <Textarea
                                                        value={seoSettings.robots_txt}
                                                        onChange={(e) => setSeoSettings({ ...seoSettings, robots_txt: e.target.value })}
                                                        className="min-h-[140px] font-mono text-[11px] bg-zinc-50 border-zinc-100 rounded-xl p-3 focus:bg-white transition-all text-zinc-600"
                                                        placeholder="User-agent: *&#10;Allow: /"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <Globe size={16} className="text-zinc-400" />
                                                        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Accessibility</h3>
                                                    </div>
                                                    <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-bold text-zinc-800 tracking-tight text-zinc-900">Sitemap Engine</p>
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-[9px] font-bold text-emerald-600 uppercase">
                                                                Active
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => window.open('/sitemap.xml', '_blank')}
                                                            className="w-full h-10 rounded-xl bg-white border border-zinc-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all"
                                                        >
                                                            <FileText size={14} className="text-zinc-400" />
                                                            View XML Sitemap
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === "social" && (
                                    <Card className="p-8 rounded-2xl border-zinc-100 shadow-sm bg-white space-y-8">
                                        <div className="space-y-1">
                                            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Social Infrastructure</h2>
                                            <p className="text-zinc-400 text-xs font-medium">Link official social media profiles and channels.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                            <SocialInput
                                                icon={Twitter}
                                                label="Twitter / X"
                                                value={generalSettings.twitter_url}
                                                onChange={(v: string) => setGeneralSettings({ ...generalSettings, twitter_url: v })}
                                                placeholder="https://x.com/..."
                                                color="text-blue-500"
                                            />
                                            <SocialInput
                                                icon={Linkedin}
                                                label="LinkedIn"
                                                value={generalSettings.linkedin_url}
                                                onChange={(v: string) => setGeneralSettings({ ...generalSettings, linkedin_url: v })}
                                                placeholder="https://linkedin.com/company/..."
                                                color="text-indigo-600"
                                            />
                                            <SocialInput
                                                icon={Instagram}
                                                label="Instagram"
                                                value={generalSettings.instagram_url}
                                                onChange={(v: string) => setGeneralSettings({ ...generalSettings, instagram_url: v })}
                                                placeholder="https://instagram.com/..."
                                                color="text-rose-500"
                                            />
                                            <SocialInput
                                                icon={Facebook}
                                                label="Facebook"
                                                value={generalSettings.facebook_url}
                                                onChange={(v: string) => setGeneralSettings({ ...generalSettings, facebook_url: v })}
                                                placeholder="https://facebook.com/..."
                                                color="text-blue-700"
                                            />
                                            <SocialInput
                                                icon={Youtube}
                                                label="YouTube"
                                                value={generalSettings.youtube_url}
                                                onChange={(v: string) => setGeneralSettings({ ...generalSettings, youtube_url: v })}
                                                placeholder="https://youtube.com/..."
                                                color="text-red-500"
                                            />
                                        </div>

                                        <div className="pt-6 border-t border-zinc-50 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                                                <Share2 size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-zinc-900 uppercase tracking-tight mb-0.5">Global Placement</p>
                                                <p className="text-[10px] text-zinc-400 font-medium">
                                                    Links will automatically manifest in the site footer and about pages.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {activeTab === "advanced" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="p-8 rounded-2xl border-zinc-100 shadow-sm bg-white space-y-6">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Monitor size={18} />
                                                </div>
                                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Operations</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-900">Maintenance Mode</p>
                                                        <p className="text-[10px] text-zinc-400 font-medium">Admins only access</p>
                                                    </div>
                                                    <div className="w-10 h-5 bg-zinc-200 rounded-full cursor-not-allowed relative">
                                                        <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-900">Edge Caching</p>
                                                        <p className="text-[10px] text-zinc-400 font-medium">System optimized</p>
                                                    </div>
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-8 rounded-2xl border-rose-100 shadow-sm bg-white space-y-6 border-t-4 border-t-rose-500">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                                                    <Lock size={18} />
                                                </div>
                                                <h3 className="text-sm font-bold text-rose-600 uppercase tracking-tight">Danger Zone</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <button className="w-full flex items-center justify-between h-12 px-5 rounded-xl border border-rose-200 text-rose-600 text-[11px] font-bold uppercase tracking-widest hover:bg-rose-50 transition-all">
                                                    Clear Memory Cache
                                                    <Trash2 size={14} />
                                                </button>
                                                <button className="w-full flex items-center justify-between h-12 px-5 rounded-xl border border-zinc-100 text-zinc-300 text-[11px] font-bold uppercase tracking-widest cursor-not-allowed">
                                                    Wipe Data
                                                    <Shield size={14} />
                                                </button>
                                            </div>
                                        </Card>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}

{/* Helper Components */ }

const AiField = ({ label, value, onChange, loading, onAi, textarea = false }: any) => (
    <div className="space-y-2 group/ai relative">
        <div className="flex items-center justify-between px-1">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</Label>
            <button
                onClick={onAi}
                disabled={loading || !value}
                className="opacity-0 group-hover/ai:opacity-100 transition-all text-[9px] font-bold uppercase text-violet-600 hover:text-violet-700 flex items-center gap-1.5 bg-violet-50 px-2 py-1 rounded-lg border border-violet-100"
            >
                {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                AI Refine
            </button>
        </div>
        {textarea ? (
            <Textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[100px] rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all text-xs font-medium p-3 resize-none shadow-none"
            />
        ) : (
            <Input
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all text-xs font-medium px-4 shadow-none"
            />
        )}
    </div>
);

const SocialInput = ({ icon: Icon, label, value, onChange, placeholder, color }: any) => (
    <div className="space-y-2.5 group">
        <div className="flex items-center gap-2 px-1">
            <div className={cn("p-1.5 rounded-lg bg-zinc-50 border border-zinc-100", color)}>
                <Icon size={13} />
            </div>
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</Label>
        </div>
        <div className="relative">
            <Input
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-10 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all text-xs font-medium px-4"
            />
            {value && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                </div>
            )}
        </div>
    </div>
);
