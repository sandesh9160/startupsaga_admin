"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    PanelBottom,
    Plus,
    Trash2,
    Save,
    Loader2,
    Eye,
    Layers,
    Edit2,
    X,
    GripVertical,
    ChevronRight,
    Twitter,
    Linkedin,
    Instagram,
    Mail,
    Globe,
    Image as ImageIcon,
    Link as LinkIcon,
    Monitor,
    Github,
    Facebook,
    Youtube,
    Slack,
    MessageCircle,
    Send,
    Phone,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
    twitter: <Twitter className="h-4 w-4" />,
    linkedin: <Linkedin className="h-4 w-4" />,
    instagram: <Instagram className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    website: <Globe className="h-4 w-4" />,
    youtube: <Youtube className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />,
    github: <Github className="h-4 w-4" />,
    slack: <Slack className="h-4 w-4" />,
    discord: <MessageCircle className="h-4 w-4" />,
    telegram: <Send className="h-4 w-4" />,
    whatsapp: <Phone className="h-4 w-4" />,
};

export interface FooterItem {
    id: number;
    label: string;
    url: string;
    position: string;
    order: number;
    parent: number | string | null;
    is_active?: boolean;
}

export default function DashboardFooterPage() {
    const [activeTab, setActiveTab] = useState<"structure" | "preview">("preview");

    const [footerItems, setFooterItems] = useState<FooterItem[]>([]);
    const [isLoadingNav, setIsLoadingNav] = useState(true);

    const [tagline, setTagline] = useState("Discovering and celebrating the incredible startup journeys across India.");
    const [copyright, setCopyright] = useState("© 2026 StartupSaga.in. All rights reserved.");
    const [siteName, setSiteName] = useState("StartupSaga.in");
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [shouldRemoveLogo, setShouldRemoveLogo] = useState(false);
    const [bgColor, setBgColor] = useState("#09090b");
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [socials, setSocials] = useState([
        { platform: "twitter", url: "https://twitter.com/startupsaga" },
        { platform: "linkedin", url: "https://linkedin.com/company/startupsaga" },
        { platform: "instagram", url: "https://instagram.com/startupsaga" },
        { platform: "email", url: "mailto:hello@startupsaga.in" },
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({ label: "", url: "", parent: "", position: "footer" });
    const [isSavingItem, setIsSavingItem] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNavItems();
        loadSiteSettings();
    }, []);

    const loadNavItems = async () => {
        setIsLoadingNav(true);
        try {
            const res = await fetch(`${API}/navigation/?position=footer,footer_company,footer_links`);
            if (res.ok) setFooterItems(await res.json());
        } catch (e) {
            console.error("Failed to load footer nav", e);
        } finally {
            setIsLoadingNav(false);
        }
    };

    const loadSiteSettings = async () => {
        try {
            const res = await fetch(`${API}/layout-settings/`);
            if (res.ok) {
                const data = await res.json();
                setSiteName(data.site_name || "StartupSaga.in");
                if (data.site_logo) setLogoPreview(data.site_logo);
                if (data.footer_tagline) setTagline(data.footer_tagline);
                if (data.footer_copyright) setCopyright(data.footer_copyright);
                if (data.footer_bg_color) setBgColor(data.footer_bg_color);
                if (data.socials) setSocials(data.socials);
            }
        } catch (e) {
            console.error("Failed to load site settings", e);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        setShouldRemoveLogo(false);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            const formData = new FormData();
            formData.append("site_name", siteName);
            formData.append("footer_tagline", tagline);
            formData.append("footer_copyright", copyright);
            formData.append("footer_bg_color", bgColor);
            formData.append("socials", JSON.stringify(socials));
            if (logoFile) formData.append("site_logo", logoFile);
            else if (shouldRemoveLogo) formData.append("remove_logo", "true");

            const res = await fetch(`${API}/layout-settings/update/`, { method: "POST", body: formData });
            if (res.ok) {
                toast.success("Footer settings saved!");
                loadSiteSettings();
                setLogoFile(null);
            } else throw new Error();
        } catch {
            toast.error("Failed to save footer settings");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm("Delete this footer link?")) return;
        try {
            const res = await fetch(`${API}/navigation/${id}/`, { method: "DELETE" });
            if (res.ok) {
                setFooterItems((prev) => prev.filter((i) => i.id !== id));
                toast.success("Link removed");
            }
        } catch {
            toast.error("Failed to delete link");
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.label || !newItem.url) { toast.error("Label and URL are required"); return; }
        setIsSavingItem(true);
        try {
            const res = await fetch(`${API}/navigation/create/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: newItem.label,
                    url: newItem.url,
                    position: newItem.position,
                    is_active: true,
                    parent: newItem.parent ? parseInt(newItem.parent) : null,
                }),
            });
            if (res.ok) {
                toast.success("Footer link added!");
                setNewItem({ label: "", url: "", parent: "", position: "footer" });
                setShowAddForm(false);
                loadNavItems();
            } else throw new Error();
        } catch {
            toast.error("Failed to add link");
        } finally {
            setIsSavingItem(false);
        }
    };

    const topLevelItems = footerItems.filter((i) => !i.parent).sort((a, b) => (a.order || 0) - (b.order || 0));
    const getChildren = (parentId: number) =>
        footerItems.filter((i) => i.parent === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));

    const renderStructureItems = (parentId: number | null = null, depth = 0) => {
        const filtered = footerItems.filter((i) => (parentId === null ? !i.parent : i.parent === parentId));
        if (filtered.length === 0) return null;
        return (
            <div className={cn("divide-y divide-zinc-100", depth > 0 && "pl-8 bg-purple-50/20 border-l-2 border-purple-100")}>
                {filtered.map((item) => (
                    <div key={item.id}>
                        <div className="group flex items-center justify-between p-3 px-5 hover:bg-zinc-50 transition-all">
                            <div className="flex items-center gap-4">
                                <GripVertical className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        {depth > 0 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
                                        <span className="font-bold text-sm text-zinc-800">{item.label}</span>
                                        {!item.is_active && (
                                            <span className="text-[9px] font-black uppercase bg-zinc-100 text-zinc-400 px-1.5 py-0.5 rounded-md">
                                                Inactive
                                            </span>
                                        )}
                                        <span className="text-[9px] font-black uppercase bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded-md border border-purple-100">
                                            {item.position.replace('_', ' ')}
                                        </span>
                                        {footerItems.some((c) => c.parent === item.id) && (
                                            <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-md border border-blue-100">
                                                Column
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                                        <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/70">#{item.order}</span>
                                        <span className="truncate max-w-[240px]">{item.url || "(Column header — no link)"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/dashboard/menus/${item.position}/${item.id}/edit`}
                                    className="h-8 w-8 rounded-xl border border-zinc-200 bg-white hover:border-purple-300 hover:text-purple-600 text-zinc-400 flex items-center justify-center shadow-sm transition-all"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Link>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="h-8 w-8 rounded-xl border border-zinc-200 bg-white hover:border-rose-200 hover:bg-rose-50 text-zinc-400 hover:text-rose-500 flex items-center justify-center shadow-sm transition-all"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        {renderStructureItems(item.id, depth + 1)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <PanelBottom className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Site</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Footer Editor</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="h-9 w-9 rounded-xl border border-zinc-200 hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm transition-all flex items-center justify-center"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </Link>

                        {/* Tab switcher */}
                        <div className="flex items-center gap-0.5 bg-zinc-100 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab("structure")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    activeTab === "structure" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <Layers className="h-3.5 w-3.5" /> Links
                            </button>
                            <button
                                onClick={() => setActiveTab("preview")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    activeTab === "preview" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <Eye className="h-3.5 w-3.5" /> Preview & Settings
                            </button>
                        </div>

                        {activeTab === "structure" && !showAddForm && (
                            <button
                                onClick={() => { setShowAddForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
                                className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Link
                            </button>
                        )}
                    </div>
                </div>

                {/* ── PREVIEW & SETTINGS TAB ── */}
                {activeTab === "preview" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* Live footer preview */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Monitor className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Footer Preview — Live</span>
                                <span className="ml-auto text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">LIVE</span>
                            </div>
                            <div className="text-white px-8 py-10 transition-colors duration-300" style={{ backgroundColor: bgColor }}>
                                <div className="max-w-7xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                                        {/* Brand column */}
                                        <div className="md:col-span-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                {logoPreview ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={logoPreview} alt={siteName} className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1" />
                                                    </>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                        <span className="font-serif text-lg font-black text-white">{siteName.charAt(0)}</span>
                                                    </div>
                                                )}
                                                <span className="font-serif text-lg font-bold text-white">{siteName}</span>
                                            </div>
                                            <p className="text-zinc-400 text-xs leading-relaxed mb-4">{tagline}</p>
                                            <div className="flex items-center gap-3">
                                                {socials.map((s) => (
                                                    <div key={s.platform} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                                                        {SOCIAL_ICONS[s.platform] || <Globe className="h-4 w-4" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer columns */}
                                        {topLevelItems.map((col) => {
                                            const children = getChildren(col.id);
                                            return (
                                                <div key={col.id}>
                                                    <h4 className="font-semibold text-xs uppercase tracking-wider mb-3 text-zinc-300">{col.label}</h4>
                                                    <ul className="space-y-2">
                                                        {children.length > 0 ? children.map((child) => (
                                                            <li key={child.id}>
                                                                <span className="text-zinc-400 text-xs hover:text-white transition-colors cursor-pointer">{child.label}</span>
                                                            </li>
                                                        )) : (
                                                            <li><span className="text-zinc-600 text-xs italic">No links yet</span></li>
                                                        )}
                                                    </ul>
                                                </div>
                                            );
                                        })}

                                        {topLevelItems.length === 0 && (
                                            <>
                                                {["Platform", "Company", "Legal"].map((col) => (
                                                    <div key={col}>
                                                        <h4 className="font-semibold text-xs uppercase tracking-wider mb-3 text-zinc-600">{col}</h4>
                                                        <p className="text-zinc-700 text-xs italic">No links added</p>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                    <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
                                        <p className="text-zinc-500 text-xs">{copyright}</p>
                                        <p className="text-zinc-500 text-xs">Made with ❤️ for Indian Startups</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-2.5 bg-zinc-50 text-center text-[10px] text-zinc-400 font-medium">
                                ↑ Live preview — save settings below to apply changes
                            </div>
                        </div>

                        {/* Settings grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {/* Brand & Text */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <ImageIcon className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Brand & Text</span>
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* Logo */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Logo</Label>
                                        <div className="flex gap-2">
                                            <div
                                                className="flex-1 border-2 border-dashed border-zinc-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
                                                onClick={() => logoInputRef.current?.click()}
                                            >
                                                {logoPreview ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={logoPreview} alt={siteName} className="h-9 w-auto object-contain rounded-lg" />
                                                    </>
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                                                        <ImageIcon className="h-4 w-4 text-zinc-300" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-bold text-zinc-700">{logoPreview ? "Custom Logo Active" : "Default Logo"}</p>
                                                    <p className="text-[10px] text-zinc-400 group-hover:text-purple-500 transition-colors">
                                                        Click to {logoPreview ? "change" : "upload"} logo
                                                    </p>
                                                </div>
                                            </div>
                                            {!!logoPreview && (
                                                <button
                                                    onClick={() => { setLogoPreview(null); setLogoFile(null); setShouldRemoveLogo(true); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                                                    className="h-auto min-h-[60px] w-11 rounded-xl border-2 border-dashed border-zinc-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 text-zinc-400 flex items-center justify-center transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                    </div>

                                    {/* Site name */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Site Name</Label>
                                        <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all" />
                                    </div>

                                    {/* Tagline */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Tagline</Label>
                                        <textarea
                                            value={tagline}
                                            onChange={(e) => setTagline(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white px-3 py-2.5 text-sm outline-none resize-none transition-all"
                                        />
                                    </div>

                                    {/* Copyright */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Copyright Text</Label>
                                        <Input value={copyright} onChange={(e) => setCopyright(e.target.value)} className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all" />
                                    </div>

                                    {/* Background Color */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Background Color</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-xl border border-zinc-200 shadow-sm flex-shrink-0" style={{ backgroundColor: bgColor }} />
                                            <Input
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs font-mono transition-all"
                                                placeholder="#09090b"
                                            />
                                            <input
                                                type="color"
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="w-10 h-10 p-0.5 border border-zinc-200 rounded-xl cursor-pointer bg-transparent flex-shrink-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                            <Globe className="h-3 w-3 text-white" />
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Social Links</span>
                                    </div>
                                    <button
                                        onClick={() => setSocials([...socials, { platform: "website", url: "" }])}
                                        className="h-7 px-3 rounded-lg text-[10px] font-bold text-zinc-500 border border-zinc-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" /> Add
                                    </button>
                                </div>
                                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-[300px]">
                                    {socials.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 flex-shrink-0">
                                                {SOCIAL_ICONS[s.platform] || <Globe className="h-4 w-4" />}
                                            </div>
                                            <select
                                                value={s.platform}
                                                onChange={(e) => {
                                                    const updated = [...socials];
                                                    updated[i] = { ...updated[i], platform: e.target.value };
                                                    setSocials(updated);
                                                }}
                                                className="h-9 w-28 rounded-xl border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold outline-none shrink-0"
                                            >
                                                {Object.keys(SOCIAL_ICONS).map((k) => (
                                                    <option key={k} value={k}>{k}</option>
                                                ))}
                                            </select>
                                            <Input
                                                value={s.url}
                                                onChange={(e) => {
                                                    const updated = [...socials];
                                                    updated[i] = { ...updated[i], url: e.target.value };
                                                    setSocials(updated);
                                                }}
                                                placeholder="https://..."
                                                className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs flex-1 transition-all"
                                            />
                                            <button
                                                onClick={() => setSocials(socials.filter((_, idx) => idx !== i))}
                                                className="h-9 w-9 rounded-xl border border-zinc-200 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center transition-all flex-shrink-0"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {socials.length === 0 && (
                                        <p className="text-xs text-zinc-300 italic text-center py-6">No social links yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Quick Access */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-orange-600 flex items-center justify-center">
                                        <LinkIcon className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Footer Navigation Links</span>
                                </div>
                                <button
                                    onClick={() => setActiveTab("structure")}
                                    className="h-7 px-3 rounded-lg text-[10px] font-bold text-zinc-500 border border-zinc-200 hover:bg-zinc-50 transition-all"
                                >
                                    Manage Links
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="flex flex-wrap gap-2">
                                    {topLevelItems.map((item) => (
                                        <Badge
                                            key={item.id}
                                            variant="secondary"
                                            className="px-3 py-1 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-lg text-[10px] font-bold uppercase"
                                        >
                                            {item.label}
                                        </Badge>
                                    ))}
                                    {topLevelItems.length === 0 && (
                                        <p className="text-xs text-zinc-400 italic">No columns defined yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSaveSettings}
                            disabled={isSavingSettings}
                            className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {isSavingSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {isSavingSettings ? "Saving..." : "Save Footer Settings"}
                        </button>
                    </div>
                )}

                {/* ── LINKS / STRUCTURE TAB ── */}
                {activeTab === "structure" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <LinkIcon className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Footer Links & Columns</span>
                                </div>
                                <span className="text-[10px] text-zinc-400 font-medium">Root items = column headers · Sub-items = links</span>
                            </div>

                            {isLoadingNav ? (
                                <div className="p-12 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                                </div>
                            ) : footerItems.length === 0 ? (
                                <div className="p-14 text-center flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                        <PanelBottom className="h-6 w-6 text-purple-200" />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-400">No footer links yet</p>
                                    <p className="text-xs text-zinc-300">Click &quot;Add Link&quot; to get started</p>
                                </div>
                            ) : (
                                renderStructureItems(null)
                            )}
                        </div>

                        {/* Add form */}
                        {showAddForm && (
                            <div ref={formRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-md shadow-purple-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-purple-100 bg-purple-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                                <Plus className="h-3 w-3 text-white" />
                                            </div>
                                            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Add Footer Link</span>
                                        </div>
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="h-7 w-7 rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700 flex items-center justify-center shadow-sm transition-all"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddItem} className="p-5 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Position</Label>
                                                <select
                                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 outline-none focus:bg-white transition-all"
                                                    value={newItem.position}
                                                    onChange={(e) => setNewItem((p) => ({ ...p, position: e.target.value }))}
                                                >
                                                    <option value="footer">Footer Main</option>
                                                    <option value="footer_company">Footer Company</option>
                                                    <option value="footer_links">Footer Quick Links</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Column (Parent)</Label>
                                                <select
                                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 outline-none focus:bg-white transition-all"
                                                    value={newItem.parent}
                                                    onChange={(e) => setNewItem((p) => ({ ...p, parent: e.target.value }))}
                                                >
                                                    <option value="">Root Level (Column Header)</option>
                                                    {topLevelItems.map((i) => (
                                                        <option key={i.id} value={i.id}>[{i.position.replace('footer_', '')}] {i.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Label</Label>
                                                <Input
                                                    required
                                                    placeholder="e.g. About Us"
                                                    value={newItem.label}
                                                    onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                                                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">URL</Label>
                                                <Input
                                                    placeholder="e.g. /about"
                                                    value={newItem.url}
                                                    onChange={(e) => setNewItem((p) => ({ ...p, url: e.target.value }))}
                                                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white text-xs font-mono transition-all"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSavingItem}
                                            className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {isSavingItem ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                            {isSavingItem ? "Saving..." : "Add to Footer"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
