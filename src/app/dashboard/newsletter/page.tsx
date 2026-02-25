"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Mail,
    Calendar,
    Search,
    Download,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Layout,
    Type,
    Image as ImageIcon,
    Palette,
    Save,
    ExternalLink,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getNewsletterSubscribers, newsletterTemplatesApi, getTrendingStories, API_BASE_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewsletterPage() {
    // --- State for Subscribers ---
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefreshingSubscribers, setIsRefreshingSubscribers] = useState(false);

    // --- State for Templates ---
    const [templates, setTemplates] = useState<any[]>([]);
    const [activeTemplate, setActiveTemplate] = useState<any>(null);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [trendingStories, setTrendingStories] = useState<any[]>([]);

    const loadSubscribers = async (showLoading = true) => {
        if (showLoading) setIsLoadingSubscribers(true);
        else setIsRefreshingSubscribers(true);

        try {
            const data = await getNewsletterSubscribers();
            setSubscribers(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch subscribers");
        } finally {
            setIsLoadingSubscribers(false);
            setIsRefreshingSubscribers(false);
        }
    };

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const data = await newsletterTemplatesApi.list();
            setTemplates(data);
            const active = data.find((t: any) => t.is_active) || data[0];
            if (active) {
                // Fetch full detail for the active one
                const detail = await newsletterTemplatesApi.get(active.id);
                setActiveTemplate(detail);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch templates");
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    useEffect(() => {
        loadSubscribers();
        loadTemplates();
        loadTrendingStories();
    }, []);

    const loadTrendingStories = async () => {
        try {
            const data = await getTrendingStories();
            setTrendingStories(data.slice(0, 2)); // Show top 2 in preview
        } catch (error) {
            console.error("Failed to load trending stories", error);
        }
    };

    const handleSaveTemplate = async () => {
        if (!activeTemplate) return;
        setIsSavingTemplate(true);
        try {
            await newsletterTemplatesApi.update(activeTemplate.id, activeTemplate);
            toast.success("Newsletter settings updated successfully");
            loadTemplates();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save template");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ["Email", "Status", "Joined Date"];
        const rows = filteredSubscribers.map(s => [
            s.email,
            s.is_active ? "Active" : "Inactive",
            s.created_at
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-8 px-4 pt-6">
            <div className="max-w-[1400px] mx-auto space-y-4">
                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 px-5 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-100/50">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">Marketing</p>
                            <h1 className="text-lg font-bold tracking-tight text-zinc-900 leading-none">Newsletter Hub</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => { loadSubscribers(); loadTemplates(); }}
                            disabled={isRefreshingSubscribers || isLoadingTemplates}
                            className="h-9 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold text-[11px] transition-all active:scale-95"
                        >
                            <RefreshCw size={14} className={cn((isRefreshingSubscribers || isLoadingTemplates) && "animate-spin", "mr-2")} />
                            Sync Data
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="subscribers" className="space-y-4">
                    <TabsList className="bg-zinc-100/50 p-1 rounded-lg border border-zinc-200 w-full sm:w-auto h-auto grid grid-cols-2">
                        <TabsTrigger value="subscribers" className="rounded-md px-6 py-2 text-[11px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Subscribers
                        </TabsTrigger>
                        <TabsTrigger value="template" className="rounded-md px-6 py-2 text-[11px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Email Template
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="subscribers" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Filter bar */}
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                <Input
                                    placeholder="Search by email..."
                                    className="pl-9 h-10 bg-zinc-50 border-zinc-200 rounded-xl text-xs font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-zinc-50 px-4 py-1.5 rounded-xl border border-zinc-100 flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Active</p>
                                        <p className="text-sm font-bold text-emerald-600 line-height-none">{subscribers.filter(s => s.is_active).length}</p>
                                    </div>
                                    <div className="h-6 w-px bg-zinc-200" />
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Total</p>
                                        <p className="text-sm font-bold text-zinc-900 line-height-none">{subscribers.length}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={exportToCSV}
                                    className="h-10 px-4 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold text-[11px] gap-2"
                                >
                                    <Download size={14} /> Export
                                </Button>
                            </div>
                        </div>

                        <Card className="border border-zinc-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-zinc-800 text-[10px] font-black uppercase tracking-widest bg-zinc-50 border-b border-zinc-100">
                                            <th className="px-6 py-3">Subscriber</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                            <th className="px-6 py-3 text-center">Joined On</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        <AnimatePresence mode="popLayout">
                                            {filteredSubscribers.map((sub, idx) => (
                                                <motion.tr
                                                    key={sub.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-zinc-50/50 transition-colors group"
                                                >
                                                    <td className="px-6 py-2.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                                                                <Mail size={13} />
                                                            </div>
                                                            <span className="text-[13px] font-bold text-zinc-800">{sub.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-2.5 text-center">
                                                        <Badge className={cn(
                                                            "text-[9px] font-black py-0 h-5 px-2.5 rounded-full border shadow-sm uppercase tracking-tight",
                                                            sub.is_active
                                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                                                                : "bg-rose-50 text-rose-600 border-rose-100/50"
                                                        )}>
                                                            {sub.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-2.5 text-center">
                                                        <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-zinc-400">
                                                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-2.5 text-right">
                                                        <button className="h-8 w-8 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all inline-flex border border-transparent hover:border-rose-100">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                            {isLoadingSubscribers && (
                                <div className="py-20 flex flex-col items-center gap-4 bg-white">
                                    <div className="h-10 w-10 rounded-full border-4 border-zinc-50 border-t-purple-600 animate-spin" />
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Loading database...</p>
                                </div>
                            )}
                            {!isLoadingSubscribers && filteredSubscribers.length === 0 && (
                                <div className="py-20 text-center space-y-4 bg-white">
                                    <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto border border-zinc-100">
                                        <Search size={24} className="text-zinc-200" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-900">No subscribers found</h3>
                                        <p className="text-[11px] text-zinc-500">Try adjusting your search criteria</p>
                                    </div>
                                </div>
                            )}
                            {!isLoadingSubscribers && filteredSubscribers.length > 0 && (
                                <div className="px-4 py-2 border-t border-zinc-50 bg-zinc-50/10">
                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                        Total Subscribers: {subscribers.length}
                                    </span>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="template" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {isLoadingTemplates || !activeTemplate ? (
                            <div className="py-20 flex flex-col items-center gap-4 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
                                <div className="h-12 w-12 rounded-full border-4 border-zinc-100 border-t-purple-600 animate-spin" />
                                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Initializing Customizer...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* -- CONFIGURATOR -- */}
                                <div className="lg:col-span-4 space-y-4">
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold flex items-center gap-2">
                                                <Layout className="h-4 w-4 text-purple-600" />
                                                Visual Design
                                            </h3>
                                            <p className="text-[10px] text-zinc-400 font-medium">Customize the look and feel of your emails.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <Palette className="h-2.5 w-2.5" /> Accent Color
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="color"
                                                        value={activeTemplate.accent_color}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, accent_color: e.target.value })}
                                                        className="h-10 w-10 rounded-xl cursor-pointer border border-zinc-200 p-0 overflow-hidden shrink-0"
                                                    />
                                                    <Input
                                                        value={activeTemplate.accent_color}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, accent_color: e.target.value })}
                                                        className="h-10 text-[12px] font-bold font-mono px-3"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <ImageIcon className="h-2.5 w-2.5" /> Branding Logo
                                                </label>
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <Input
                                                            value={activeTemplate.logo_url || ""}
                                                            placeholder="https://..."
                                                            onChange={(e) => setActiveTemplate({ ...activeTemplate, logo_url: e.target.value })}
                                                            className="h-10 text-[12px] font-bold px-3 flex-1"
                                                        />
                                                        <Button
                                                            variant="secondary"
                                                            className="h-10 px-4 text-[11px] font-bold rounded-lg shrink-0"
                                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                                        >
                                                            Upload
                                                        </Button>
                                                        <input
                                                            id="logo-upload"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                toast.info("Uploading logo...");
                                                                try {
                                                                    const res = await fetch(`${API_BASE_URL}/media/upload/`, {
                                                                        method: 'POST',
                                                                        body: formData,
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.url) {
                                                                        setActiveTemplate({ ...activeTemplate, logo_url: data.url });
                                                                        toast.success("Logo uploaded!");
                                                                    }
                                                                } catch (err) {
                                                                    toast.error("Upload failed");
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    {activeTemplate.logo_url && (
                                                        <div className="h-10 px-3 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-lg">
                                                            <img src={activeTemplate.logo_url} alt="Logo" className="h-5 object-contain" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <Type className="h-2.5 w-2.5" /> Font Family
                                                </label>
                                                <select
                                                    value={activeTemplate.font_family}
                                                    onChange={(e) => setActiveTemplate({ ...activeTemplate, font_family: e.target.value })}
                                                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[12px] font-bold appearance-none transition-all hover:border-purple-300 focus:ring-2 focus:ring-purple-500/10 outline-none"
                                                >
                                                    <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">System Default</option>
                                                    <option value="'Inter', sans-serif">Inter</option>
                                                    <option value="'Roboto', sans-serif">Roboto</option>
                                                    <option value="'Montserrat', sans-serif">Montserrat</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="h-px bg-zinc-100" />

                                        <div className="space-y-4 pt-1 border-t border-zinc-100">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Subject Format</label>
                                                <Input
                                                    value={activeTemplate.subject_format}
                                                    onChange={(e) => setActiveTemplate({ ...activeTemplate, subject_format: e.target.value })}
                                                    className="h-10 text-[12px] font-bold bg-zinc-50 border-transparent"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Header Title</label>
                                                    <Input
                                                        value={activeTemplate.header_title}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, header_title: e.target.value })}
                                                        className="h-10 text-[12px] font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Subtitle</label>
                                                    <Input
                                                        value={activeTemplate.header_subtitle}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, header_subtitle: e.target.value })}
                                                        className="h-10 text-[12px] font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Section Title (Intro)</label>
                                                <Input
                                                    value={activeTemplate.body_intro}
                                                    onChange={(e) => setActiveTemplate({ ...activeTemplate, body_intro: e.target.value })}
                                                    className="h-10 text-[12px] font-bold"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Footer Text</label>
                                                <Textarea
                                                    value={activeTemplate.footer_text}
                                                    onChange={(e) => setActiveTemplate({ ...activeTemplate, footer_text: e.target.value })}
                                                    className="text-[12px] font-bold resize-none h-24 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSaveTemplate}
                                            disabled={isSavingTemplate}
                                            className="w-full h-11 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm gap-2 active:scale-95 transition-all mt-4"
                                        >
                                            {isSavingTemplate ? (
                                                <Clock className="animate-spin h-3 w-3" />
                                            ) : (
                                                <Save className="h-3 w-3" />
                                            )}
                                            Save Settings
                                        </Button>
                                    </div>
                                </div>

                                {/* -- LIVE PREVIEW -- */}
                                <div className="lg:col-span-8 sticky top-4">
                                    <div className="bg-zinc-100 p-1 rounded-[24px] shadow-sm border border-zinc-200">
                                        <div className="bg-white px-4 py-2 flex items-center justify-between rounded-t-[20px] border-b border-zinc-100">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-zinc-200" />
                                                <div className="h-2 w-2 rounded-full bg-zinc-200" />
                                                <div className="h-2 w-2 rounded-full bg-zinc-200" />
                                            </div>
                                            <div className="flex-1 max-w-[280px] mx-auto bg-zinc-50 py-1 rounded-lg text-center border border-zinc-100">
                                                <p className="text-[9px] font-mono text-zinc-400 truncate px-3">Subject: {activeTemplate.subject_format.replace('{first_story_title}', 'Startup News')}</p>
                                            </div>
                                            <div className="w-10 flex justify-end">
                                                <ExternalLink size={12} className="text-zinc-300" />
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 rounded-b-[20px] overflow-hidden min-h-[500px] flex flex-col p-4 sm:p-6" style={{ fontFamily: activeTemplate.font_family }}>
                                            {/* Preview Container (Simulating Mail Client) */}
                                            <div className="max-w-md mx-auto w-full bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">

                                                {/* Email Header */}
                                                <div className="p-6 text-center border-b border-zinc-50" style={{ borderTop: `4px solid ${activeTemplate.accent_color}` }}>
                                                    {activeTemplate.logo_url ? (
                                                        <img src={activeTemplate.logo_url} alt="Logo" className="h-7 mx-auto mb-4 object-contain" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center mx-auto mb-3 text-white font-black text-sm">S</div>
                                                    )}
                                                    <h1 className="text-lg font-black text-zinc-950 mb-1">{activeTemplate.header_title}</h1>
                                                    <p className="text-zinc-500 text-[11px]">{activeTemplate.header_subtitle}</p>
                                                </div>

                                                {/* Email Body */}
                                                <div className="p-6 space-y-6">
                                                    <div className="space-y-3">
                                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{activeTemplate.body_intro || "Weekly Roundup"}</h2>
                                                        <div className="space-y-3">
                                                            {trendingStories.length > 0 ? (
                                                                trendingStories.map((story) => (
                                                                    <div key={story.id} className="group rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 flex gap-3.5 transition-all hover:bg-white hover:shadow-md hover:border-zinc-200">
                                                                        <div className="h-16 w-16 rounded-lg bg-zinc-200 flex-shrink-0 overflow-hidden border border-zinc-100">
                                                                            {story.featured_image ? (
                                                                                <img src={story.featured_image} alt={story.title} className="h-full w-full object-cover" />
                                                                            ) : (
                                                                                <div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                                                                                    <ImageIcon size={20} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="space-y-1 flex-1 min-w-0">
                                                                            <div
                                                                                className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-1"
                                                                                style={{ backgroundColor: `${activeTemplate.accent_color}15`, color: activeTemplate.accent_color }}
                                                                            >
                                                                                {story.category?.name || "Startup Story"}
                                                                            </div>
                                                                            <h3 className="text-xs font-black text-zinc-900 leading-tight truncate">{story.title}</h3>
                                                                            <p className="text-[10px] font-medium text-zinc-500 line-clamp-2 leading-snug">{story.excerpt}</p>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {/* Skeleton placeholders if no actual stories yet */}
                                                                    <div className="group rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 flex gap-3">
                                                                        <div className="h-16 w-16 rounded-lg bg-zinc-200 flex-shrink-0 animate-pulse" />
                                                                        <div className="space-y-1.5 flex-1">
                                                                            <div className="h-2.5 w-16 rounded bg-purple-100 mb-1.5" />
                                                                            <div className="h-4 w-full rounded bg-zinc-200" />
                                                                            <div className="h-4 w-2/3 rounded bg-zinc-200" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 text-center">
                                                        <div
                                                            className="inline-block px-6 py-2.5 rounded-full text-white font-black text-[11px] shadow-lg"
                                                            style={{ backgroundColor: activeTemplate.accent_color }}
                                                        >
                                                            Discover More Stories
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Email Footer */}
                                                <div className="p-6 bg-zinc-50 text-center border-t border-zinc-100">
                                                    <p className="text-[10px] font-medium text-zinc-400 leading-relaxed whitespace-pre-wrap mb-3">
                                                        {activeTemplate.footer_text.replace('{year}', '2026')}
                                                    </p>
                                                    <div className="flex items-center justify-center gap-3">
                                                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Unsubscribe</span>
                                                        <div className="h-0.5 w-0.5 rounded-full bg-zinc-200" />
                                                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Privacy</span>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="mt-4 text-center">
                                                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Live Template Preview</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
}
