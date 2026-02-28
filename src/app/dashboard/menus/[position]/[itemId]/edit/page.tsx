"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";

export default function EditMenuItem({ params }: { params: Promise<{ position: string, itemId: string }> }) {
    const { position, itemId } = use(params);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pages, setPages] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [menuItems, setMenuItems] = useState<any[]>([]);
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
                const [pRes, cRes, mRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/?position=${position}`)
                ]);
                if (pRes.ok) setPages(await pRes.json());
                if (cRes.ok) setCategories(await cRes.json());
                if (mRes.ok) {
                    const data = await mRes.json();
                    setMenuItems(Array.isArray(data) ? data : data.results || []);
                }
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

    const handleOrderChange = (newOrder: string) => {
        const newOrderNum = parseInt(newOrder);
        const oldOrderNum = parseInt(formData.order);
        if (isNaN(newOrderNum)) return;

        // Find the item currently at the new order position
        const swapItem = menuItems.find(
            (m) => m.order === newOrderNum && m.id.toString() !== itemId
        );

        // Update local menu items to reflect the swap
        if (swapItem) {
            setMenuItems(prev =>
                prev.map(m => {
                    if (m.id.toString() === itemId) return { ...m, order: newOrderNum };
                    if (m.id === swapItem.id) return { ...m, order: oldOrderNum };
                    return m;
                })
            );

            // Also update the swapped item on the server
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/${swapItem.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: oldOrderNum }),
            }).catch(() => { });
        }

        setFormData(prev => ({ ...prev, order: newOrder }));
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

    // Build order options showing which label is at each position
    const maxOrder = Math.max(menuItems.length, parseInt(formData.order) || 0, 10);
    const orderOptions = Array.from({ length: maxOrder }, (_, i) => {
        const orderNum = i + 1;
        const itemAtOrder = menuItems.find(
            (m) => m.order === orderNum && m.id.toString() !== itemId
        );
        return {
            value: orderNum,
            label: itemAtOrder
                ? `${orderNum} — ${itemAtOrder.label}`
                : `${orderNum}`,
            occupied: !!itemAtOrder,
        };
    });

    if (isLoading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-8 px-6 pt-6">
            <div className="max-w-[1100px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 px-5 rounded-xl bg-zinc-50 border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100/50">
                            <LinkIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1.5">Edit Navigation</p>
                            <h1 className="text-lg font-bold tracking-tight text-zinc-900 leading-none">
                                {formData.label || "Menu Item"}{" "}
                                <span className="text-zinc-400 font-normal text-sm">in {position.replace('_', ' ')}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-500 hover:text-zinc-800 gap-1 h-9 rounded-lg px-3 text-[11px] font-bold"
                            asChild
                        >
                            <Link href={`/dashboard/menus/${position}`}>
                                <ArrowLeft className="h-3.5 w-3.5" /> Back
                            </Link>
                        </Button>
                        <span className="text-[11px] font-mono text-zinc-400 bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200">
                            ID: {itemId}
                        </span>
                        <Button
                            onClick={() => handleSubmit()}
                            disabled={isSaving}
                            className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-[11px] gap-2 transition-all active:scale-95"
                        >
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                            Save
                        </Button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Left Column — Label + Link */}
                    <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50">
                                <LinkIcon size={14} />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">Link Details</h3>
                                <p className="text-[11px] font-medium text-zinc-400">Label and destination URL</p>
                            </div>
                        </div>

                        {/* Label */}
                        <div className="space-y-2">
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Label</Label>
                            <Input
                                autoFocus
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="h-10 rounded-xl text-[13px] font-semibold border-zinc-200 focus:ring-primary/20 bg-white transition-all"
                                placeholder="e.g. About Us"
                            />
                        </div>

                        {/* Link Type Selector */}
                        <div className="space-y-2">
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Link Destination</Label>
                            <div className="flex p-1 bg-zinc-100 rounded-xl">
                                {["custom", "page", "category"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleLinkTypeChange(type as any)}
                                        className={cn(
                                            "flex-1 py-1.5 text-[11px] font-bold capitalize rounded-lg transition-all duration-200",
                                            linkType === type
                                                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5"
                                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {linkType === "page" && (
                                <select
                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all text-zinc-700"
                                    onChange={handleResourceSelect}
                                    defaultValue=""
                                >
                                    <option value="">Choose a page to link...</option>
                                    {pages.map(p => (
                                        <option key={p.slug} value={p.slug}>{p.title}</option>
                                    ))}
                                </select>
                            )}

                            {linkType === "category" && (
                                <select
                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all text-zinc-700"
                                    onChange={handleResourceSelect}
                                    defaultValue=""
                                >
                                    <option value="">Choose a category to link...</option>
                                    {categories.map(c => (
                                        <option key={c.slug} value={c.slug}>{c.name}</option>
                                    ))}
                                </select>
                            )}

                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                    <LinkIcon className="h-3.5 w-3.5" />
                                </div>
                                <Input
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className={cn(
                                        "pl-9 h-10 rounded-xl text-[13px] font-mono transition-all",
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

                        {/* Order & Status */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Order</Label>
                                <select
                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all text-zinc-700"
                                    value={formData.order}
                                    onChange={(e) => handleOrderChange(e.target.value)}
                                >
                                    {orderOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Visibility</Label>
                                <div className="h-10 flex items-center justify-between px-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
                                    <span className={cn("text-[12px] font-bold transition-colors", formData.is_active ? "text-green-600" : "text-zinc-400")}>
                                        {formData.is_active ? "Active" : "Hidden"}
                                    </span>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column — Typography & Style */}
                    <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
                                <Settings size={14} />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">Typography & Style</h3>
                                <p className="text-[11px] font-medium text-zinc-400">Customize appearance</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Font Family</Label>
                                <select
                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
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
                                <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Font Size</Label>
                                <select
                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
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
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Font Color</Label>
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
                                    className="h-10 flex-1 rounded-xl text-[13px] font-mono border-zinc-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                            <span className="text-[12px] font-bold text-zinc-600">Bold Font Weight</span>
                            <Switch
                                checked={formData.settings.is_bold}
                                onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, is_bold: checked } })}
                            />
                        </div>

                        {/* Live Preview */}
                        <div className="space-y-2 pt-2 border-t border-zinc-100">
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">Preview</Label>
                            <div className="px-5 py-4 rounded-xl border border-zinc-200 bg-zinc-50/30">
                                <span
                                    style={{
                                        fontFamily: formData.settings.font_family || "inherit",
                                        fontSize: formData.settings.font_size || "14px",
                                        color: formData.settings.color || "#0f172a",
                                        fontWeight: formData.settings.is_bold ? 700 : 400,
                                    }}
                                >
                                    {formData.label || "Menu Label"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between p-4 px-5 rounded-xl bg-zinc-50 border border-zinc-200 shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg px-3 text-[11px] font-bold gap-1.5"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Item
                    </Button>
                    <p className="text-[10px] text-zinc-400 font-medium hidden md:block">
                        Changes will be reflected immediately on the live site.
                    </p>
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={isSaving}
                        className="h-9 px-6 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-[11px] gap-2 transition-all active:scale-95"
                    >
                        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Save Changes
                    </Button>
                </div>

            </div>
        </div>
    );
}
