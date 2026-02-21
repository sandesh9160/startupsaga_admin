"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronRight,
    Search,
    X,
    Rocket,
    FileText,
    Edit,
    Save,
    Loader2,
    Image as ImageIcon,
    MapPin,
    Globe,
    BarChart3,
    Zap,
    Sparkles,
    ExternalLink,
    ChevronLeft,
    Plus,
    Building2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    fetchAPI,
    getHubBySlug,
    updateHub,
    createHub,
    getCityBySlug,
    updateCity,
    createCity,
    generateSEO,
    generateContent,
    City
} from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CitySEOGenerator, CityDescription, CityAltText } from "@/lib/city-prompts";
import { getSafeImageSrc } from "@/lib/images";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";

export default function CityFormPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    const isEditing = !!slug;

    const [mounted, setMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);

    // Extended interface to support image_alt locally
    interface ExtendedCity extends City {
        image_alt?: string;
    }

    useEffect(() => {
        setMounted(true);
    }, []);

    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [formData, setFormData] = useState<Partial<ExtendedCity>>({
        name: "",
        slug: "",
        description: "",
        startupCount: 0,
        unicornCount: 0,
        image: "",
        tier: "3",
        is_featured: false,
        status: "draft",
        meta_title: "",
        meta_description: "",
        image_alt: "",
    });

    useEffect(() => {
        if (isEditing) {
            loadCity();
        }
    }, [slug]);

    const loadCity = async () => {
        try {
            const city = await getCityBySlug(slug);
            setFormData({
                ...city,
                startupCount: city.startupCount || city.startup_count || 0,
                unicornCount: city.unicornCount || city.unicorn_count || 0
            });
            fetchAPI("/media/").then(data => setMediaItems(Array.isArray(data) ? data : [])).catch(e => console.error(e));
        } catch (err) {
            toast.error("Failed to load city data");
            router.push("/dashboard/hubs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isEditing) {
            fetchAPI("/media/").then(data => setMediaItems(Array.isArray(data) ? data : [])).catch(e => console.error(e));
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            toast.error("Name and slug are required");
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing) {
                await updateCity(slug, formData);
                toast.success("City updated successfully");
            } else {
                await createCity(formData as City);
                toast.success("City created successfully");
            }
            router.push("/dashboard/hubs");
        } catch (err: any) {
            toast.error(err.message || "Failed to save city");
        } finally {
            setIsSaving(false);
        }
    };

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/--+/g, "-");
    };

    const handleGenerateSEO = async () => {
        if (!formData.name) {
            toast.error("Enter city name first");
            return;
        }
        setIsSaving(true);
        try {
            const aiData = await CitySEOGenerator(formData.name, formData.description || "");
            if (aiData.meta_title && aiData.meta_description) {
                setFormData(prev => ({
                    ...prev,
                    meta_title: aiData.meta_title,
                    meta_description: aiData.meta_description
                }));
                toast.success("SEO tags optimized");
            }
        } catch (err) {
            toast.error("AI generation failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRewriteDescription = async () => {
        if (!formData.name) {
            toast.error("Enter city name first");
            return;
        }
        setIsSaving(true);
        try {
            const rewritten = await CityDescription(formData.name, formData.description || "");
            if (rewritten) {
                setFormData(prev => ({ ...prev, description: rewritten }));
                toast.success("Description enhanced by AI");
            }
        } catch (err) {
            toast.error("AI rewrite failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateAltText = async () => {
        if (!formData.name) {
            toast.error("Enter city name first");
            return;
        }
        setIsSaving(true);
        try {
            const altText = await CityAltText(formData.name);
            if (altText) {
                setFormData(prev => ({ ...prev, image_alt: altText }));
                toast.success("Alt text generated");
            }
        } catch (err) {
            toast.error("AI generation failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'og_image') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600 opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading City...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-screen">
                {/* --- HEADER --- Studio Style */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100/50 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-3xl bg-purple-600 flex items-center justify-center shadow-xl shadow-purple-600/20 overflow-hidden">
                            {formData.image ? (
                                <img src={getSafeImageSrc(formData.image)} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <MapPin className="h-7 w-7 text-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-full">City Editor</span>
                                <Badge variant="outline" className="text-[9px] font-bold border-zinc-200 text-zinc-400 rounded-lg">{isEditing ? "Edit Mode" : "New City"}</Badge>
                            </div>
                            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                                {isEditing ? formData.name : "Add New City"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard/hubs")}
                            className="h-12 w-12 rounded-2xl border border-zinc-200 hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm transition-all"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </Button>

                        {isEditing && (
                            <Button
                                variant="ghost"
                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_SITE_URL}/hubs/${formData.slug}`, '_blank')}
                                className="bg-white border border-zinc-200 h-12 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 shadow-sm transition-all hover:border-zinc-300 flex items-center gap-2"
                            >
                                <ExternalLink size={14} className="h-3.5 w-3.5" /> Preview Hub
                            </Button>
                        )}

                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-8 font-black text-[11px] uppercase tracking-widest h-12 transition-all active:scale-95 shadow-xl shadow-purple-600/20 border-none flex items-center gap-2"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                                    <MapPin className="h-3.5 w-3.5" />
                                </div>
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">City Details</h2>
                            </div>

                            <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Name</Label>
                                            <Input
                                                placeholder="e.g. San Francisco"
                                                value={formData.name || ""}
                                                onChange={(e) => {
                                                    const newName = e.target.value;
                                                    const newSlug = isEditing ? formData.slug : slugify(newName);
                                                    setFormData({ ...formData, name: newName, slug: newSlug || "" });
                                                }}
                                                className="h-11 rounded-xl bg-white border-zinc-200 focus:ring-2 focus:ring-purple-500/10 text-xs font-bold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Slug</Label>
                                            <Input
                                                placeholder="san-francisco"
                                                value={formData.slug || ""}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="h-11 rounded-xl bg-white border-zinc-200 focus:ring-2 focus:ring-purple-500/10 text-xs font-bold transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Tier</Label>
                                            <Select
                                                value={formData.tier || "3"}
                                                onValueChange={(value) => setFormData({ ...formData, tier: value })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-white border-zinc-200 text-xs font-bold">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
                                                    <SelectItem value="1" className="text-xs font-bold py-2.5">Tier 1</SelectItem>
                                                    <SelectItem value="2" className="text-xs font-bold py-2.5">Tier 2</SelectItem>
                                                    <SelectItem value="3" className="text-xs font-bold py-2.5">Tier 3</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Startup Count</Label>
                                            <Input
                                                type="number"
                                                value={formData.startupCount || 0}
                                                onChange={(e) => setFormData({ ...formData, startupCount: parseInt(e.target.value) || 0 })}
                                                className="h-11 rounded-xl bg-white border-zinc-200 focus:ring-2 focus:ring-purple-500/10 text-xs font-bold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Unicorn Count</Label>
                                            <Input
                                                type="number"
                                                value={formData.unicornCount || 0}
                                                onChange={(e) => setFormData({ ...formData, unicornCount: parseInt(e.target.value) || 0 })}
                                                className="h-11 rounded-xl bg-white border-zinc-200 focus:ring-2 focus:ring-purple-500/10 text-xs font-bold transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center justify-between px-1">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Description</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isSaving}
                                                onClick={handleRewriteDescription}
                                                className="h-7 px-2 text-[9px] font-black uppercase tracking-widest rounded-lg text-purple-600 hover:bg-purple-50 flex items-center gap-1.5 transition-all"
                                            >
                                                <Zap className="h-3 w-3" />
                                                AI Write
                                            </Button>
                                        </div>
                                        <RichTextEditor
                                            content={formData.description || ""}
                                            onChange={(content) => setFormData({ ...formData, description: content })}
                                            placeholder="Describe the local startup ecosystem..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                                        <Globe className="h-3.5 w-3.5" />
                                    </div>
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">SEO</h2>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateSEO}
                                    className="h-8 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg border-purple-200 hover:bg-purple-50 text-purple-600 shadow-sm transition-all"
                                >
                                    <Sparkles className="mr-1.5 h-3 w-3" /> Smart Fill
                                </Button>
                            </div>

                            <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                <CardContent className="p-6 space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Meta Title</Label>
                                        <Input
                                            placeholder="Page title for search engines"
                                            value={formData.meta_title || ""}
                                            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                            className="h-11 rounded-xl bg-white border-zinc-200 focus:ring-2 focus:ring-purple-500/10 text-xs font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Meta Description</Label>
                                        <Textarea
                                            placeholder="Brief summary for search results..."
                                            value={formData.meta_description || ""}
                                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                            className="min-h-[80px] rounded-xl bg-white border-zinc-200 focus:ring-2 focus:ring-purple-500/10 text-xs font-medium p-4 resize-none leading-relaxed"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>


                    </div>

                    {/* Sidebar Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                                    <ImageIcon className="h-3.5 w-3.5" />
                                </div>
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Image</h2>
                            </div>

                            <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                <CardContent className="p-4 space-y-4">
                                    <div
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        className="aspect-[16/10] w-full rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:bg-zinc-100 transition-all duration-300"
                                    >
                                        {formData.image ? (
                                            <>
                                                <img src={getSafeImageSrc(formData.image)} alt="City Preview" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <span className="text-white text-[9px] font-black uppercase tracking-widest bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 transition-all">
                                                <ImageIcon className="h-8 w-8 text-zinc-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Upload Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Select From Library</Label>
                                        <select
                                            className="w-full h-10 rounded-xl border border-zinc-100 bg-white px-3 text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-purple-500/10"
                                            value={formData.image || ""}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        >
                                            <option value="">— Choose an asset —</option>
                                            {mediaItems.map((m: any) => (
                                                <option key={m.id} value={m.url}>{m.title || m.url || "Untitled"}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'image')}
                                    />
                                    <Input
                                        placeholder="Or paste image URL (supports WebP, PNG, JPG)..."
                                        value={formData.image || ""}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="h-10 rounded-xl bg-white border-zinc-200 text-[10px] font-bold"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                <CardHeader className="px-5 py-3 border-b border-zinc-100/50 bg-zinc-50/30">
                                    <CardTitle className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Social Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div
                                        onClick={() => document.getElementById('og-image-upload')?.click()}
                                        className="aspect-video w-full rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:bg-zinc-100 transition-all"
                                    >
                                        {formData.og_image ? (
                                            <>
                                                <img src={getSafeImageSrc(formData.og_image)} alt="OG Preview" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <span className="text-white text-[9px] font-black uppercase tracking-widest bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg">Change OG Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 transition-all">
                                                <ImageIcon className="h-6 w-6 text-zinc-400" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-center">Upload <br /> Social Card</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="og-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'og_image')}
                                    />
                                    <Input
                                        placeholder="OG Image URL (WebP, PNG)"
                                        value={formData.og_image || ""}
                                        onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                                        className="h-9 rounded-xl bg-white border-zinc-200 text-[10px] font-bold"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                <CardHeader className="px-5 py-4 border-b border-zinc-100/50 bg-zinc-50/30">
                                    <CardTitle className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-900">Featured</div>
                                            <div className="text-[8px] text-zinc-400 font-bold uppercase tracking-tight">Show on home page</div>
                                        </div>
                                        <Switch
                                            checked={formData.is_featured}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-zinc-100/50">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block ml-0.5">Status</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={formData.status === 'published' ? 'default' : 'outline'}
                                                className={cn(
                                                    "flex-1 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    formData.status === 'published'
                                                        ? "bg-emerald-500 hover:bg-emerald-600 border-none shadow-md shadow-emerald-500/20"
                                                        : "bg-white border-zinc-200 text-zinc-400"
                                                )}
                                                onClick={() => setFormData({ ...formData, status: 'published' })}
                                            >
                                                Live
                                            </Button>
                                            <Button
                                                variant={formData.status === 'draft' ? 'default' : 'outline'}
                                                className={cn(
                                                    "flex-1 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    formData.status === 'draft'
                                                        ? "bg-zinc-900 border-none shadow-md shadow-zinc-900/10"
                                                        : "bg-white border-zinc-200 text-zinc-400"
                                                )}
                                                onClick={() => setFormData({ ...formData, status: 'draft' })}
                                            >
                                                Draft
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alt Text Section */}
                            <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Image Alt Text</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={isSaving || !formData.name}
                                            onClick={handleGenerateAltText}
                                            className="h-6 px-2 text-[8px] font-black uppercase tracking-widest rounded-lg text-purple-600 hover:bg-purple-50 flex items-center gap-1 transition-all"
                                        >
                                            <Zap className="h-3 w-3" />
                                            Auto-Write
                                        </Button>
                                    </div>
                                    <Textarea
                                        placeholder="Descriptive text for accessibility..."
                                        value={formData.image_alt || ""}
                                        onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                                        className="min-h-[60px] rounded-xl bg-white border-zinc-200 focus:ring-2 focus:ring-purple-500/10 text-xs font-medium resize-none"
                                    />
                                    <p className="text-[9px] text-zinc-400 font-medium">Generate SEO-friendly text describing this city's image.</p>
                                </CardContent>
                            </Card>

                            <div className="bg-purple-600/5 border border-purple-600/10 rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                                    <Zap className="h-20 w-20 text-purple-600" />
                                </div>
                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-purple-600/10 flex items-center justify-center">
                                        <Zap className="h-4.5 w-4.5 text-purple-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Growth Factor</h4>
                                        <p className="text-[9px] text-purple-600/70 leading-relaxed font-bold italic">
                                            City data helps map the regional growth and innovation density across the platform.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
