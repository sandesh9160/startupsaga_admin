"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
    Search,
    Save,
    X,
    Loader2,
    Sparkles,
    FileText,
    Target,
    Zap,
    Circle,
    CheckCircle2,
    Code2,
    Eye,
    LayoutGrid,
    MoreHorizontal,
    Trash2,
    Box,
    Terminal,
    Cpu,
    Command,
    BrainCircuit,
    Wand2,
    Plus,
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getPrompts, createPrompt, updatePrompt, deletePrompt } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
    { value: 'story_write', label: 'Story Writing', icon: FileText, color: 'text-indigo-600 bg-indigo-100 border-indigo-200' },
    { value: 'seo_gen', label: 'SEO Generation', icon: Sparkles, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
    { value: 'desc_gen', label: 'Descriptions', icon: Target, color: 'text-rose-600 bg-rose-100 border-rose-200' },
    { value: 'general', label: 'General', icon: Settings, color: 'text-amber-600 bg-amber-100 border-amber-200' },
];

const DEFAULT_PROMPTS = [
    {
        name: "Story Content Generator",
        category: "story_write",
        prompt_text: "Write an inspiring 800-word startup success story for: {title}. Include sections: The Problem, The Solution, Founder Journey, and Revenue Model. Use professional editorial tone.",
        is_active: true
    },
    {
        name: "Story SEO Generator",
        category: "seo_gen",
        prompt_text: 'Generate a compiled SEO meta title and meta description for a startup story titled "{title}".\nContent Snippet: {content}\n\nReturn strictly a JSON object with keys: "meta_title" and "meta_description".',
        is_active: true
    },
    {
        name: "Story Alt Text Generator",
        category: "desc_gen",
        prompt_text: 'Write a concise, descriptive alt text (max 15 words) for a cover image of a startup story titled "{title}". Focus on the subject matter or business context. Do not include "image of".',
        is_active: true
    },
    {
        name: "Slug Generator",
        category: "general",
        prompt_text: 'Generate a short, SEO-friendly URL slug (lowercase, hyphens only, max 5 words) for this title: "{title}". Return ONLY the slug, nothing else.',
        is_active: true
    },
    {
        name: "City SEO Generator",
        category: "seo_gen",
        prompt_text: 'Generate SEO metadata for a startup hub page for the city: {title}.\nDescription: {description}.\n\nReturn strictly a JSON object with keys: meta_title, meta_description, keywords.',
        is_active: true
    },
    {
        name: "City Description",
        category: "desc_gen",
        prompt_text: "Rewrite and enhance this city description for a startup ecosystem portal: {name}.\nCurrent description: {description}\n\nMake it professional, engaging, and highlight why it's a great place for startups. Use about 150-200 words.",
        is_active: true
    },
    {
        name: "City Alt Text",
        category: "desc_gen",
        prompt_text: 'Write a professional alt text for a cover image representing the startup ecosystem of {name}. Focus on the city skyline or innovation vibe. Max 15 words.',
        is_active: true
    }
];

const PROMPT_USAGE_MAP: Record<string, { file: string, function: string }> = {
    "Story Content Generator": { file: "admin/src/app/dashboard/stories/new/page.tsx", function: "handleWriteWithAI" },
    "Story SEO Generator": { file: "admin/src/app/dashboard/stories/new/page.tsx", function: "handleGenerateSEO" },
    "Story Alt Text Generator": { file: "admin/src/app/dashboard/stories/new/page.tsx", function: "handleGenerateAltText" },
    "Slug Generator": { file: "admin/src/app/dashboard/stories/new/page.tsx", function: "handleGenerateSlug" },
    "City SEO Generator": { file: "admin/src/lib/city-prompts.ts", function: "CitySEOGenerator" },
    "City Description": { file: "admin/src/lib/city-prompts.ts", function: "CityDescription" },
    "City Alt Text": { file: "admin/src/lib/city-prompts.ts", function: "CityAltText" }
};

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [mounted, setMounted] = useState(false);

    const loadPrompts = async () => {
        try {
            setIsLoading(true);
            const data = await getPrompts();
            setPrompts(data);
            if (data.length > 0 && !selectedPrompt) {
                setSelectedPrompt(data[0]);
                setEditForm({ ...data[0] });
            }
        } catch (error) {
            console.error("Failed to load prompts:", error);
            toast.error("Failed to load prompts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        loadPrompts();
    }, []);

    const filteredPrompts = prompts.filter(p =>
        (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (p.category?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (p.prompt_text?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const handleSelectPrompt = (prompt: any) => {
        setSelectedPrompt(prompt);
        setEditForm({ ...prompt });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!editForm.name) {
            toast.error("Prompt name is required");
            return;
        }

        try {
            setIsSaving(true);
            if (!editForm.id) {
                await createPrompt(editForm);
                toast.success("Prompt created!");
            } else {
                await updatePrompt(editForm.id, editForm);
                toast.success("Prompt saved!");
            }
            await loadPrompts();
        } catch (error: any) {
            toast.error(error.message || "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNew = () => {
        const newPrompt = {
            name: "New Prompt",
            category: "general",
            prompt_text: "",
            is_active: true
        };
        setEditForm(newPrompt);
        setSelectedPrompt(null);
        setIsEditing(true);
    };

    const handleDelete = async () => {
        if (!selectedPrompt || !confirm(`Delete "${selectedPrompt.name}"?`)) return;

        try {
            await deletePrompt(selectedPrompt.id);
            toast.success("Prompt deleted");
            await loadPrompts();
            setSelectedPrompt(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };

    const getCategoryInfo = (category: string) => {
        return CATEGORIES.find(c => c.value === category) || CATEGORIES[3];
    };

    const handleRestoreDefaults = async () => {
        if (!confirm("Restore missing system prompts?")) return;

        setIsLoading(true);
        try {
            let addedCount = 0;
            const existingNames = new Set(prompts.map((p: any) => p.name));

            for (const defaults of DEFAULT_PROMPTS) {
                if (!existingNames.has(defaults.name)) {
                    await createPrompt(defaults);
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                toast.success(`Restored ${addedCount} system prompts`);
                await loadPrompts();
            } else {
                toast.info("All system prompts already exist");
            }
        } catch (error: any) {
            console.error("Failed to restore defaults:", error);
            toast.error("Failed to restore default prompts");
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
            {/* Left Panel - Library View */}
            <div className="w-[360px] border-r border-indigo-100 bg-white flex flex-col z-10 shadow-[4px_0_24px_rgba(79,70,229,0.02)]">
                {/* Header */}
                <div className="p-4 border-b border-indigo-50 bg-gradient-to-br from-indigo-50/30 to-white space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h1 className="text-lg font-bold text-indigo-900 tracking-tight flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-600 shadow-md shadow-indigo-100">
                                    <BrainCircuit className="h-3.5 w-3.5 text-white" />
                                </div>
                                AI Prompts
                            </h1>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-7">Engine Library</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                onClick={handleNew}
                                variant="ghost"
                                className="h-7 w-7 p-0 rounded-lg hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-all"
                                title="New Prompt"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleRestoreDefaults}
                                variant="ghost"
                                className="h-7 w-7 p-0 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
                                title="Restore Defaults"
                            >
                                <Box className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-300 group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                            placeholder="Search instructions..."
                            className="pl-9 h-8 bg-indigo-50/20 border-indigo-100 focus:ring-2 focus:ring-indigo-500/5 focus:border-indigo-300 transition-all rounded-lg text-[11px] font-semibold text-indigo-900 placeholder:text-indigo-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 show-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-50">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Library Sync...</span>
                        </div>
                    ) : filteredPrompts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 opacity-50 p-6 text-center">
                            <Terminal className="h-6 w-6 text-indigo-200" />
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">No prompts found</span>
                        </div>
                    ) : (
                        <>
                            {filteredPrompts.map((prompt) => {
                                const categoryInfo = getCategoryInfo(prompt.category);
                                const CategoryIcon = categoryInfo.icon;
                                const isSelected = selectedPrompt?.id === prompt.id;

                                return (
                                    <motion.div
                                        key={prompt.id}
                                        onClick={() => handleSelectPrompt(prompt)}
                                        className={cn(
                                            "p-3 mx-1 rounded-xl cursor-pointer transition-all border group relative overflow-hidden",
                                            isSelected
                                                ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                                                : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100"
                                        )}
                                    >
                                        {isSelected && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-600 rounded-full" />}

                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                <div className={cn("p-1.5 rounded-lg border flex items-center justify-center shadow-sm", categoryInfo.color)}>
                                                    <CategoryIcon className="h-3 w-3" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={cn("font-bold text-[12px] truncate leading-tight transition-colors", isSelected ? "text-indigo-900" : "text-slate-800")}>
                                                        {prompt.name}
                                                    </span>
                                                    <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-md w-fit bg-slate-100/50", isSelected ? "text-indigo-500 bg-indigo-100/50" : "text-slate-400")}>
                                                        {categoryInfo.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 pt-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                                {prompt.is_active ? (
                                                    <Zap className="h-3 w-3 text-indigo-500 fill-indigo-500" />
                                                ) : (
                                                    <Circle className="h-3 w-3 text-slate-300" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="pl-9">
                                            <p className={cn("text-[10px] font-medium line-clamp-2 leading-tight italic", isSelected ? "text-indigo-600/60" : "text-slate-500")}>
                                                {prompt.prompt_text}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            <button
                                onClick={handleNew}
                                className="w-full mt-2 p-3 rounded-xl border border-dashed border-indigo-100 text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center gap-2 group"
                            >
                                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                    <Plus className="h-4 w-4" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">Create New Prompt</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel - Editor */}
            <div className="flex-1 flex flex-col bg-[#fafbff] h-full overflow-hidden relative">
                {/* Subtle background accent */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[120px] -z-0 pointer-events-none" />

                {(!editForm.name && !isEditing) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 relative z-10">
                        <div className="h-16 w-16 rounded-xl bg-indigo-50 border border-dashed border-indigo-200 flex items-center justify-center shadow-inner">
                            <Code2 className="h-6 w-6 text-indigo-300" />
                        </div>
                        <div className="text-center space-y-0.5">
                            <h3 className="text-base font-bold text-indigo-900">Select a Directive</h3>
                            <p className="text-[11px] font-medium text-indigo-400/80">Choose a component from the library to configure.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div className="h-14 px-6 border-b border-indigo-50 bg-white/80 backdrop-blur-md flex items-center justify-between shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-100">
                                    <Terminal className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Editor</span>
                                </div>
                                <div className="h-5 w-px bg-indigo-100" />
                                <span className="text-xs font-bold text-indigo-900 opacity-80">
                                    {editForm.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedPrompt && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleDelete}
                                        className="h-9 px-4 rounded-lg text-[10px] font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all uppercase tracking-wider"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="h-9 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 active:scale-95 transition-all"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="h-3.5 w-3.5 mr-2" />
                                            Update
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto relative z-10">
                            <div className="max-w-4xl mx-auto p-6 space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6 p-6 rounded-xl bg-white border border-indigo-50 shadow-[0_8px_30px_rgba(79,70,229,0.03)]">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 italic">Prompt Identity</Label>
                                            <Input
                                                value={editForm.name || ""}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                placeholder="e.g. Story Generation Engine"
                                                className="h-10 text-base font-bold bg-indigo-50/20 border-indigo-100 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 rounded-lg transition-all px-4 text-indigo-900 placeholder:text-indigo-200"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 italic">Instruction Class</Label>
                                                <Select
                                                    value={editForm.category || "general"}
                                                    onValueChange={(v) => setEditForm({ ...editForm, category: v })}
                                                >
                                                    <SelectTrigger className="h-10 bg-indigo-50/20 border-indigo-100 focus:bg-white focus:border-indigo-400 rounded-lg font-bold text-xs px-4 text-indigo-900 transition-all">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-indigo-100 shadow-xl p-2">
                                                        {CATEGORIES.map(cat => (
                                                            <SelectItem key={cat.value} value={cat.value} className="rounded-lg focus:bg-indigo-50 p-2.5 transition-colors">
                                                                <div className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-wider">
                                                                    <div className={cn("p-1.5 rounded-md shadow-sm", cat.color)}>
                                                                        <cat.icon className="h-3 w-3" />
                                                                    </div>
                                                                    {cat.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 italic">Status</Label>
                                                <div className="flex items-center h-10 px-4 border border-indigo-100 rounded-lg bg-indigo-50/20">
                                                    <Switch
                                                        checked={editForm.is_active ?? true}
                                                        onCheckedChange={(v) => setEditForm({ ...editForm, is_active: v })}
                                                        className="data-[state=checked]:bg-indigo-600"
                                                    />
                                                    <span className={cn(
                                                        "ml-4 text-[11px] font-black uppercase tracking-widest transition-all",
                                                        editForm.is_active ? "text-indigo-600" : "text-amber-500"
                                                    )}>
                                                        {editForm.is_active ? "Live" : "Standby"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Usage Context Section */}
                                    {editForm.name && PROMPT_USAGE_MAP[editForm.name] && (
                                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Cpu className="h-12 w-12" />
                                            </div>
                                            <div className="space-y-1 relative z-10">
                                                <div className="text-[9px] font-black text-indigo-100 uppercase tracking-widest flex items-center gap-1.5">
                                                    <FileText className="h-2.5 w-2.5" /> Implementation
                                                </div>
                                                <div className="text-[11px] font-mono font-bold break-all bg-indigo-700/50 p-2 rounded-lg border border-indigo-500">
                                                    {PROMPT_USAGE_MAP[editForm.name].file}
                                                </div>
                                            </div>
                                            <div className="space-y-1 relative z-10">
                                                <div className="text-[9px] font-black text-indigo-100 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Code2 className="h-2.5 w-2.5" /> Trigger
                                                </div>
                                                <div className="text-[11px] font-mono font-bold bg-indigo-700/50 p-2 rounded-lg border border-indigo-500">
                                                    {PROMPT_USAGE_MAP[editForm.name].function}()
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <Label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Command className="h-4 w-4" />
                                                Prompt Text
                                            </Label>
                                            <Badge variant="outline" className="text-[10px] h-6 px-3 font-black text-white bg-indigo-600 border-none rounded-md">
                                                {editForm.prompt_text?.length || 0} chars
                                            </Badge>
                                        </div>
                                        <div className="relative rounded-xl border border-indigo-100 shadow-xl bg-white overflow-hidden group focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-400 transition-all">
                                            <div className="absolute top-0 inset-x-0 h-10 bg-indigo-50/50 backdrop-blur-md border-b border-indigo-100 flex items-center px-4 justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1">
                                                        <div className="h-2 w-2 rounded-full bg-indigo-200" />
                                                        <div className="h-2 w-2 rounded-full bg-indigo-100" />
                                                    </div>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 ml-1">directive_node</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                    <span className="text-[9px] font-bold text-indigo-600/60 uppercase tracking-widest">Active</span>
                                                </div>
                                            </div>
                                            <Textarea
                                                value={editForm.prompt_text || ""}
                                                onChange={(e) => setEditForm({ ...editForm, prompt_text: e.target.value })}
                                                placeholder="Enter system instructions..."
                                                className="min-h-[500px] pt-14 pb-8 px-6 font-mono text-sm text-indigo-950 leading-relaxed border-none focus-visible:ring-0 resize-none bg-transparent selection:bg-indigo-100 selection:text-indigo-900 placeholder:text-indigo-200"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
