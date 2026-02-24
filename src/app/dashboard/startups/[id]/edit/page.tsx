"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchAPI, startupsApi, categoriesApi, hubsApi, generateSEO } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    Save,
    Loader2,
    BookOpen,
    User,
    Tag,
    Eye,
    ExternalLink,
    Sparkles,
    Upload,
    Image as ImageIcon,
    X,
    Building,
    Edit,
    Plus,
    ChevronLeft,
    Globe,
    Zap,
    List,
    CheckCircle2,
    PenTool,
    Layout,
    FileText,
    MapPin,
    Calendar,
    Lightbulb,
    Trash2,
    MoreHorizontal,
    LayoutGrid
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSafeImageSrc } from "@/lib/images";
import { generateContent } from "@/lib/api";
import { getPromptTemplate, fillTemplate } from "@/lib/prompt-manager";

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

export default function StartupEditPage() {
    const router = useRouter();
    const params = useParams();
    const startupSlug = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>({});
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [startup, cats, hubs] = await Promise.all([
                    startupsApi.get(startupSlug),
                    categoriesApi.list(),
                    hubsApi.list()
                ]);

                fetchAPI("/media/").then(data => setMediaItems(Array.isArray(data) ? data : [])).catch(e => console.error(e));

                const rawFounders = Array.isArray(startup.founders_data) ? startup.founders_data : [];

                // If founders_data is empty but we have a primary founder_name, seed it in
                const seedFounders =
                    rawFounders.length === 0 && startup.founder_name
                        ? [{ name: startup.founder_name, role: "Founder", linkedin: startup.founder_linkedin || "", image: "" }]
                        : rawFounders;

                const processedStartup = {
                    ...startup,
                    category: typeof startup.category === 'object' ? startup.category?.id : startup.category,
                    city: typeof startup.city === 'object' ? startup.city?.id : startup.city,
                    stage: startup.funding_stage || startup.stage || "",
                    business_model: startup.business_model || "",
                    founded_year: startup.founded_year || "",
                    team_size: startup.team_size || "",
                    sector: startup.industry_tags && startup.industry_tags.length > 0 ? startup.industry_tags[0] : (startup.sector || ""),
                    industry_tags: Array.isArray(startup.industry_tags) ? startup.industry_tags : [],
                    thumbnail: startup.og_image || "",
                    meta_keywords: startup.meta_keywords || "",
                    image_alt: startup.og_image_alt || "",
                    founders_data: seedFounders,
                };
                setFormData(processedStartup);
                setCategories(cats);
                setCities(hubs);
            } catch (error) {
                console.error("Failed to load startup data", error);
                toast.error("Failed to load startup data");
                router.push("/dashboard/startups");
            } finally {
                setIsLoading(false);
            }
        };

        if (startupSlug) loadData();
    }, [startupSlug, router]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

    const sectionTemplates = [
        { title: "The Problem", placeholder: "Describe the problem this startup is solving..." },
        { title: "The Solution", placeholder: "Explain how the startup solves this problem..." },
        { title: "Founder Journey", placeholder: "Share the founder's background and journey..." },
        { title: "Revenue Model", placeholder: "Describe how the startup makes money..." },
        { title: "Traction & Growth", placeholder: "Share key metrics and growth milestones..." },
        { title: "Future Plans", placeholder: "What's next for this startup..." }
    ];

    const generateSlugFromText = (text: string): string => {
        const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'as', 'from', 'by'];
        return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').split(/\s+/).filter(word => word.length > 0 && !stopWords.includes(word)).slice(0, 8).join('-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    };

    const handleWriteWithAI = async () => {
        if (!formData.name) {
            toast.error("Please enter a startup name first!");
            return;
        }
        setIsGenerating(true);
        try {
            let template = await getPromptTemplate("Startup Journey Generator");
            if (!template) {
                template = "Write a compelling startup journey for a startup named {title}. Include sections for The Problem, The Solution, and Founder Journey. Use professional editorial tone.";
            }
            const prompt = fillTemplate(template, { title: formData.name });
            const result = await generateContent(prompt);
            if (result.content) {
                setFormData((prev: any) => ({ ...prev, description: result.content }));
                toast.success("✨ AI-generated content ready!");
            }
        } catch (err: any) {
            toast.error(`AI Error: ${err.message || "Failed to generate content"}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSlug = async () => {
        if (!formData.name) {
            toast.error("Enter startup name first!");
            return;
        }
        setIsGenerating(true);
        try {
            const template = await getPromptTemplate("Slug Generator");
            const prompt = fillTemplate(template || "Generate a clean URL slug for: {title}", { title: formData.name });
            const result = await generateContent(prompt);
            if (result.content) {
                setFormData((prev: any) => ({ ...prev, slug: generateSlugFromText(result.content) }));
                toast.success("✨ Slug generated!");
            }
        } catch (err) {
            toast.error("Failed to generate slug");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddStandardSection = (template: { title: string; placeholder: string }) => {
        const sectionHtml = `\n<h2 id="${template.title.toLowerCase().replace(/\s+/g, '-')}">${template.title}</h2>\n<p>${template.placeholder}</p>\n`;
        setFormData((prev: any) => ({ ...prev, description: (prev.description || "") + sectionHtml }));
    };

    const handleAddEmptySection = () => {
        const sectionHtml = `\n<h2>New Section</h2>\n<p>Start writing here...</p>\n`;
        setFormData((prev: any) => ({ ...prev, description: (prev.description || "") + sectionHtml }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateSEO = async () => {
        if (!formData.name || !formData.description) {
            toast.error("Please fill in Startup Name and Description first");
            return;
        }
        setIsGeneratingSEO(true);
        try {
            const data = await generateSEO({
                title: formData.name,
                description: formData.description,
                content: `Startup: ${formData.name}. Description: ${formData.description}. Founder: ${formData.founder_name || ''}. Website: ${formData.website_url || ''}`,
                type: 'startup'
            });
            if (data) {
                setFormData((prev: any) => ({
                    ...prev,
                    meta_title: data.meta_title || prev.meta_title,
                    meta_description: data.meta_description || prev.meta_description,
                    meta_keywords: data.keywords || data.meta_keywords || prev.meta_keywords,
                }));
                toast.success("SEO content generated!");
            }
        } catch (error) {
            toast.error("Failed to generate SEO content");
        } finally {
            setIsGeneratingSEO(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const addFounder = () => {
        setFormData((prev: any) => ({
            ...prev,
            founders_data: [...(prev.founders_data || []), { name: "", role: "", linkedin: "", image: "" }]
        }));
    };

    const removeFounder = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            founders_data: (prev.founders_data || []).filter((_: any, i: number) => i !== index)
        }));
    };

    const updateFounder = (index: number, field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            founders_data: (prev.founders_data || []).map((f: any, i: number) => i === index ? { ...f, [field]: value } : f)
        }));
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.industry_tags?.includes(tag)) {
            setFormData((prev: any) => ({
                ...prev,
                industry_tags: [...(prev.industry_tags || []), tag]
            }));
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev: any) => ({
            ...prev,
            industry_tags: (prev.industry_tags || []).filter((t: string) => t !== tag)
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const foundersList: any[] = formData.founders_data || [];
            const primaryFounder = foundersList[0];

            const cleanData = {
                name: formData.name,
                tagline: formData.tagline || "",
                description: formData.description,
                website_url: formData.website_url,
                // Keep primary founder fields in sync with founders_data[0]
                founder_name: primaryFounder?.name || formData.founder_name || "",
                founder_linkedin: primaryFounder?.linkedin || formData.founder_linkedin || "",
                founded_year: formData.founded_year ? parseInt(formData.founded_year.toString()) : undefined,
                funding_stage: formData.stage || "",
                business_model: formData.business_model || "",
                industry_tags: formData.industry_tags?.length > 0 ? formData.industry_tags : (formData.sector ? [formData.sector] : []),
                team_size: formData.team_size || "",
                founders_data: foundersList,
                is_featured: formData.is_featured,
                status: formData.status,
                category: formData.category,
                city: formData.city,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                meta_keywords: formData.meta_keywords || "",
                og_image: formData.thumbnail,
                og_image_alt: formData.image_alt || "",
                logo: formData.logo
            };

            await startupsApi.update(startupSlug, cleanData);
            toast.success("Startup updated successfully");
            router.push("/dashboard/startups");
        } catch (error) {
            toast.error("Failed to update startup");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-6 flex flex-col min-h-screen">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200 overflow-hidden shrink-0">
                            {formData.logo ? (
                                <img src={getSafeImageSrc(formData.logo)} alt="" className="h-full w-full object-contain p-1.5" />
                            ) : (
                                <Building className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Startups</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                                {formData.name || "Edit Startup"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push("/dashboard/startups")}
                            className="h-9 w-9 rounded-xl border border-zinc-200 hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm transition-all flex items-center justify-center"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </button>

                        <button
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_SITE_URL}/startups/${startupSlug}`, '_blank')}
                            className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <Eye className="h-3.5 w-3.5" /> Preview
                        </button>

                        {formData.website_url && (
                            <button
                                onClick={() => window.open(formData.website_url, '_blank')}
                                className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5"
                            >
                                <Globe className="h-3.5 w-3.5 text-blue-500" /> Visit Site
                            </button>
                        )}

                        <button
                            onClick={onSubmit}
                            disabled={isSaving}
                            className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                        >
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Startup Details Card */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                <CardTitle className="text-[10px] font-black flex items-center gap-2.5 text-zinc-500 uppercase tracking-widest">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <PenTool className="h-3 w-3 text-white" />
                                    </div>
                                    Startup Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5" />
                                            Headline
                                        </Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all"
                                            onClick={handleGenerateSlug}
                                        >
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Generate Slug
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Zomato, Zepto, etc."
                                        value={formData.name || ""}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="h-14 text-base font-bold rounded-xl bg-secondary border-border focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                        <Lightbulb className="h-3.5 w-3.5" />
                                        Excerpt (TL;DR)
                                    </Label>
                                    <Textarea
                                        placeholder="Brief summary that appears at the top of the startup..."
                                        value={formData.tagline || ""}
                                        onChange={(e) => handleChange("tagline", e.target.value)}
                                        className="min-h-[100px] text-sm rounded-xl bg-secondary border-border focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Startup Journey (Rich Editor) */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-[10px] font-black flex items-center gap-2.5 text-zinc-500 uppercase tracking-widest">
                                    <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                        <Layout className="h-3 w-3 text-white" />
                                    </div>
                                    Story Content
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-7 px-3 rounded-lg text-[9px] font-black bg-zinc-100 hover:bg-zinc-200 transition-all">
                                                <Plus className="h-3 w-3 mr-1.5" /> Insert Section
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl">
                                            {sectionTemplates.map((template) => (
                                                <DropdownMenuItem key={template.title} onClick={() => handleAddStandardSection(template)}>
                                                    {template.title}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuItem onClick={handleAddEmptySection}>Custom Section</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button onClick={handleWriteWithAI} disabled={isGenerating} className="h-7 px-3 rounded-lg text-[9px] font-black bg-purple-600 hover:bg-purple-700 text-white transition-all border-none">
                                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                                        AI Writer
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <RichTextEditor
                                    content={formData.description || ""}
                                    onChange={(content) => handleChange("description", content)}
                                    placeholder="Tell the full story..."
                                />
                            </CardContent>
                        </Card>

                        {/* Business & Growth */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center">
                                    <LayoutGrid className="h-3.5 w-3.5 text-white" />
                                </div>
                                <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Business & Growth</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Founded Year</Label>
                                        <Input
                                            type="number"
                                            placeholder="2024"
                                            value={formData.founded_year}
                                            onChange={(e) => handleChange("founded_year", e.target.value)}
                                            className="h-10 px-3 rounded-xl border-zinc-200 bg-secondary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Funding Stage</Label>
                                        <Select
                                            value={formData.stage}
                                            onValueChange={(v) => handleChange("stage", v)}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-secondary focus:bg-white transition-all text-xs font-semibold">
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
                                            onValueChange={(v) => handleChange("business_model", v)}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-secondary focus:bg-white transition-all text-xs font-semibold">
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
                                            onValueChange={(v) => handleChange("team_size", v)}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-secondary focus:bg-white transition-all text-xs font-semibold">
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
                                            onValueChange={(v) => handleChange("sector", v)}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-secondary focus:bg-white transition-all text-xs font-semibold">
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
                                                className="h-10 px-3 rounded-xl border-zinc-200 bg-secondary focus:bg-white transition-all flex-1 text-xs"
                                            />
                                            <Button type="button" variant="outline" size="sm" className="h-10 w-10 rounded-xl text-xs flex items-center justify-center p-0 border-zinc-200" onClick={addTag}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {formData.industry_tags && formData.industry_tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {formData.industry_tags.map((tag: string) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-purple-100 cursor-pointer hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                                                        onClick={() => removeTag(tag)}
                                                    >
                                                        {tag}
                                                        <X className="h-2.5 w-2.5" />
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leadership Team */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                                        <User className="h-3 w-3 text-white" />
                                    </div>
                                    <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Leadership Team</CardTitle>
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
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {formData.founders_data && formData.founders_data.length > 0 ? (
                                    <div className="space-y-4">
                                        {formData.founders_data.map((founder: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 space-y-4 relative group"
                                            >
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-7 w-7 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                                    onClick={() => removeFounder(idx)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
                                                        <Input
                                                            value={founder.name}
                                                            onChange={(e) => updateFounder(idx, 'name', e.target.value)}
                                                            placeholder="e.g. Deepinder Goyal"
                                                            className="h-9 px-3 rounded-xl border-zinc-200 bg-white text-xs"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground ml-1">Role / Designation</Label>
                                                        <Input
                                                            value={founder.role}
                                                            onChange={(e) => updateFounder(idx, 'role', e.target.value)}
                                                            placeholder="Founder & CEO"
                                                            className="h-9 px-3 rounded-xl border-zinc-200 bg-white text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground ml-1">LinkedIn Profile</Label>
                                                    <div className="relative">
                                                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-300" />
                                                        <Input
                                                            value={founder.linkedin}
                                                            onChange={(e) => updateFounder(idx, 'linkedin', e.target.value)}
                                                            placeholder="https://linkedin.com/in/..."
                                                            className="h-9 pl-8 pr-3 rounded-xl border-zinc-200 bg-white text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                                        <User className="h-8 w-8 text-zinc-200 mb-2" />
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No founders added</p>
                                        <Button variant="link" size="sm" onClick={addFounder} className="text-blue-600 font-bold text-[10px] uppercase">Add Primary Founder</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>


                        {/* Visuals */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                                <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center gap-2.5">
                                    <ImageIcon className="h-3.5 w-3.5 text-zinc-500" />
                                    <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Brand Logo</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                        className="h-24 w-24 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:border-purple-300 hover:bg-purple-50/20 transition-all mx-auto"
                                    >
                                        {formData.logo ? (
                                            <img src={getSafeImageSrc(formData.logo)} alt="Logo" className="h-full w-full object-contain p-3" />
                                        ) : (
                                            <Upload className="h-5 w-5 text-zinc-300 group-hover:text-purple-400 transition-colors" />
                                        )}
                                        <input id="logo-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e, "logo")} />
                                    </div>
                                    <Input
                                        placeholder="Logo URL..."
                                        value={formData.logo || ""}
                                        onChange={(e) => handleChange("logo", e.target.value)}
                                        className="h-9 rounded-xl bg-secondary border-border text-[10px] focus:bg-white transition-all"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                                <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center gap-2.5">
                                    <FileText className="h-3.5 w-3.5 text-zinc-500" />
                                    <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Narrative Thumb (OG)</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div
                                        onClick={() => document.getElementById('og-upload')?.click()}
                                        className="aspect-[16/9] w-full rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:border-purple-300 hover:bg-purple-50/20 transition-all"
                                    >
                                        {formData.thumbnail ? (
                                            <img src={getSafeImageSrc(formData.thumbnail)} alt="OG" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-zinc-300 group-hover:text-purple-400 transition-colors" />
                                        )}
                                        <input id="og-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e, "thumbnail")} />
                                    </div>
                                    <Input
                                        placeholder="OG Image URL..."
                                        value={formData.thumbnail || ""}
                                        onChange={(e) => handleChange("thumbnail", e.target.value)}
                                        className="h-9 rounded-xl bg-secondary border-border text-[10px] focus:bg-white transition-all"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* ── RIGHT SIDEBAR ── */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Publication Card */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-orange-500 flex items-center justify-center">
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                </div>
                                <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Publication</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Slug</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.slug || ""}
                                            onChange={(e) => handleChange("slug", e.target.value)}
                                            className="h-9 rounded-xl bg-secondary border-border text-[11px] font-bold transition-all focus:bg-white flex-1"
                                            placeholder="zomato-journey"
                                        />
                                        <Button onClick={handleGenerateSlug} variant="ghost" size="sm" className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 shrink-0">
                                            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Category</Label>
                                        <Select value={formData.category?.toString() || ""} onValueChange={(v) => handleChange("category", v)}>
                                            <SelectTrigger className="h-9 rounded-xl bg-secondary border-border text-[11px] font-bold">
                                                <SelectValue placeholder="Pick..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">City</Label>
                                        <Select value={formData.city?.toString() || ""} onValueChange={(v) => handleChange("city", v)}>
                                            <SelectTrigger className="h-9 rounded-xl bg-secondary border-border text-[11px] font-bold">
                                                <SelectValue placeholder="Pick..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Stage</Label>
                                    <Select value={formData.stage || ""} onValueChange={(v) => handleChange("stage", v)}>
                                        <SelectTrigger className="h-9 rounded-xl bg-secondary border-border text-[11px] font-bold">
                                            <SelectValue placeholder="Funding Stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["Bootstrapped", "Pre-Seed", "Seed", "Series A", "Series B+", "IPO", "Unicorn"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-zinc-600 capitalize">{formData.status}</span>
                                    </div>
                                    <Switch
                                        checked={formData.status === 'published'}
                                        onCheckedChange={(checked) => handleChange("status", checked ? 'published' : 'draft')}
                                        className="data-[state=checked]:bg-emerald-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* TOC Outline Sidebar */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <List className="h-3 w-3 text-white" />
                                </div>
                                <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Content Outline</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {(() => {
                                    const matches = [...(formData.description || "").matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)];
                                    if (matches.length === 0) return <p className="text-[10px] font-bold text-zinc-400 uppercase text-center py-4">No headings</p>;
                                    return (
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-zinc-400 border-l-2 border-purple-200">1. TL;DR (Auto)</div>
                                            {matches.map((m, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-zinc-600 border-l-2 border-zinc-100 italic">{i + 2}. {m[1].replace(/<[^>]*>/g, '').trim()}</div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        {/* SEO Features Sidebar */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-[10px] font-black flex items-center gap-2.5 text-zinc-500 uppercase tracking-widest">
                                    <div className="h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-white" />
                                    </div>
                                    SEO Metadata
                                </CardTitle>
                                <Button onClick={handleGenerateSEO} disabled={isGeneratingSEO} variant="ghost" className="h-7 px-2 rounded-lg text-[9px] font-black text-amber-600 hover:bg-amber-50">
                                    {isGeneratingSEO ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />} Auto
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Title</Label>
                                    <Input
                                        value={formData.meta_title || ""}
                                        onChange={(e) => handleChange("meta_title", e.target.value)}
                                        className="h-8 rounded-lg bg-secondary border-border text-[10px] focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Description</Label>
                                    <Textarea
                                        value={formData.meta_description || ""}
                                        onChange={(e) => handleChange("meta_description", e.target.value)}
                                        className="min-h-[60px] rounded-lg bg-secondary border-border text-[10px] p-2 resize-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Keywords</Label>
                                    <Input
                                        value={formData.meta_keywords || ""}
                                        onChange={(e) => handleChange("meta_keywords", e.target.value)}
                                        className="h-8 rounded-lg bg-secondary border-border text-[10px] focus:bg-white"
                                        placeholder="Keywords, separated, by, commas"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Featured</span>
                                    <Switch
                                        checked={formData.is_featured || false}
                                        onCheckedChange={(v) => handleChange("is_featured", v)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social & Web Card */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <ExternalLink className="h-3 w-3 text-white" />
                                </div>
                                <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Social & Web</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Website</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                                            <Input
                                                type="url"
                                                value={formData.website_url || ""}
                                                onChange={(e) => handleChange("website_url", e.target.value)}
                                                className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white pl-9 text-[11px] transition-all"
                                                placeholder="https://company.com"
                                            />
                                        </div>
                                        {formData.website_url && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(formData.website_url, '_blank')}
                                                className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 text-zinc-400 hover:text-blue-600 shrink-0"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Founder LinkedIn</Label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                                        <Input
                                            type="url"
                                            value={formData.founder_linkedin || ""}
                                            onChange={(e) => handleChange("founder_linkedin", e.target.value)}
                                            className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white pl-9 text-[11px] transition-all"
                                            placeholder="linkedin.com/in/user"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
