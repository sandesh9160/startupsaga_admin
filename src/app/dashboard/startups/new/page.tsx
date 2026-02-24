"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    Sparkles,
    Save,
    Loader2,
    Building2,
    Globe,
    User,
    Linkedin,
    Calendar,
    Tags,
    MapPin,
    Eye,
    LayoutGrid,
    Check,
    Plus,
    Trash2,
    Upload,
    Image as ImageIcon,
    ExternalLink,
    Briefcase,
    PenTool,
    List
} from "lucide-react";
import Link from "next/link";
import {
    generateContent,
    generateSEO,
    startupsApi,
    getCategories,
    getHubs,
    Category,
    Hub
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { getSafeImageSrc } from "@/lib/images";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const BUSINESS_MODELS = [
    { value: "b2b", label: "B2B" },
    { value: "b2c", label: "B2C" },
    { value: "b2b2c", label: "B2B2C" },
    { value: "d2c", label: "D2C" },
    { value: "saas", label: "SaaS" },
    { value: "marketplace", label: "Marketplace" },
    { value: "subscription", label: "Subscription" },
    { value: "freemium", label: "Freemium" },
    { value: "platform", label: "Platform" },
    { value: "other", label: "Other" },
];

const STAGES = [
    "Bootstrapped", "Pre-Seed", "Seed", "Series A",
    "Series B", "Series C+", "IPO", "Unicorn"
];

const SECTORS = [
    "B2B SaaS", "B2C Consumer App", "Marketplace", "Fintech",
    "Healthtech", "Edtech", "E-commerce/D2C", "Logistics/Supply Chain",
    "Deeptech/AI", "Agritech", "Clean Energy/Sustainability",
    "Gaming/Entertainment", "Hardware/Robotics", "Proptech", "Web3/Crypto",
    "Foodtech", "Mediatech", "Legaltech", "HRtech", "Insurtech"
];

const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export default function NewStartupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [hubs, setHubs] = useState<Hub[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        tagline: "",
        description: "",
        website_url: "",
        founder_name: "",
        founder_linkedin: "",
        founded_year: "",
        category: "",
        city: "",
        stage: "",
        sector: "",
        business_model: "",
        team_size: "",
        industry_tags: [] as string[],
        founders_data: [] as any[],
        status: "published",
        is_featured: false,
        logo: "",
        og_image: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
    });

    const [tagInput, setTagInput] = useState("");
    const [slugLocked, setSlugLocked] = useState(false);

    // Helper: convert name to slug
    const toSlug = (name: string) =>
        name.toLowerCase().trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, hbs] = await Promise.all([getCategories(), getHubs()]);
                setCategories(cats);
                setHubs(hbs);
            } catch (err) {
                console.error("Failed to load categories/hubs", err);
            }
        };
        loadData();
    }, []);

    const handleGenerateContent = async () => {
        if (!formData.name) {
            toast.error("Please enter a startup name first");
            return;
        }
        setIsGenerating(true);
        try {
            const descResult = await generateContent(`Write a catchy tagline and a professional 3-sentence description for a startup named "${formData.name}". Respond in JSON format with "tagline" and "description" keys.`);

            let generatedTagline = "";
            let generatedDesc = "";

            try {
                const parsed = JSON.parse(descResult.content);
                generatedTagline = parsed.tagline;
                generatedDesc = parsed.description;
            } catch {
                const lines = descResult.content.split('\n').filter((l: string) => l.trim());
                generatedTagline = lines[0]?.replace(/^Tagline: /i, '') || "";
                generatedDesc = lines.slice(1).join(' ') || lines[0] || "";
            }

            const seoResult = await generateSEO({
                title: formData.name,
                description: generatedDesc || formData.name,
                content: generatedDesc || formData.name,
                type: 'startup'
            });

            setFormData(prev => ({
                ...prev,
                tagline: generatedTagline || prev.tagline,
                description: prev.description
                    ? prev.description + `\n<p>${generatedDesc}</p>`
                    : `<p>${generatedDesc}</p>`,
                meta_title: seoResult.meta_title || `${formData.name} | Startup Directory`,
                meta_description: seoResult.meta_description || generatedDesc || "",
                meta_keywords: seoResult.keywords || seoResult.meta_keywords || ""
            }));

            toast.success("Content generated with AI");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate content");
        } finally {
            setIsGenerating(false);
        }
    };

    const addFounder = () => {
        setFormData(prev => ({
            ...prev,
            founders_data: [...prev.founders_data, { name: "", role: "", linkedin: "", image: "" }]
        }));
    };

    const removeFounder = (index: number) => {
        setFormData(prev => ({
            ...prev,
            founders_data: prev.founders_data.filter((_, i) => i !== index)
        }));
    };

    const updateFounder = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            founders_data: prev.founders_data.map((f, i) => i === index ? { ...f, [field]: value } : f)
        }));
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.industry_tags.includes(tag)) {
            setFormData(prev => ({ ...prev, industry_tags: [...prev.industry_tags, tag] }));
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, industry_tags: prev.industry_tags.filter(t => t !== tag) }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const sectionTemplates = [
        { title: "The Problem", placeholder: "Describe the core problem this startup is solving..." },
        { title: "The Solution", placeholder: "Explain how their product or service addresses this problem..." },
        { title: "The Journey", placeholder: "Share the story of how the founders started and built the company..." },
        { title: "Revenue Model", placeholder: "Describe how the startup monetizes..." },
        { title: "Funding & Growth", placeholder: "Share key metrics, funding rounds, and growth milestones..." },
        { title: "Future Plans", placeholder: "What's next for this startup..." }
    ];

    const headingRegex = /<(h[2-4])[^>]*>([\s\S]*?)<\/\1>/gi;
    const tocContent = formData.description || '';
    const tocMatches = [...tocContent.matchAll(headingRegex)];
    const tocItems = tocMatches.map((match, idx) => {
        const tag = match[1];
        const rawInner = match[2];
        const plainTitle = rawInner.replace(/<[^>]*>/g, '').trim();
        const fullMatch = match[0];
        const startIndex = match.index || 0;
        return {
            id: idx + 1,
            title: plainTitle || `[Untitled ${tag.toUpperCase()}]`,
            fullMatch,
            rawInner,
            tag,
            startIndex
        };
    });

    const handleRenameHeading = (startIndex: number, fullMatch: string, oldTitle: string, newTitle: string) => {
        if (!newTitle.trim() || newTitle === oldTitle) return;

        const currentContent = formData.description;
        if (currentContent.substring(startIndex, startIndex + fullMatch.length) !== fullMatch) {
            toast.error("Content synchronized, please try again");
            return;
        }

        const newFullMatch = fullMatch.replace(oldTitle, newTitle);
        const updatedContent =
            currentContent.slice(0, startIndex) +
            newFullMatch +
            currentContent.slice(startIndex + fullMatch.length);

        setFormData(prev => ({ ...prev, description: updatedContent }));
    };

    const handleDeleteHeading = (startIndex: number, fullMatch: string) => {
        const currentContent = formData.description;
        if (currentContent.substring(startIndex, startIndex + fullMatch.length) !== fullMatch) {
            toast.error("Content synchronized, please try again");
            return;
        }

        const endOfH2 = startIndex + fullMatch.length;
        const remainingAfter = currentContent.slice(endOfH2);

        const nextHeadingMatch = remainingAfter.match(/<(h[2-4])[^>]*>/i);
        const endOfSection = nextHeadingMatch
            ? endOfH2 + remainingAfter.indexOf(nextHeadingMatch[0])
            : currentContent.length;

        const updatedContent = currentContent.slice(0, startIndex) + currentContent.slice(endOfSection);
        setFormData(prev => ({ ...prev, description: updatedContent.trim() }));
        toast.success("Section removed");
    };

    const handleAddStandardSection = (template: { title: string; placeholder: string }) => {
        const sectionHtml = `\n<h2 id="${template.title.toLowerCase().replace(/\s+/g, '-')}">${template.title}</h2>\n<p>${template.placeholder}</p>\n`;
        setFormData(prev => ({
            ...prev,
            description: prev.description + sectionHtml
        }));
        toast.success(`Section "${template.title}" added`);
    };

    const handleAddEmptySection = () => {
        const sectionHtml = `\n<h2>New Section</h2>\n<p>Start writing here...</p>\n`;
        setFormData(prev => ({
            ...prev,
            description: prev.description + sectionHtml
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const cleanData = {
                ...formData,
                founded_year: formData.founded_year ? parseInt(formData.founded_year.toString()) : undefined,
                funding_stage: formData.stage,
                industry_tags: formData.industry_tags.length > 0 ? formData.industry_tags : (formData.sector ? [formData.sector] : []),
            };
            await startupsApi.create(cleanData);
            toast.success("Startup created successfully");
            router.push("/dashboard/startups");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to create startup");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50 transition-all active:scale-95"
                        asChild
                    >
                        <Link href="/dashboard/startups">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Master Data</p>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900">New Startup</h1>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest leading-none mt-1">
                            Expand the ecosystem with a new venture
                        </p>
                    </div>
                </div>

                {/* Format Toggle */}
                <div className="hidden lg:flex p-1 bg-zinc-200/50 rounded-lg shrink-0 items-center">
                    <Link href="/dashboard/stories/new" className="px-5 py-1.5 text-xs font-bold rounded-md text-zinc-500 hover:text-zinc-700 transition-all flex items-center gap-2">
                        <PenTool className="h-3 w-3" /> Blog Post
                    </Link>
                    <div className="px-5 py-1.5 text-xs font-bold rounded-md bg-white text-zinc-900 shadow-sm flex items-center gap-2">
                        <Building2 className="h-3 w-3 text-purple-600" /> Startup Journey
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column — Primary Data */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Consolidated Startup Profile */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Building2 className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                                    Startup Profile
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 px-3 rounded-lg border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all text-[9px] font-bold uppercase tracking-wider"
                                onClick={handleGenerateContent}
                                disabled={isGenerating || !formData.name}
                            >
                                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                AI Assist
                            </Button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Identity & Branding */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                                    <Globe className="h-3.5 w-3.5 text-zinc-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Identity & Branding</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Startup Name</Label>
                                        <Input
                                            placeholder="e.g. Zomato"
                                            value={formData.name}
                                            onChange={(e) => {
                                                const newName = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    name: newName,
                                                    // live-sync slug while not manually locked
                                                    ...(slugLocked ? {} : { slug: toSlug(newName) }),
                                                }));
                                            }}
                                            className="h-10 px-3 rounded-xl border-zinc-200"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between ml-1">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Slug</Label>
                                            {!slugLocked && (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    auto-sync
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                placeholder="zomato"
                                                value={formData.slug}
                                                onChange={(e) => {
                                                    setSlugLocked(true);
                                                    setFormData({ ...formData, slug: e.target.value });
                                                }}
                                                className={cn(
                                                    "h-10 px-3 rounded-xl border-zinc-200 pr-16",
                                                    slugLocked ? "border-amber-200 bg-amber-50/30" : "border-emerald-200 bg-emerald-50/20"
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-1 top-1 h-8 text-[9px] font-bold uppercase tracking-wider text-purple-600 hover:bg-purple-50"
                                                onClick={() => {
                                                    setSlugLocked(false);
                                                    setFormData(prev => ({ ...prev, slug: toSlug(prev.name) }));
                                                }}
                                            >
                                                Auto
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Website URL</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="https://example.com"
                                                value={formData.website_url}
                                                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                                className="h-10 pl-9 pr-3 rounded-xl border-zinc-200 bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tagline</Label>
                                        <Input
                                            placeholder="e.g. 10-minute grocery delivery"
                                            value={formData.tagline}
                                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                            className="h-10 px-3 rounded-xl border-zinc-200"
                                        />
                                    </div>
                                </div>

                                {/* Logo & OG Image */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Startup Logo</Label>
                                        <div className="flex gap-4 items-start">
                                            <div className="relative h-20 w-20 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-zinc-50 transition-all shadow-sm group shrink-0">
                                                {formData.logo ? (
                                                    <img src={getSafeImageSrc(formData.logo)} alt="" className="h-full w-full object-contain p-2" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 opacity-30 group-hover:opacity-100">
                                                        <Upload className="h-5 w-5" />
                                                        <span className="text-[8px] font-black uppercase">Upload</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "logo")} />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    placeholder="Logo URL (supports WebP, PNG, JPG)"
                                                    value={formData.logo || ""}
                                                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                                    className="h-10 rounded-xl bg-white border-zinc-200 text-xs"
                                                />
                                                <p className="text-[9px] text-zinc-400 font-medium ml-1 italic">Paste URL or click square to upload</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Social Preview (OG Image)</Label>
                                        <div className="flex gap-4 items-start">
                                            <div className="relative h-20 w-32 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-zinc-50 transition-all shadow-sm group shrink-0">
                                                {formData.og_image ? (
                                                    <img src={getSafeImageSrc(formData.og_image)} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 opacity-30 group-hover:opacity-100">
                                                        <ImageIcon className="h-5 w-5" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Upload social</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "og_image")} />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    placeholder="OG Image URL (WebP/JPEG)"
                                                    value={formData.og_image || ""}
                                                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                                                    className="h-10 rounded-xl bg-white border-zinc-200 text-xs"
                                                />
                                                <p className="text-[9px] text-zinc-400 font-medium ml-1 italic">Social card (1200x630)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Category & City */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(v) => setFormData({ ...formData, category: v })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white text-xs">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id || cat.slug} value={cat.id?.toString() || ""}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Location Hub</Label>
                                        <Select
                                            value={formData.city}
                                            onValueChange={(v) => setFormData({ ...formData, city: v })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white text-xs">
                                                <SelectValue placeholder="Select Hub" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hubs.map((hub) => (
                                                    <SelectItem key={hub.id || hub.slug} value={hub.id?.toString() || ""}>
                                                        {hub.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Business & Growth */}
                            <div className="space-y-5 pt-4">
                                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                                    <LayoutGrid className="h-3.5 w-3.5 text-zinc-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Business & Growth</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Founded Year</Label>
                                        <Input
                                            type="number"
                                            placeholder="2024"
                                            value={formData.founded_year}
                                            onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                                            className="h-10 px-3 rounded-xl border-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Funding Stage</Label>
                                        <Select
                                            value={formData.stage}
                                            onValueChange={(v) => setFormData({ ...formData, stage: v })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white text-xs font-semibold">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STAGES.map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Business Model</Label>
                                        <Select
                                            value={formData.business_model}
                                            onValueChange={(v) => setFormData({ ...formData, business_model: v })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white text-xs font-semibold">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BUSINESS_MODELS.map(m => (
                                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Team Size</Label>
                                        <Select
                                            value={formData.team_size}
                                            onValueChange={(v) => setFormData({ ...formData, team_size: v })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white text-xs font-semibold">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TEAM_SIZES.map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sector / Industry</Label>
                                        <Select
                                            value={formData.sector}
                                            onValueChange={(v) => setFormData({ ...formData, sector: v })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white text-xs font-semibold">
                                                <SelectValue placeholder="Select Sector" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SECTORS.map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Industry Tags */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Industry Tags</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add a tag and press Enter"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                                className="h-10 px-3 rounded-xl border-zinc-200 flex-1"
                                            />
                                            <Button type="button" variant="outline" size="sm" className="h-10 w-10 rounded-xl text-xs flex items-center justify-center p-0" onClick={addTag}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {formData.industry_tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {formData.industry_tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-purple-100 cursor-pointer hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                                                        onClick={() => removeTag(tag)}
                                                    >
                                                        {tag}
                                                        <Trash2 className="h-2.5 w-2.5" />
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Founders Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <User className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                                    Founders & Leadership
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[9px] font-black uppercase tracking-wider rounded-lg gap-1.5 border-zinc-200"
                                onClick={addFounder}
                            >
                                <Plus className="h-3 w-3" />
                                Add Member
                            </Button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Primary founder field */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-purple-600/70 ml-1">Primary Founder</Label>
                                    <div className="relative group/input">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within/input:text-purple-600 transition-colors" />
                                        <Input
                                            placeholder="e.g. Deepinder Goyal"
                                            value={formData.founder_name}
                                            onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                                            className="h-10 pl-9 pr-3 rounded-xl border-zinc-200 focus-visible:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-purple-600/70 ml-1">LinkedIn Profile</Label>
                                    <div className="relative group/input">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within/input:text-purple-600 transition-colors" />
                                        <Input
                                            placeholder="https://linkedin.com/in/..."
                                            value={formData.founder_linkedin}
                                            onChange={(e) => setFormData({ ...formData, founder_linkedin: e.target.value })}
                                            className="h-10 pl-9 pr-3 rounded-xl border-zinc-200 focus-visible:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional founders */}
                            <AnimatePresence>
                                {formData.founders_data.map((founder, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 space-y-3 relative group/founder"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 text-zinc-300 hover:text-rose-500 opacity-0 group-hover/founder:opacity-100 transition-all"
                                            onClick={() => removeFounder(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                                <Input
                                                    value={founder.name}
                                                    onChange={(e) => updateFounder(idx, 'name', e.target.value)}
                                                    placeholder="John Doe"
                                                    className="h-9 px-3 rounded-xl border-zinc-200 bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Role</Label>
                                                <Input
                                                    value={founder.role}
                                                    onChange={(e) => updateFounder(idx, 'role', e.target.value)}
                                                    placeholder="Co-founder & CEO"
                                                    className="h-9 px-3 rounded-xl border-zinc-200 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">LinkedIn URL</Label>
                                            <Input
                                                value={founder.linkedin}
                                                onChange={(e) => updateFounder(idx, 'linkedin', e.target.value)}
                                                placeholder="https://linkedin.com/in/..."
                                                className="h-9 px-3 rounded-xl border-zinc-200 bg-white"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Journey Details Editor */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <PenTool className="h-3.5 w-3.5 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Journey Details</span>
                        </div>
                        <div className="p-0">
                            <RichTextEditor
                                content={formData.description}
                                onChange={(content) => setFormData({ ...formData, description: content })}
                                placeholder="Share the startup's journey..."
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Right Column — Status & SEO */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Dynamic Editable Table of Contents - Sidebar */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white group/toc relative">
                        <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <List className="h-3 w-3 text-purple-600" />
                                </div>
                                <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                                    Content Outline
                                </CardTitle>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-100">
                                        <Plus className="h-3.5 w-3.5 text-purple-600" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl border-zinc-100">
                                    <div className="px-2 py-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 mb-1">
                                        Insert Structure
                                    </div>
                                    {sectionTemplates.map((template) => (
                                        <DropdownMenuItem
                                            key={template.title}
                                            onClick={() => handleAddStandardSection(template)}
                                            className="rounded-lg py-2 cursor-pointer focus:bg-purple-50 focus:text-purple-700"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold">{template.title}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                    <div className="h-px bg-zinc-100 my-1" />
                                    <DropdownMenuItem
                                        onClick={handleAddEmptySection}
                                        className="rounded-lg py-2 cursor-pointer font-bold text-xs"
                                    >
                                        <Plus className="h-3 w-3 mr-2" /> Custom Section
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-5">
                            {tocItems.length > 0 ? (
                                <ol className="space-y-1.5">
                                    {tocItems.map((item) => (
                                        <li key={`${item.startIndex}-${item.id}`} className="flex items-center gap-2 group/item">
                                            <span className={cn(
                                                "text-[9px] font-black leading-none min-w-[20px] shrink-0",
                                                item.tag === 'h2' ? "text-purple-500/50" : "text-zinc-300 ml-1.5"
                                            )}>
                                                {item.tag === 'h2' ? `${item.id}.` : `•`}
                                            </span>
                                            <Input
                                                defaultValue={item.title}
                                                onBlur={(e) => handleRenameHeading(item.startIndex, item.fullMatch, item.title, e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        (e.target as HTMLInputElement).blur();
                                                    }
                                                }}
                                                className={cn(
                                                    "h-8 border-transparent bg-transparent hover:bg-zinc-50 focus:bg-white focus:border-zinc-200 rounded-lg px-2 transition-all flex-1",
                                                    item.tag === 'h2' ? "text-xs font-bold text-zinc-700" : "text-[11px] font-medium text-zinc-500"
                                                )}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteHeading(item.startIndex, item.fullMatch)}
                                                className="opacity-0 group-hover/item:opacity-100 h-6 w-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                                                title="Remove this section"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <div className="py-6 text-center border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50">
                                    <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-2">
                                        <Plus className="h-4 w-4 text-purple-500" />
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Outline Empty</p>
                                    <p className="text-[11px] text-zinc-500 mt-1">Add headers to format startup journey.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Unified Configuration Card */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Globe className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                                    Final Configuration
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-zinc-100">
                            {/* Visibility Section */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Eye className="h-3.5 w-3.5 text-zinc-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Visibility & Status</span>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v) => setFormData({ ...formData, status: v })}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl border-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="blocked">Blocked</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Featured Status</p>
                                        <p className="text-[9px] font-medium text-muted-foreground">Highlight in directory</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant={formData.is_featured ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                                        className={cn(
                                            "h-8 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                            formData.is_featured ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-muted-foreground border-zinc-200"
                                        )}
                                    >
                                        {formData.is_featured ? <Check className="h-3 w-3 mr-1" /> : null}
                                        {formData.is_featured ? "Featured" : "Regular"}
                                    </Button>
                                </div>
                            </div>

                            {/* SEO Section */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">SEO Meta Data</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">SEO Title</Label>
                                        <Input
                                            value={formData.meta_title}
                                            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                            placeholder="Search engine title..."
                                            className="h-9 px-3 rounded-xl border-zinc-200 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Meta Description</Label>
                                        <Textarea
                                            value={formData.meta_description}
                                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                            placeholder="Brief summary for search results..."
                                            className="min-h-[80px] px-3 py-2 rounded-xl border-zinc-200 bg-white resize-none text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Meta Keywords</Label>
                                        <Input
                                            value={formData.meta_keywords}
                                            onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                            placeholder="Keywords, separated, by, commas"
                                            className="h-9 px-3 rounded-xl border-zinc-200 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="admin-surface-compact p-6 border border-purple-200 bg-purple-50 shadow-lg shadow-purple-500/5"
                    >
                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        <span>Commit Venture</span>
                                    </div>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full h-10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-all"
                                onClick={() => router.push("/dashboard/startups")}
                            >
                                Discard Entries
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </form>
        </div>
    );
}
