"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Assuming Switch is available
import {
    ArrowLeft,
    Loader2,
    Save,
    Trash2,
    Zap,
    Link as LinkIcon,
    Settings,
    Check,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function EditMenuItem({ params }: { params: Promise<{ position: string, itemId: string }> }) {
    const { position, itemId } = use(params);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pages, setPages] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [linkType, setLinkType] = useState<"custom" | "page" | "category">("custom");

    const [formData, setFormData] = useState({
        label: "",
        url: "",
        order: "",
        is_active: true,
        settings: {
            color: "",
            font_family: "",
            font_size: "",
            is_bold: false
        }
    });

    useEffect(() => {
        const loadResources = async () => {
            try {
                const [pRes, cRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/`)
                ]);
                if (pRes.ok) setPages(await pRes.json());
                if (cRes.ok) setCategories(await cRes.json());
            } catch (e) {
                console.error("Failed to load resources", e);
            }
        };
        loadResources();
        fetchItem();
    }, [itemId]);

    const fetchItem = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/${itemId}/`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    label: data.label,
                    url: data.url,
                    order: data.order.toString(),
                    is_active: data.is_active,
                    settings: {
                        color: data.settings?.color || "",
                        font_family: data.settings?.font_family || "",
                        font_size: data.settings?.font_size || "",
                        is_bold: data.settings?.is_bold || false
                    }
                });

                // Try to guess link type
                if (data.url.startsWith('/category/')) setLinkType('category');
                else if (data.url.startsWith('/') && !data.url.includes('.')) setLinkType('page');
                else setLinkType('custom');

            } else {
                toast.error("Failed to load item");
            }
        } catch (error) {
            toast.error("Error loading item");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkTypeChange = (type: "custom" | "page" | "category") => {
        setLinkType(type);
    };

    const handleResourceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (!val) return;

        let newUrl = "";
        if (linkType === "page") {
            newUrl = `/${val}`;
        } else if (linkType === "category") {
            newUrl = `/category/${val}`;
        }
        setFormData(prev => ({ ...prev, url: newUrl }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/${itemId}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    position,
                    order: parseInt(formData.order) || 0
                }),
            });

            if (!res.ok) throw new Error("Failed to update");

            toast.success("Menu item updated!");
            router.push(`/dashboard/menus/${position}`);
        } catch (error) {
            toast.error("Failed to update menu item");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this menu item? This action cannot be undone.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/${itemId}/`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Item deleted");
                router.push(`/dashboard/menus/${position}`);
            } else {
                throw new Error("Failed to delete");
            }
        } catch {
            toast.error("Failed to delete item");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-lg space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground -ml-2 gap-1 h-8 rounded-full px-3"
                        asChild
                    >
                        <Link href={`/dashboard/menus/${position}`}>
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200">
                            ID: {itemId}
                        </span>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="border-zinc-200/60 shadow-xl shadow-zinc-200/20 rounded-[24px] overflow-hidden bg-white">
                    <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-5 pt-6 px-7">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold tracking-tight text-zinc-900">
                                    Edit Navigation Link
                                </CardTitle>
                                <CardDescription className="text-xs mt-1.5 font-medium text-zinc-500">
                                    Updating item in <span className="text-zinc-700 font-bold capitalize">{position.replace('_', ' ')}</span> menu
                                </CardDescription>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <LinkIcon className="h-5 w-5" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-7 space-y-7">
                        {/* Label Input */}
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">Label</Label>
                            <Input
                                autoFocus
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="h-12 rounded-xl text-base font-semibold border-zinc-200 focus:ring-primary/20 bg-zinc-50/30 transition-all focus:bg-white"
                                placeholder="e.g. About Us"
                            />
                        </div>

                        {/* Link Type Selector */}
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">Link Destination</Label>
                            <div className="flex p-1 bg-zinc-100 rounded-xl">
                                {["custom", "page", "category"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleLinkTypeChange(type as any)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all duration-200",
                                            linkType === type
                                                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5"
                                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {/* Dynamic Input Area */}
                            <div className="pt-2">
                                {linkType === "page" && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200 mb-3">
                                        <select
                                            className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all text-zinc-700"
                                            onChange={handleResourceSelect}
                                            defaultValue=""
                                        >
                                            <option value="">Choose a page to link...</option>
                                            {pages.map(p => (
                                                <option key={p.slug} value={p.slug}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {linkType === "category" && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200 mb-3">
                                        <select
                                            className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all text-zinc-700"
                                            onChange={handleResourceSelect}
                                            defaultValue=""
                                        >
                                            <option value="">Choose a category to link...</option>
                                            {categories.map(c => (
                                                <option key={c.slug} value={c.slug}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <LinkIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <Input
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        className={cn(
                                            "pl-9 h-11 rounded-xl text-sm font-mono transition-all",
                                            linkType !== "custom"
                                                ? "bg-zinc-50 border-zinc-100 text-zinc-500"
                                                : "bg-white border-zinc-200 focus:ring-primary/20"
                                        )}
                                        placeholder="https://..."
                                        readOnly={linkType !== "custom"}
                                    />
                                    {linkType !== "custom" && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Typography & Style */}
                        <div className="space-y-4 pt-2 border-t border-zinc-100">
                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">Typography & Style</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-zinc-400 uppercase font-bold">Font Family</Label>
                                    <select
                                        className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none"
                                        value={formData.settings.font_family}
                                        onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, font_family: e.target.value } })}
                                    >
                                        <option value="">Default</option>
                                        <option value="'Inter', sans-serif">Inter</option>
                                        <option value="'Roboto', sans-serif">Roboto</option>
                                        <option value="'Outfit', sans-serif">Outfit</option>
                                        <option value="'Georgia', serif">Georgia (Serif)</option>
                                        <option value="'Merriweather', serif">Merriweather</option>
                                        <option value="'Playfair Display', serif">Playfair Display</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-zinc-400 uppercase font-bold">Font Size</Label>
                                    <select
                                        className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none"
                                        value={formData.settings.font_size}
                                        onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, font_size: e.target.value } })}
                                    >
                                        <option value="">Default</option>
                                        <option value="11px">11px — XS</option>
                                        <option value="12px">12px — Small</option>
                                        <option value="13px">13px — Medium</option>
                                        <option value="14px">14px — Normal</option>
                                        <option value="15px">15px — Comfortable</option>
                                        <option value="16px">16px — Large</option>
                                        <option value="18px">18px — XL</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-400 uppercase font-bold">Font Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={formData.settings.color || "#0f172a"}
                                        onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, color: e.target.value } })}
                                        className="h-10 w-14 p-1 rounded-xl border border-zinc-200 cursor-pointer"
                                    />
                                    <Input
                                        placeholder="#HEX or leave blank"
                                        value={formData.settings.color}
                                        onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, color: e.target.value } })}
                                        className="h-10 flex-1 rounded-xl text-xs font-mono border-zinc-200"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                                <span className="text-xs font-bold text-zinc-600">Bold Font Weight</span>
                                <Switch
                                    checked={formData.settings.is_bold}
                                    onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, is_bold: checked } })}
                                />
                            </div>
                        </div>

                        {/* Order & Status Row */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">Order</Label>
                                <Input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                    className="h-11 rounded-xl text-sm border-zinc-200 text-center font-mono"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">Visibility</Label>
                                <div className="h-11 flex items-center justify-between px-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
                                    <span className={cn("text-xs font-bold transition-colors", formData.is_active ? "text-green-600" : "text-zinc-400")}>
                                        {formData.is_active ? "Active" : "Hidden"}
                                    </span>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                    </CardContent>

                    {/* Footer Actions */}
                    <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg px-3 transition-colors text-xs font-bold"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete
                        </Button>

                        <Button
                            onClick={() => handleSubmit()}
                            disabled={isSaving}
                            className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </Card>

                <p className="text-center text-[10px] text-zinc-400 font-medium">
                    Changes will be reflected immediately on the live site.
                </p>
            </div>
        </div>
    );
}
