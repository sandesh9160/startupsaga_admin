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
                description: generatedDesc || prev.description,
                meta_title: seoResult.meta_title || `${formData.name} | Startup Directory`,
                meta_description: seoResult.meta_description || generatedDesc || ""
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
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/40 transition-all active:scale-95"
                    asChild
                >
                    <Link href="/dashboard/startups">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        New Startup
                    </h1>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                        Expand the ecosystem with a new venture
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column — Primary Data */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Basic Identity Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="p-4 border-b border-border/40 bg-secondary/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Company Identity</span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 px-3 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all text-[10px] font-bold uppercase tracking-wider"
                                onClick={handleGenerateContent}
                                disabled={isGenerating || !formData.name}
                            >
                                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                AI Assistance
                            </Button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Startup Name</Label>
                                    <Input
                                        placeholder="e.g. Acme Fintech"
                                        value={formData.name}
                                        onChange={(e) => {
                                            const newName = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                name: newName,
                                                slug: prev.slug || newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                                            }));
                                        }}
                                        className="h-10 px-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL Slug</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-4 p-0 text-[9px] font-bold text-primary hover:bg-transparent"
                                            onClick={() => setFormData({ ...formData, slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') })}
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">/startups/</div>
                                        <Input
                                            placeholder="acme-fintech"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="h-10 pl-16 pr-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10 font-medium"
                                            required
                                        />
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
                                            className="h-10 pl-9 pr-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10"
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

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description / Value Prop</Label>
                                <Textarea
                                    placeholder="Tell the world what they do..."
                                    className="min-h-[100px] px-3 py-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10 resize-none leading-relaxed transition-all"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Logo & OG Image */}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Logo</Label>
                                    <div className="relative h-16 w-16 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-zinc-100 transition-colors">
                                        {formData.logo ? (
                                            <img src={formData.logo} alt="" className="h-full w-full object-contain" />
                                        ) : (
                                            <Upload className="h-5 w-5 text-zinc-400" />
                                        )}
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "logo")} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">OG Image</Label>
                                    <div className="relative h-16 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-zinc-100 transition-colors">
                                        {formData.og_image ? (
                                            <img src={formData.og_image} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-5 w-5 text-zinc-400" />
                                        )}
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, "og_image")} />
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
                                        <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
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
                                        <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
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
                    </motion.div>

                    {/* Business Stats Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="p-4 border-b border-border/40 bg-secondary/10 flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Business Stats</span>
                        </div>
                        <div className="p-6 space-y-5">
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
                                        className="h-9 px-3 rounded-xl border-zinc-200 flex-1"
                                    />
                                    <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl text-xs" onClick={addTag}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                {formData.industry_tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {formData.industry_tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-primary/10 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
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
                    </motion.div>

                    {/* Founders Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="p-4 border-b border-border/40 bg-secondary/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Founders</span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[9px] font-black uppercase tracking-wider rounded-lg gap-1.5"
                                onClick={addFounder}
                            >
                                <Plus className="h-3 w-3" />
                                Add Founder
                            </Button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Legacy founder fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Primary Founder Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="e.g. Deepinder Goyal"
                                            value={formData.founder_name}
                                            onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                                            className="h-9 pl-9 pr-3 rounded-xl border-zinc-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Founder LinkedIn</Label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="https://linkedin.com/in/..."
                                            value={formData.founder_linkedin}
                                            onChange={(e) => setFormData({ ...formData, founder_linkedin: e.target.value })}
                                            className="h-9 pl-9 pr-3 rounded-xl border-zinc-200"
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
                                        className="p-4 rounded-2xl border border-zinc-100 bg-secondary/5 space-y-3 relative group"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => removeFounder(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                                <Input
                                                    value={founder.name}
                                                    onChange={(e) => updateFounder(idx, 'name', e.target.value)}
                                                    placeholder="John Doe"
                                                    className="h-9 px-3 rounded-xl border-zinc-200"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Role</Label>
                                                <Input
                                                    value={founder.role}
                                                    onChange={(e) => updateFounder(idx, 'role', e.target.value)}
                                                    placeholder="Co-founder & CEO"
                                                    className="h-9 px-3 rounded-xl border-zinc-200"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">LinkedIn URL</Label>
                                            <Input
                                                value={founder.linkedin}
                                                onChange={(e) => updateFounder(idx, 'linkedin', e.target.value)}
                                                placeholder="https://linkedin.com/in/..."
                                                className="h-9 px-3 rounded-xl border-zinc-200"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {formData.founders_data.length === 0 && (
                                <div className="text-center py-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50">
                                    <p className="text-xs font-bold text-zinc-400 mb-3 tracking-wide uppercase">No additional founders added</p>
                                    <Button type="button" variant="outline" size="sm" onClick={addFounder} className="h-8 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                        Click to add
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column — Status & SEO */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Publication Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="p-4 border-b border-border/40 bg-secondary/10 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Visibility Settings</span>
                        </div>
                        <div className="p-6 space-y-4">
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
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-secondary/5">
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
                                        formData.is_featured ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-muted-foreground"
                                    )}
                                >
                                    {formData.is_featured ? <Check className="h-3 w-3 mr-1" /> : null}
                                    {formData.is_featured ? "Featured" : "Regular"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* SEO Preview Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="admin-surface-compact overflow-hidden border border-border/40 shadow-sm"
                    >
                        <div className="p-4 border-b border-border/40 bg-secondary/10 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Search Engine Optimization</span>
                        </div>
                        <div className="p-6 space-y-4 text-[11px]">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">SEO Title</Label>
                                <Input
                                    value={formData.meta_title}
                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                    placeholder="Search engine title..."
                                    className="h-9 px-3 rounded-lg border-zinc-200 bg-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">SEO Description</Label>
                                <Textarea
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    placeholder="Search engine snippet..."
                                    className="min-h-[72px] px-3 py-2 rounded-lg border-zinc-200 bg-white resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Meta Keywords</Label>
                                <Input
                                    value={formData.meta_keywords}
                                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                    placeholder="startup, fintech, india..."
                                    className="h-9 px-3 rounded-lg border-zinc-200 bg-white"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="admin-surface-compact p-6 border border-primary/20 bg-primary/5 shadow-lg shadow-primary/5"
                    >
                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
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
                                className="w-full h-10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
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
