"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export default function NewMenuItem({ params }: { params: Promise<{ position: string }> }) {
    const { position } = use(params);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [linkType, setLinkType] = useState<"custom" | "page" | "category">("custom");

    const [formData, setFormData] = useState({
        label: "",
        url: "",
        order: "",
        is_active: true
    });

    useEffect(() => {
        const loadResources = async () => {
            try {
                const [pRes, cRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/pages/`, { credentials: "include" }),
                    fetch(`${API_BASE_URL}/categories/`, { credentials: "include" })
                ]);
                if (pRes.ok) setPages(await pRes.json());
                if (cRes.ok) setCategories(await cRes.json());
            } catch (e) {
                console.error("Failed to load resources", e);
            }
        };
        loadResources();
    }, []);

    const handleLinkTypeChange = (type: "custom" | "page" | "category") => {
        setLinkType(type);
        setFormData(prev => ({ ...prev, url: "" }));
    };

    const handleResourceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (!val) return;

        let newUrl = "";
        let newLabel = formData.label;

        if (linkType === "page") {
            const p = pages.find(x => x.slug === val);
            newUrl = val ? `/${val}` : "";
            if (p && !newLabel) newLabel = p.title;
        } else if (linkType === "category") {
            const c = categories.find(x => x.slug === val);
            newUrl = val ? `/category/${val}` : "";
            if (c && !newLabel) newLabel = c.name;
        }

        setFormData(prev => ({ ...prev, url: newUrl, label: newLabel }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/navigation/create/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    position,
                    order: formData.order ? parseInt(formData.order) : 0 // API handles 0 as auto if logic implemented, or manual 0
                }),
            });

            if (!res.ok) throw new Error("Failed to create item");

            toast.success("Menu item created!");
            router.push(`/dashboard/menus/${position}`);
            router.refresh();
        } catch (error) {
            toast.error("Failed to create menu item");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/menus/${position}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add Menu Item</h1>
                    <p className="text-muted-foreground">Add a new link to this menu.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
                <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                        id="label"
                        required
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        placeholder="e.g. Services"
                    />
                </div>

                <div className="space-y-4 border p-4 rounded-md bg-secondary/10">
                    <Label>Link Source</Label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={linkType === "custom" ? "default" : "outline"}
                            onClick={() => handleLinkTypeChange("custom")}
                        >
                            Custom URL
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={linkType === "page" ? "default" : "outline"}
                            onClick={() => handleLinkTypeChange("page")}
                        >
                            Page
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={linkType === "category" ? "default" : "outline"}
                            onClick={() => handleLinkTypeChange("category")}
                        >
                            Category
                        </Button>
                    </div>

                    {linkType === "page" && (
                        <div className="space-y-2">
                            <Label>Select Page</Label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3"
                                onChange={handleResourceSelect}
                                defaultValue=""
                            >
                                <option value="">Select a page...</option>
                                {pages.map(p => (
                                    <option key={p.slug} value={p.slug}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {linkType === "category" && (
                        <div className="space-y-2">
                            <Label>Select Category</Label>
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3"
                                onChange={handleResourceSelect}
                                defaultValue=""
                            >
                                <option value="">Select a category...</option>
                                {categories.map(c => (
                                    <option key={c.slug} value={c.slug}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                        id="url"
                        required
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder={linkType === "custom" ? "e.g. /services" : "Auto-filled"}
                        readOnly={linkType !== "custom"}
                        className={linkType !== "custom" ? "bg-muted" : ""}
                    />
                    {linkType === "custom" && (
                        <p className="text-xs text-muted-foreground">Use absolute URL (https://...) for external links.</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="order">Order (Optional)</Label>
                    <Input
                        id="order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                        placeholder="Leave empty for auto"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Create Item
                    </Button>
                </div>
            </form>
        </div>
    );
}
