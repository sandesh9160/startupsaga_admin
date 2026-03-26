"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Mail,
    // Calendar,
    Search,
    Download,
    Trash2,
    // CheckCircle,
    // XCircle,
    Clock,
    Layout,
    Type,
    Image as ImageIcon,
    Palette,
    Save,
    ExternalLink,
    RefreshCw,
    Ban,
    Shield,
    // ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    getNewsletterSubscribers,
    newsletterTemplatesApi,
    getTrendingStories,
    deleteNewsletterSubscriber,
    toggleBlockSubscriber,
    sendTestAdminAlert,
    uploadMediaItem
} from "@/lib/api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";

export default function NewsletterPage() {
    // --- State for Subscribers ---
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [subscriberToDelete, setSubscriberToDelete] = useState<{ id: number, email: string } | null>(null);
    const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefreshingSubscribers, setIsRefreshingSubscribers] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [previewMode, setPreviewMode] = useState<"weekly" | "admin">("weekly");

    // --- State for Templates ---
    const [templates, setTemplates] = useState<any[]>([]);
    const [activeTemplate, setActiveTemplate] = useState<any>(null);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [isDeletingTemplateId, setIsDeletingTemplateId] = useState<number | null>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [trendingStories, setTrendingStories] = useState<any[]>([]);

    const createTemplateDraft = () => ({
        name: "Default Newsletter",
        subject_format: "StartupSaga Weekly: {first_story_title}",
        header_title: "StartupSaga",
        header_subtitle: "Weekly stories, founder insights, and ecosystem updates",
        body_intro: "Top Stories This Week",
        body_text: "<p>Welcome to our weekly community roundup! We've gathered the most impactful stories and insights to keep you ahead in the startup ecosystem.</p>",
        admin_body_intro: "Fresh Lead",
        admin_body_text: "<p>A user has just subscribed to the newsletter:</p>",
        footer_text: "© {year} StartupSaga. All rights reserved.\nYou received this email because you subscribed to our newsletter.",
        accent_color: "#9333ea",
        is_active: true,
        font_family: "'Inter', sans-serif",
        logo_url: "",
    });

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
                const detail = await newsletterTemplatesApi.get(active.id);
                setActiveTemplate(detail);
            } else {
                // Initialize a default local template if none exists
                setActiveTemplate({
                    name: "Default Newsletter",
                    subject_format: "StartupSaga Weekly: {first_story_title}",
                    header_title: "StartupSaga",
                    header_subtitle: "Weekly stories, founder insights, and ecosystem updates",
                    body_intro: "Top Stories This Week",
                    body_text: "Welcome to our weekly community roundup! We've gathered the most impactful stories and insights to keep you ahead in the startup ecosystem.",
                    footer_text: "© {year} StartupSaga. All rights reserved.\nYou received this email because you subscribed to our newsletter.",
                    accent_color: "#9333ea",
                    is_active: true,
                    font_family: "'Inter', sans-serif"
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch templates");
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSendTestAlert = async () => {
        setIsSendingTest(true);
        try {
            await sendTestAdminAlert();
            toast.success("Test admin alert sent! Please check your inbox.");
        } catch (err) {
            toast.error("Failed to send test email. Check server configuration.");
        } finally {
            setIsSendingTest(false);
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
            if (activeTemplate.id) {
                await newsletterTemplatesApi.update(activeTemplate.id, activeTemplate);
            } else {
                await newsletterTemplatesApi.create(activeTemplate);
            }
            toast.success("Newsletter settings updated successfully");
            loadTemplates();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message?.includes("API Error")
                ? err.message.split(" - ")[1]?.slice(0, 100)
                : "Check your network connection";
            toast.error(`Save Failed: ${errorMessage || "Internal Server Error"}`);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleToggleBlock = async (id: number, email: string) => {
        try {
            await toggleBlockSubscriber(id);
            toast.success(`Updated block status for ${email}`);
            loadSubscribers(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update block status");
        }
    };

    const handleDeleteSubscriber = (id: number, email: string) => {
        setSubscriberToDelete({ id, email });
    };

    const confirmDeleteSubscriber = async (id: number, email: string) => {
        try {
            await deleteNewsletterSubscriber(id);
            toast.success(`Deleted ${email}`);
            loadSubscribers(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete subscriber");
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
                                                        {sub.is_blocked ? (
                                                            <Badge className="text-[9px] font-black py-0 h-5 px-2.5 rounded-full border shadow-sm uppercase tracking-tight bg-zinc-900 text-white border-zinc-900">
                                                                Blocked
                                                            </Badge>
                                                        ) : (
                                                            <Badge className={cn(
                                                                "text-[9px] font-black py-0 h-5 px-2.5 rounded-full border shadow-sm uppercase tracking-tight",
                                                                sub.is_active
                                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                                                                    : "bg-rose-50 text-rose-600 border-rose-100/50"
                                                            )}>
                                                                {sub.is_active ? "Active" : "Inactive"}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-2.5 text-center">
                                                        <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-zinc-400">
                                                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-2.5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleToggleBlock(sub.id, sub.email)}
                                                                title={sub.is_blocked ? "Unblock User" : "Block User"}
                                                                className={cn(
                                                                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all border",
                                                                    sub.is_blocked
                                                                        ? "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                                                                        : "text-zinc-400 hover:text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-100"
                                                                )}
                                                            >
                                                                {sub.is_blocked ? <Shield size={14} /> : <Ban size={14} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                                                className="h-8 w-8 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all border border-transparent hover:border-rose-100"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
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
                                <div className="lg:col-span-5 space-y-4">
                                    {/* Template Selector */}
                                    <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                            Select Template
                                        </label>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {templates.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={async () => {
                                                        setIsLoadingTemplates(true);
                                                        try {
                                                            const detail = await newsletterTemplatesApi.get(t.id);
                                                            setActiveTemplate(detail);
                                                        } finally {
                                                            setIsLoadingTemplates(false);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-between p-2.5 rounded-lg border text-left transition-all",
                                                        activeTemplate?.id === t.id
                                                            ? "bg-purple-50 border-purple-200 ring-1 ring-purple-100"
                                                            : "bg-white border-zinc-100 hover:border-zinc-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-2 w-2 rounded-full",
                                                            activeTemplate?.id === t.id ? "bg-purple-600" : "bg-zinc-200"
                                                        )} />
                                                        <span className={cn(
                                                            "text-[11px] font-bold",
                                                            activeTemplate?.id === t.id ? "text-purple-900" : "text-zinc-600"
                                                        )}>{t.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {t.is_active && (
                                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] h-4 px-1.5 font-black uppercase">
                                                                Active
                                                            </Badge>
                                                        )}
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (t.is_active) {
                                                                    toast.error("Cannot delete active template");
                                                                    return;
                                                                }
                                                                if (confirm("Delete this template?")) {
                                                                    try {
                                                                        await fetch(`${API_BASE_URL}/newsletter/templates/${t.id}/delete/`, { method: "DELETE" });
                                                                        toast.success("Template deleted");
                                                                        loadTemplates();
                                                                    } catch (err) {
                                                                        toast.error("Delete failed");
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1 rounded hover:bg-rose-50 text-zinc-300 hover:text-rose-500 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </button>
                                            ))}
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setActiveTemplate({
                                                        name: "New Template",
                                                        subject_format: "StartupSaga: {first_story_title}",
                                                        header_title: "StartupSaga",
                                                        header_subtitle: "Subtitle here",
                                                        body_intro: "Section Title",
                                                        body_text: "<p>Start writing...</p>",
                                                        footer_text: "© {year} StartupSaga. All rights reserved.",
                                                        accent_color: "#000000",
                                                        is_active: false,
                                                        font_family: "'Inter', sans-serif"
                                                    });
                                                }}
                                                className="h-8 border-dashed border-zinc-200 text-[10px] font-bold text-zinc-400 hover:text-zinc-600"
                                            >
                                                + Create New Template
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-zinc-50 text-zinc-900 border border-zinc-200">
                                                        <Palette className="h-4 w-4" />
                                                    </div>
                                                    <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900">
                                                        Design Customizer
                                                    </h3>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleSendTestAlert}
                                                    disabled={isSendingTest}
                                                    className="h-8 text-[10px] font-black uppercase tracking-widest border-purple-100 hover:bg-purple-50 text-purple-600 gap-2"
                                                >
                                                    {isSendingTest ? <Clock className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                                                    Test Admin Alert
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-medium">
                                                Modifying <strong>{activeTemplate.name}</strong>. Changes will apply globally when marked as active.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    Template Name
                                                </label>
                                                <Input
                                                    value={activeTemplate.name}
                                                    onChange={(e) => setActiveTemplate({ ...activeTemplate, name: e.target.value })}
                                                    className="h-8 text-[11px] font-bold"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                                                <div>
                                                    <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">Active Status</p>
                                                    <p className="text-[9px] text-zinc-500 font-medium">Use this template for all new mailings</p>
                                                </div>
                                                <button
                                                    onClick={() => setActiveTemplate({ ...activeTemplate, is_active: !activeTemplate.is_active })}
                                                    className={cn(
                                                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                        activeTemplate.is_active ? "bg-purple-600" : "bg-zinc-200"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                            activeTemplate.is_active ? "translate-x-4" : "translate-x-0"
                                                        )}
                                                    />
                                                </button>
                                            </div>

                                            <div className="h-px bg-zinc-100 my-2" />

                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                    <Palette className="h-2.5 w-2.5" /> Accent Color
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="color"
                                                        value={activeTemplate.accent_color}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, accent_color: e.target.value })}
                                                        className="h-8 w-8 rounded-lg cursor-pointer border border-zinc-200 p-0 overflow-hidden shrink-0"
                                                    />
                                                    <Input
                                                        value={activeTemplate.accent_color}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, accent_color: e.target.value })}
                                                        className="h-8 text-[11px] font-bold font-mono px-2"
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
                                                            className="h-8 text-[11px] font-bold px-2 flex-1"
                                                        />
                                                        <Button
                                                            variant="secondary"
                                                            className="h-8 px-3 text-[10px] font-bold rounded-lg shrink-0"
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
                                                    className="w-full h-8 px-2 bg-white border border-zinc-200 rounded-lg text-[11px] font-bold appearance-none transition-all hover:border-purple-300 focus:ring-2 focus:ring-purple-500/10 outline-none"
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
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                    {previewMode === "weekly" ? "Weekly Subject Format" : "Alert Subject Format"}
                                                </label>
                                                <Input
                                                    value={activeTemplate.subject_format}
                                                    onChange={(e) => setActiveTemplate({ ...activeTemplate, subject_format: e.target.value })}
                                                    className="h-9 text-[11px] font-bold bg-zinc-50 border-transparent"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-50">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Header Title</label>
                                                    <Input
                                                        value={activeTemplate.header_title}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, header_title: e.target.value })}
                                                        className="h-8 text-[11px] font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Subtitle</label>
                                                    <Input
                                                        value={activeTemplate.header_subtitle}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, header_subtitle: e.target.value })}
                                                        className="h-8 text-[11px] font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-1">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                        {previewMode === "weekly" ? "Section Title (Intro)" : "Alert Badge Text"}
                                                    </label>
                                                    <Input
                                                        value={previewMode === "weekly" ? activeTemplate.body_intro : (activeTemplate.admin_body_intro || "")}
                                                        onChange={(e) => {
                                                            if (previewMode === "weekly") {
                                                                setActiveTemplate({ ...activeTemplate, body_intro: e.target.value })
                                                            } else {
                                                                setActiveTemplate({ ...activeTemplate, admin_body_intro: e.target.value })
                                                            }
                                                        }}
                                                        className="h-8 text-[11px] font-bold"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                        {previewMode === "weekly" ? "Newsletter Body Message" : "Alert Notification Body"}
                                                    </label>
                                                    <div className="min-h-[300px] max-h-[500px] border rounded-xl overflow-hidden border-zinc-200">
                                                        <RichTextEditor
                                                            content={previewMode === "weekly" ? (activeTemplate.body_text || "") : (activeTemplate.admin_body_text || "")}
                                                            onChange={(html) => {
                                                                if (previewMode === "weekly") {
                                                                    setActiveTemplate({ ...activeTemplate, body_text: html })
                                                                } else {
                                                                    setActiveTemplate({ ...activeTemplate, admin_body_text: html })
                                                                }
                                                            }}
                                                            placeholder={previewMode === "weekly" ? "Enter main newsletter content..." : "Enter admin notification message..."}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Footer Text</label>
                                                    <Textarea
                                                        value={activeTemplate.footer_text}
                                                        onChange={(e) => setActiveTemplate({ ...activeTemplate, footer_text: e.target.value })}
                                                        className="text-[11px] font-medium resize-none h-24 rounded-lg border-zinc-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSaveTemplate}
                                            disabled={isSavingTemplate}
                                            className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-[13px] gap-2 active:scale-95 transition-all mt-2"
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
                                <div className="lg:col-span-7 sticky top-4">
                                    <div className="bg-zinc-100 p-1 rounded-[24px] shadow-sm border border-zinc-200">
                                        <div className="bg-white px-4 py-2 flex items-center justify-between rounded-t-[20px] border-b border-zinc-100">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <div
                                                    onClick={() => setPreviewMode("weekly")}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2",
                                                        previewMode === "weekly" ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/20" : "bg-transparent text-zinc-400 hover:text-zinc-600"
                                                    )}
                                                >
                                                    <Mail size={12} />
                                                    Weekly
                                                </div>
                                                <div
                                                    onClick={() => setPreviewMode("admin")}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2",
                                                        previewMode === "admin" ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/20" : "bg-transparent text-zinc-400 hover:text-zinc-600"
                                                    )}
                                                >
                                                    <Shield size={12} />
                                                    Admin
                                                </div>
                                            </div>
                                            <div className="flex-1 max-w-[280px] mx-auto bg-zinc-50 py-1 rounded-lg text-center border border-zinc-100">
                                                <p className="text-[9px] font-mono text-zinc-400 truncate px-3">
                                                    {previewMode === "weekly"
                                                        ? `Subject: ${activeTemplate.subject_format.replace('{first_story_title}', 'Startup News')}`
                                                        : "Subject: StartupSaga: New Subscriber Alert"
                                                    }
                                                </p>
                                            </div>
                                            <div className="w-10 flex justify-end">
                                                <ExternalLink size={12} className="text-zinc-300" />
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 rounded-b-[20px] overflow-hidden min-h-[500px] flex flex-col p-4 sm:p-6" style={{ fontFamily: activeTemplate.font_family }}>
                                            {/* Preview Container (Simulating Mail Client) */}
                                            <div className="max-w-xl mx-auto w-full bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">

                                                {previewMode === "weekly" ? (
                                                    <>
                                                        {/* Email Header */}
                                                        <div className="p-6 text-center border-b border-zinc-50" style={{ borderTop: `4px solid ${activeTemplate.accent_color}` }}>
                                                            {activeTemplate.logo_url ? (
                                                                <img src={activeTemplate.logo_url} alt="Logo" className="h-7 mx-auto mb-4 object-contain" />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center mx-auto mb-3 text-white font-black text-sm">S</div>
                                                            )}

                                                            {!activeTemplate.logo_url && (
                                                                <h1 className="text-lg font-black text-zinc-950 mb-1 leading-none tracking-tight">{activeTemplate.header_title}</h1>
                                                            )}
                                                            <p className="text-zinc-500 text-[11px] font-medium max-w-[200px] mx-auto leading-tight">{activeTemplate.header_subtitle}</p>
                                                        </div>

                                                        {/* Email Body */}
                                                        <div className="p-6 space-y-6">
                                                            <div className="space-y-4">
                                                                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{activeTemplate.body_intro || "Weekly Roundup"}</h2>

                                                                {activeTemplate.body_text && (
                                                                    <div
                                                                        className="prose prose-sm prose-zinc max-w-none newsletter-content text-zinc-600"
                                                                        dangerouslySetInnerHTML={{ __html: activeTemplate.body_text }}
                                                                    />
                                                                )}

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
                                                        <div className="p-8 bg-zinc-50 text-center border-t border-zinc-100 flex flex-col items-center gap-4">
                                                            <div className="flex items-center gap-2 opacity-30 grayscale mb-2">
                                                                {activeTemplate.logo_url ? (
                                                                    <img src={activeTemplate.logo_url} alt="Logo" className="h-4 object-contain" />
                                                                ) : (
                                                                    <div className="h-5 w-5 rounded bg-zinc-950 flex items-center justify-center text-white font-black text-[8px]">S</div>
                                                                )}
                                                                <span className="text-[10px] font-black tracking-tighter text-zinc-900">{activeTemplate.header_title}</span>
                                                            </div>
                                                            <p className="text-[10px] font-medium text-zinc-400 leading-relaxed whitespace-pre-wrap max-w-[280px]">
                                                                {activeTemplate.footer_text.replace('{year}', '2026')}
                                                            </p>
                                                            <div className="h-px w-12 bg-zinc-200 my-1" />
                                                            <div className="flex items-center justify-center gap-4">
                                                                <button className="text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-zinc-500 transition-colors">Unsubscribe</button>
                                                                <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                                                <button className="text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-zinc-500 transition-colors">Preferences</button>
                                                                <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                                                <button className="text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-zinc-500 transition-colors">Privacy</button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* Admin Alert Header */}
                                                        <div className="p-10 text-center border-b border-zinc-50" style={{ borderTop: `6px solid ${activeTemplate.accent_color}` }}>
                                                            {activeTemplate.logo_url ? (
                                                                <img src={activeTemplate.logo_url} alt="Logo" className="h-6 mx-auto mb-6 object-contain" />
                                                            ) : (
                                                                <div className="text-xl font-black text-zinc-950 mb-4 tracking-tighter text-center">StartupSaga</div>
                                                            )}
                                                            <h1 className="text-lg font-black text-zinc-950 tracking-tight">Admin Alert: New Subscriber</h1>
                                                        </div>

                                                        {/* Admin Alert Body */}
                                                        <div className="p-10 text-center space-y-6">
                                                            <div
                                                                className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                                                                style={{ backgroundColor: `${activeTemplate.accent_color}15`, color: activeTemplate.accent_color }}
                                                            >
                                                                {activeTemplate.admin_body_intro || "Fresh Lead"}
                                                            </div>
                                                            <div
                                                                className="text-xs font-medium text-zinc-400 prose prose-sm max-w-none text-center"
                                                                dangerouslySetInnerHTML={{ __html: activeTemplate.admin_body_text || "<p>A user has just subscribed to the newsletter:</p>" }}
                                                            />
                                                            <div className="text-lg font-black text-zinc-900 border-y border-zinc-50 py-4 my-2">
                                                                new-subscriber@example.com
                                                            </div>
                                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                                {new Date().toLocaleString()}
                                                            </div>

                                                            <div className="pt-4">
                                                                <div className="inline-block px-8 py-3 rounded-xl bg-zinc-950 text-white font-black text-[11px] shadow-xl active:scale-95 transition-all cursor-pointer">
                                                                    View in Dashboard
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Admin Alert Footer */}
                                                        <div className="p-8 bg-zinc-50 text-center border-t border-zinc-100 flex flex-col items-center">
                                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed text-center">
                                                                © {new Date().getFullYear()} StartupSaga Administrative System<br />
                                                                <span className="opacity-50">Confidential Notification • Internal Use Only</span>
                                                            </p>
                                                        </div>
                                                    </>
                                                )}

                                            </div>
                                            <div className="mt-4 text-center">
                                                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                                                    {previewMode === "weekly" ? "Live Newsletter Preview" : "Live Admin Alert Preview"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

            </div>

            <AlertDialog open={!!subscriberToDelete} onOpenChange={(open) => !open && setSubscriberToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-zinc-100 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-zinc-900 font-serif">
                            Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500 text-sm">
                            Are you sure you want to delete <span className="font-bold text-zinc-900">{subscriberToDelete?.email}</span>?
                            This action is permanent and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all font-bold text-xs uppercase tracking-widest">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => subscriberToDelete && confirmDeleteSubscriber(subscriberToDelete.id, subscriberToDelete.email)}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all font-bold text-xs uppercase tracking-widest px-6"
                        >
                            Delete Subscriber
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
