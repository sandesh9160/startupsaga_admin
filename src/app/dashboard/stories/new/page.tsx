"use client";

import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import { cn, stripHtml } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
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
    Eye,
    Globe,
    Image as ImageIcon,
    PenTool,
    Layout,
    CheckCircle2,
    Plus,
    FileText,
    MapPin,
    Tag,
    Calendar,
    Lightbulb,
    User,
    Trash2,
    Edit,
    List,
    Building2,
    MoreHorizontal
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { fetchAPI, generateContent, generateSEO, getSubmissionDetail, createStory, getStories, updateStory, getStoryById, updateSubmissionStatus, getStartups, getCategories, getHubs } from "@/lib/api";
import { Startup, Category, Hub, MediaItem, Submission } from "@/types";
import { getPromptTemplate, fillTemplate } from "@/lib/prompt-manager";
import { toast } from "sonner";
import { getSafeImageSrc } from "@/lib/images";

const FRONTEND_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type StoryStatus = "draft" | "published";
type StoryFormData = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    city: string;
    author: string;
    thumbnail: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    isFeatured: boolean;
    related_startup_slug?: string;
    image_alt?: string;
    og_image?: string;
    show_table_of_contents: boolean;
    status: StoryStatus;
};

function NewStoryPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const submissionId = searchParams.get('submission');
    const editSlug = searchParams.get('edit');
    const editIdParam = searchParams.get('editId');
    const sectionIdCounter = useRef(0);
    const [startups, setStartups] = useState<Startup[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [hubs, setHubs] = useState<Hub[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [isSlugSynced, setIsSlugSynced] = useState(true);
    const [sections, setSections] = useState<Array<{ id: string; title: string; content: string }>>([]);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [editingStoryId, setEditingStoryId] = useState<number | null>(null);
    const [formData, setFormData] = useState<StoryFormData>({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "Funding",
        city: "Mumbai",
        author: "",
        thumbnail: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        isFeatured: false,
        related_startup_slug: "",
        image_alt: "",
        og_image: "",
        show_table_of_contents: true,
        status: "draft"
    });

    // Local state to hold raw submission info for display
    const [submissionDetails, setSubmissionDetails] = useState<Submission | null>(null);

    const sectionTemplates = [
        { title: "The Problem", placeholder: "Describe the problem this startup is solving..." },
        { title: "The Solution", placeholder: "Explain how the startup solves this problem..." },
        { title: "Founder Journey", placeholder: "Share the founder's background and journey..." },
        { title: "Revenue Model", placeholder: "Describe how the startup makes money..." },
        { title: "Traction & Growth", placeholder: "Share key metrics and growth milestones..." },
        { title: "Future Plans", placeholder: "What's next for this startup..." }
    ];

    const addSection = (template: { title: string; placeholder: string }) => {
        sectionIdCounter.current += 1;
        const newSection = {
            id: `section-${sectionIdCounter.current}`,
            title: template.title,
            content: ""
        };
        setSections([...sections, newSection]);
    };

    const updateSection = (id: string, field: 'title' | 'content', value: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const generateContentFromSections = () => {
        let html = '';
        sections.forEach(section => {
            if (section.content.trim()) {
                html += `<h2>${section.title}</h2>\n<p>${section.content}</p>\n\n`;
            }
        });
        return html;
    };

    // Calculate TOC items for editing
    const headingRegex = /<(h[2-4])[^>]*>([\s\S]*?)<\/\1>/gi;
    const tocContent = formData.content || '';
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

        const currentContent = formData.content;
        // Verify we are still looking at the same thing
        if (currentContent.substring(startIndex, startIndex + fullMatch.length) !== fullMatch) {
            toast.error("Content synchronized, please try again");
            return;
        }

        const newFullMatch = fullMatch.replace(oldTitle, newTitle);
        const updatedContent =
            currentContent.slice(0, startIndex) +
            newFullMatch +
            currentContent.slice(startIndex + fullMatch.length);

        setFormData(prev => ({ ...prev, content: updatedContent }));
    };

    const handleDeleteHeading = (startIndex: number, fullMatch: string) => {
        const currentContent = formData.content;
        if (currentContent.substring(startIndex, startIndex + fullMatch.length) !== fullMatch) {
            toast.error("Content synchronized, please try again");
            return;
        }

        const endOfH2 = startIndex + fullMatch.length;
        const remainingAfter = currentContent.slice(endOfH2);

        // Find next heading of any level to define the section end
        const nextHeadingMatch = remainingAfter.match(/<(h[2-4])[^>]*>/i);
        const endOfSection = nextHeadingMatch
            ? endOfH2 + remainingAfter.indexOf(nextHeadingMatch[0])
            : currentContent.length;

        const updatedContent = currentContent.slice(0, startIndex) + currentContent.slice(endOfSection);
        setFormData(prev => ({ ...prev, content: updatedContent.trim() }));
        toast.success("Section removed");
    };

    const handleAddStandardSection = (template: { title: string; placeholder: string }) => {
        const sectionHtml = `\n<h2 id="${template.title.toLowerCase().replace(/\s+/g, '-')}">${template.title}</h2>\n<p>${template.placeholder}</p>\n`;
        setFormData(prev => ({
            ...prev,
            content: prev.content + sectionHtml
        }));
        toast.success(`Section "${template.title}" added`);
    };

    const handleAddEmptySection = () => {
        const sectionHtml = `\n<h2>New Section</h2>\n<p>Start writing here...</p>\n`;
        setFormData(prev => ({
            ...prev,
            content: prev.content + sectionHtml
        }));
    };

    const generateSlugFromText = (text: string): string => {
        // Common words to remove for better SEO slugs
        const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'as', 'from', 'by'];

        return text
            .toLowerCase()
            .trim()
            // Remove special characters except spaces and hyphens
            .replace(/[^\w\s-]/g, '')
            // Split into words and filter out stop words
            .split(/\s+/)
            .filter(word => word.length > 0 && !stopWords.includes(word))
            // Take first 8 words for reasonable slug length
            .slice(0, 8)
            .join('-')
            // Clean up any multiple hyphens
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Load existing story for editing
    // Load existing story for editing
    useEffect(() => {
        const loadStory = async () => {
            if (!editIdParam && !editSlug) return;

            setIsLoading(true);
            try {
                let story: any = null;

                if (editIdParam) {
                    const id = parseInt(editIdParam, 10);
                    story = await getStoryById(id);
                } else if (editSlug) {
                    // Fallback: try finding via slug (might miss drafts if API filters them)
                    // Ideally backend should provide getStoryBySlugAdmin
                    const stories = await getStories();
                    story = stories.find((s: any) => s.slug === editSlug);
                }

                if (story && !story.error) {
                    setEditingStoryId(story.id);
                    const status: StoryStatus = story.status === "published" ? "published" : "draft";
                    setFormData({
                        title: story.title || "",
                        slug: story.slug || "",
                        excerpt: story.excerpt || "",
                        content: story.content || "",
                        category: story.category || "Funding",
                        city: story.city || "Mumbai",
                        author: story.author || "",
                        thumbnail: story.thumbnail || "",
                        meta_title: story.meta_title || "",
                        meta_description: story.meta_description || "",
                        meta_keywords: story.meta_keywords || "",
                        isFeatured: story.isFeatured || false,
                        related_startup_slug: story.related_startup?.slug || "",
                        image_alt: story.image_alt || "",
                        og_image: story.og_image || "",
                        show_table_of_contents: story.show_table_of_contents ?? true,
                        status
                    });
                    setSlugManuallyEdited(true);
                    setIsSlugSynced(false);

                    // Load sections if they exist
                    if (story.sections && Array.isArray(story.sections)) {
                        setSections(story.sections);
                    }
                } else {
                    toast.error("Story not found");
                }
            } catch (err) {
                console.error("Error loading story:", err);
                toast.error("Failed to load story");
            } finally {
                setIsLoading(false);
            }
        };

        loadStory();
    }, [editSlug, editIdParam]);

    useEffect(() => {
        if (submissionId) {
            setIsLoading(true);
            getSubmissionDetail(parseInt(submissionId))
                .then((sub: any) => {
                    const titleFromSubmission = sub.startup_name || "";
                    setFormData(prev => ({
                        ...prev,
                        title: titleFromSubmission ? `${titleFromSubmission}: A Startup Journey` : "", // Admin style title
                        slug: generateSlugFromText(titleFromSubmission),
                        category: sub.category || "Funding",
                        city: sub.city || "Mumbai",
                        excerpt: sub.excerpt || sub.short_description || sub.description || "",
                        content: sub.content || sub.full_story || sub.story || sub.description || "",
                        author: prev.author || sub.founder_name || "Editorial Team",
                        meta_title: titleFromSubmission ? `How ${titleFromSubmission} is Revolutionizing ${sub.category || 'their Industry'}` : "",
                        thumbnail: sub.thumbnail || sub.logo || sub.logo_url || prev.thumbnail || "",
                        og_image: sub.og_image || "",
                        related_startup_slug: sub.startup_name ? sub.startup_name.toLowerCase().replace(/\s+/g, '-') : ""
                    }));
                    // store submission details for UI (if needed later)
                    setSubmissionDetails(sub);
                    toast.info("Submission data loaded as reference in the sidebar.");
                })
                .catch((err: any) => console.error("Error preloading submission", err))
                .finally(() => setIsLoading(false));
        }
    }, [submissionId]);


    useEffect(() => {
        getStartups().then(data => setStartups(data)).catch((err) => console.error("Failed to load startups", err));
        getCategories().then(data => setCategories(data)).catch((err) => console.error("Failed to load categories", err));
        getHubs().then(data => setHubs(data)).catch((err) => console.error("Failed to load hubs", err));
        fetchAPI("/media/").then(data => setMediaItems(Array.isArray(data) ? data : [])).catch((err) => console.error("Failed to load media", err));
    }, []);

    const handleWriteWithAI = async () => {
        if (!formData.title) {
            toast.error("Please enter a story title first!");
            return;
        }
        setIsGenerating(true);
        console.log("Starting AI content generation for:", formData.title);

        try {
            let template = await getPromptTemplate("Story Content Generator");
            const prompt = fillTemplate(template, { title: formData.title });

            console.log("Sending prompt to AI:", prompt.substring(0, 100) + "...");

            const result = await generateContent(prompt);
            console.log("AI Response received:", result);

            // Check for error response from backend
            if (result.error) {
                console.error("AI Error:", result.error);
                toast.error(`AI Error: ${result.error}`);
                return;
            }

            if (result.content) {
                console.log("Content generated, length:", result.content.length);
                setFormData(prev => ({ ...prev, content: result.content }));
                toast.success("AI-generated content ready!");
            } else {
                console.warn("No content in response:", result);
                toast.error("AI returned empty response. Please try again.");
            }
        } catch (err: any) {
            console.error("Content Generation Error:", err);
            const errorMessage = err.message || String(err);
            toast.error(`Failed to generate content: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSEO = async () => {
        if (!formData.title) {
            toast.error("Please enter a title first!");
            return;
        }
        const cleanContent = stripHtml(formData.content || "");
        setIsGenerating(true);
        console.log("Starting SEO generation for:", formData.title);

        try {
            // Check for custom SEO prompt
            const template = await getPromptTemplate("Story SEO Generator");

            if (template) {
                // Use custom prompt via generateContent
                const prompt = fillTemplate(template, {
                    title: formData.title,
                    description: formData.excerpt || "",
                    content: cleanContent || formData.content || "",
                    type: "story"
                }) + "\n\nReturn the result strictly as a JSON object with keys: meta_title, meta_description, meta_keywords, image_alt. The meta_description MUST BE 160 characters OR LESS.";

                console.log("Sending custom SEO prompt:", prompt);
                const result = await generateContent(prompt);

                if (result.content) {
                    try {
                        const jsonStart = result.content.indexOf('{');
                        const jsonEnd = result.content.lastIndexOf('}') + 1;
                        const jsonStr = result.content.slice(jsonStart, jsonEnd);
                        const parsed = JSON.parse(jsonStr);

                        if (parsed.meta_title && parsed.meta_description) {
                            setFormData(prev => ({
                                ...prev,
                                meta_title: parsed.meta_title,
                                meta_description: parsed.meta_description?.slice(0, 160),
                                meta_keywords: parsed.meta_keywords || parsed.keywords || prev.meta_keywords,
                                image_alt: parsed.image_alt || prev.image_alt
                            }));
                            toast.success("Custom SEO metadata generated!");
                        } else {
                            throw new Error("Invalid JSON structure");
                        }
                    } catch (e) {
                        console.error("Failed to parse custom SEO response", e);
                        toast.error("AI returned invalid format. Using standard generator...");
                        // Fallback to standard
                        const requestData = {
                            title: formData.title,
                            description: formData.excerpt || "",
                            content: cleanContent || formData.content || "",
                            type: "story"
                        };
                        const fallbackResult = await generateSEO(requestData);
                        if (fallbackResult.meta_title) {
                            setFormData(prev => ({
                                ...prev,
                                meta_title: fallbackResult.meta_title,
                                meta_description: fallbackResult.meta_description?.slice(0, 160),
                                meta_keywords: fallbackResult.meta_keywords || fallbackResult.keywords || prev.meta_keywords,
                                image_alt: fallbackResult.image_alt || prev.image_alt
                            }));
                            toast.success("SEO metadata generated!");
                        }
                    }
                }
            } else {
                // Use standard backend SEO
                const requestData = {
                    title: formData.title,
                    description: formData.excerpt || "",
                    content: cleanContent || formData.content || "",
                    type: "story"
                };
                console.log("Sending SEO request:", requestData);

                const result = await generateSEO(requestData);
                console.log("SEO Response received:", result);

                if (result.error) {
                    console.error("SEO Error:", result.error);
                    toast.error(`AI Error: ${result.error}`);
                } else if (result.meta_title && result.meta_description) {
                    console.log("SEO metadata generated successfully");
                    setFormData(prev => ({
                        ...prev,
                        meta_title: result.meta_title,
                        meta_description: result.meta_description?.slice(0, 160),
                        meta_keywords: result.meta_keywords || result.keywords || prev.meta_keywords,
                        image_alt: result.image_alt || prev.image_alt
                    }));
                    toast.success("SEO metadata generated!");
                } else {
                    console.warn("Incomplete SEO data:", result);
                    toast.error("AI returned incomplete data. Please try again.");
                }
            }
        } catch (err: any) {
            console.error("SEO Generation Error:", err);
            const errorMessage = err.message || String(err);
            toast.error(`Failed to generate SEO: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAltText = async () => {
        if (!formData.title) {
            toast.error("Please enter a title first!");
            return;
        }
        setIsGenerating(true);
        console.log("Starting alt text generation for:", formData.title);

        try {
            const template = await getPromptTemplate("Story Alt Text Generator");
            const prompt = fillTemplate(template, { title: formData.title });

            const result = await generateContent(prompt);
            console.log("Alt Text Response received:", result);

            if (result.error) {
                console.error("Alt Text Error:", result.error);
                toast.error(`AI Error: ${result.error}`);
            } else if (result.content) {
                let altText = result.content.replace(/^["']|["']$/g, '');
                console.log("Generated alt text:", altText);
                setFormData(prev => ({ ...prev, image_alt: altText }));
                toast.success("Alt text generated!");
            } else {
                console.warn("No content in alt text response");
                toast.error("Failed to generate alt text.");
            }
        } catch (err: any) {
            console.error("Alt Text Generation Error:", err);
            toast.error(`Failed to generate alt text: ${err.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSlug = async () => {
        if (!formData.title) {
            toast.error("Please enter a title first!");
            return;
        }
        setIsGenerating(true);
        console.log("Starting slug generation for:", formData.title);

        try {
            const template = await getPromptTemplate("Slug Generator");
            const prompt = fillTemplate(template, { title: formData.title });

            const result = await generateContent(prompt);
            console.log("Slug Response received:", result);

            if (result.error) {
                console.error("Slug Error:", result.error);
                toast.error(`AI Error: ${result.error}`);
                return;
            }

            if (result.content) {
                const cleanSlug = generateSlugFromText(result.content);
                console.log("✅ Generated slug:", cleanSlug);
                setFormData({ ...formData, slug: cleanSlug });
                setSlugManuallyEdited(true);
                toast.success("✨ Slug generated!");
            } else {
                console.warn("⚠️ No content in slug response");
                toast.error("Failed to generate slug.");
            }
        } catch (err: any) {
            console.error("❌ Slug Generation Error:", err);
            const errorMessage = err.message || String(err);
            toast.error(`Failed to generate slug: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (targetStatus: StoryStatus) => {
        // Validation
        if (!formData.title.trim()) {
            toast.error("Please enter a story title!");
            return;
        }
        if (!formData.content.trim()) {
            toast.error("Please add content to your story!");
            return;
        }
        if (!formData.slug.trim()) {
            toast.error("Please provide a URL slug!");
            return;
        }

        // Prevent duplicate submissions
        if (isPublishing) {
            console.warn("Already saving, ignoring duplicate request");
            return;
        }

        setIsPublishing(true);

        // Debug logging
        console.log("📝 Saving Story:", {
            mode: editingStoryId ? 'UPDATE' : 'CREATE',
            storyId: editingStoryId,
            title: formData.title,
            slug: formData.slug,
            status: targetStatus
        });

        try {
            const storyData: any = {
                ...formData,
                related_startup_slug: formData.related_startup_slug || undefined,
                sections: sections.length > 0 ? sections : undefined,
                status: targetStatus
            };

            let result;
            if (editingStoryId) {
                // Update existing story
                console.log(`Updating story ID: ${editingStoryId}`);
                result = await updateStory(editingStoryId, storyData);
                console.log("Story updated:", result);
                toast.success(targetStatus === 'published' ? " Story published!" : "Draft saved!");
            } else {
                // Create new story
                console.log("Creating new story");
                result = await createStory(storyData);
                console.log("Story created:", result);
                toast.success(targetStatus === 'published' ? " Story published!" : "Draft saved!");
            }

            // Wait a brief moment before redirecting
            setTimeout(() => {
                router.push("/dashboard/stories");
            }, 500);
        } catch (err: any) {
            console.error("Save Error:", err);
            toast.error(err.message || "Failed to save story.");
            setIsPublishing(false); // Re-enable on error
        }
    };


    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-screen">
                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <PenTool className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Stories</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                                {editingStoryId ? "Edit Story" : "New Story"}
                            </h1>
                        </div>
                    </div>

                    {/* Format Toggle */}
                    <div className="hidden lg:flex p-1 bg-zinc-200/50 rounded-lg shrink-0 items-center">
                        <div className="px-5 py-1.5 text-xs font-bold rounded-md bg-white text-zinc-900 shadow-sm flex items-center gap-2">
                            <PenTool className="h-3 w-3" /> Blog Post
                        </div>
                        <Link href={submissionId ? `/dashboard/startups/new?submission=${submissionId}` : `/dashboard/startups/new`} className="px-5 py-1.5 text-xs font-bold rounded-md text-zinc-500 hover:text-zinc-700 transition-all flex items-center gap-2">
                            <Building2 className="h-3 w-3" /> Startup Journey
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push("/dashboard/stories")}
                            className="h-9 w-9 rounded-xl border border-zinc-200 hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm transition-all flex items-center justify-center"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </button>

                        <button
                            onClick={() => {
                                if (formData.slug) {
                                    window.open(`${FRONTEND_URL}/stories/${formData.slug}`, '_blank');
                                } else {
                                    toast.error("Slug required for preview");
                                }
                            }}
                            className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <Eye className="h-3.5 w-3.5" /> Preview
                        </button>

                        <button
                            onClick={() => handleSave('draft')}
                            disabled={isPublishing}
                            className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5"
                        >
                            {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Save Draft
                        </button>

                        <button
                            onClick={() => handleSave('published')}
                            disabled={isPublishing}
                            className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                        >
                            {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                            {isPublishing ? "Saving..." : (editingStoryId && formData.status === 'published' ? 'Update' : 'Publish')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Story Details */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                <CardTitle className="text-[10px] font-black flex items-center gap-2.5 text-zinc-500 uppercase tracking-widest">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <PenTool className="h-3 w-3 text-white" />
                                    </div>
                                    Story Details
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
                                            onClick={() => {
                                                if (!formData.title) {
                                                    toast.error("Enter a title first");
                                                    return;
                                                }
                                                const newSlug = generateSlugFromText(formData.title);
                                                setFormData(prev => ({ ...prev, slug: newSlug }));
                                                setSlugManuallyEdited(true);
                                                toast.success("Slug generated from headline");
                                            }}
                                        >
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Generate Slug
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="e.g., Zepto Raises $665M, Becomes India&apos;s Fastest Growing Unicorn"
                                        value={formData.title || ""}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                title: newTitle,
                                                slug: isSlugSynced ? generateSlugFromText(newTitle) : prev.slug
                                            }));
                                        }}
                                        className="h-14 text-base font-bold rounded-xl bg-secondary border-border focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                        <Lightbulb className="h-3.5 w-3.5" />
                                        Excerpt (TL;DR)
                                    </Label>
                                    <Textarea
                                        placeholder="A brief summary (1-3 sentences) used for the 'Quick Highlights' box and automatically added to the story's Table of Contents."
                                        value={formData.excerpt || ""}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="min-h-[100px] text-sm rounded-xl bg-secondary border-border focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                                <Globe className="h-3.5 w-3.5" />
                                                URL Slug
                                            </Label>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newState = !isSlugSynced;
                                                        setIsSlugSynced(newState);
                                                        if (newState && formData.title) {
                                                            setFormData(prev => ({ ...prev, slug: generateSlugFromText(formData.title) }));
                                                        }
                                                    }}
                                                    className={cn(
                                                        "h-7 px-2 text-[10px] font-bold rounded-lg transition-all",
                                                        isSlugSynced ? "text-emerald-600 bg-emerald-50" : "text-zinc-400 hover:text-zinc-600"
                                                    )}
                                                    title={isSlugSynced ? "Slug is synced with title" : "Click to sync slug with title"}
                                                >
                                                    {isSlugSynced ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                                                    {isSlugSynced ? "Synced" : "Sync"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleGenerateSlug}
                                                    disabled={isGenerating}
                                                    className="h-7 px-3 text-[10px] font-bold text-primary hover:text-primary/90 hover:bg-indigo-50 rounded-lg"
                                                >
                                                    {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                                    AI Slug
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">/stories/</div>
                                            <Input
                                                placeholder="zepto-raises-665m"
                                                value={formData.slug}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, slug: e.target.value });
                                                    setSlugManuallyEdited(true);
                                                    setIsSlugSynced(false);
                                                }}
                                                className="h-11 pl-[72px] rounded-xl bg-secondary border-border text-xs font-bold transition-all focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <Tag className="h-3.5 w-3.5" />
                                            Category
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl bg-secondary border-border text-xs font-bold transition-all focus:bg-white">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.slug} value={cat.name}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5" />
                                            City/Location
                                        </Label>
                                        <Select
                                            value={formData.city}
                                            onValueChange={(val) => setFormData({ ...formData, city: val })}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl bg-secondary border-border text-xs font-bold transition-all focus:bg-white">
                                                <SelectValue placeholder="Select City" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hubs.map((hub) => (
                                                    <SelectItem key={hub.slug} value={hub.name}>
                                                        {hub.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <User className="h-3.5 w-3.5" />
                                            Author Name
                                        </Label>
                                        <Input
                                            placeholder="e.g., Priya Sharma, Rahul Verma"
                                            value={formData.author || ""}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            className="h-11 rounded-xl bg-secondary border-border text-xs font-bold transition-all focus:bg-white"
                                        />
                                    </div>
                                </div>


                            </CardContent>
                        </Card>

                        {/* Compact Editor Card */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-[10px] font-black flex items-center gap-2.5 text-zinc-500 uppercase tracking-widest">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <Layout className="h-3 w-3 text-white" />
                                    </div>
                                    Story Content
                                </CardTitle>
                                <Button
                                    onClick={handleWriteWithAI}
                                    disabled={isGenerating}
                                    className="h-7 px-3 rounded-lg text-[9px] font-black bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all border-none"
                                >
                                    {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                                    AI Writer
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                    placeholder="Start writing..."
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
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
                                            <Plus className="h-3 w-3 mr-2" /> Custom Story Section
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
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">No sections yet</p>
                                        <p className="text-[9px] text-zinc-400 mt-1">
                                            Click [+] above to add a story section
                                        </p>
                                    </div>
                                )}
                                <div className="mt-4 pt-4 border-t border-zinc-50">
                                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                                        Headings found in your content will appear here for quick management.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>



                        {submissionDetails && (
                            <Card className="border-blue-200/60 shadow-sm rounded-2xl overflow-hidden bg-blue-50/50">
                                <CardHeader className="p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
                                    <CardTitle className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4" /> Submission Source
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white border border-blue-100 flex items-center justify-center p-2 shadow-sm">
                                            {submissionDetails.logo ? (
                                                <img src={getSafeImageSrc(submissionDetails.logo)} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <Building2 className="h-6 w-6 text-blue-300" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-blue-900">{submissionDetails.startup_name}</h4>
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{submissionDetails.category}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Founder</Label>
                                                <div className="text-[11px] font-bold text-blue-800">{submissionDetails.founder_name}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Email</Label>
                                                <div className="text-[11px] font-bold text-blue-800 truncate" title={submissionDetails.email}>{submissionDetails.email}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Website</Label>
                                            <div className="text-[11px] font-bold text-blue-600 truncate underline cursor-pointer hover:text-blue-800 transition-colors">
                                                <a href={submissionDetails.website} target="_blank" rel="noopener noreferrer">{submissionDetails.website || '—'}</a>
                                            </div>
                                        </div>
                                        {submissionDetails.description && (
                                            <div className="bg-white p-3 rounded-xl border border-blue-100/50 shadow-sm">
                                                <Label className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1 block">Quick Pitch</Label>
                                                <p className="text-[11px] font-medium text-blue-700 leading-relaxed max-h-20 overflow-y-auto">
                                                    {submissionDetails.description}
                                                </p>
                                            </div>
                                        )}
                                        {submissionDetails.full_story && (
                                            <div className="bg-white p-3 rounded-xl border border-blue-100/50 shadow-sm">
                                                <Label className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1 block">Full Story</Label>
                                                <p className="text-[11px] font-medium text-blue-700 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                                                    {submissionDetails.full_story}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {/* Cover Image */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                <CardTitle className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon className="h-3.5 w-3.5" /> Cover Image
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-4">
                                    <div
                                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                                        className="aspect-video w-full rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all"
                                    >
                                        {formData.thumbnail ? (
                                            <>
                                                <img src={getSafeImageSrc(formData.thumbnail)} alt="Cover" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 opacity-50 group-hover:opacity-100 group-hover:text-indigo-600 transition-all">
                                                <div className="h-12 w-12 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-zinc-200 group-hover:border-indigo-300">
                                                    <Plus className="h-6 w-6" />
                                                </div>
                                                <span className="text-xs font-bold">Add Cover Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pick from Media Library</Label>
                                            <Link href="/dashboard/media" target="_blank" className="text-[9px] text-purple-600 font-bold hover:underline flex items-center gap-1">
                                                <Plus size={8} /> Open Library
                                            </Link>
                                        </div>
                                        <select
                                            className="w-full h-10 rounded-xl border border-zinc-100 bg-zinc-50 px-3 text-xs font-bold text-zinc-700 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-indigo-500/10"
                                            value={formData.thumbnail || ""}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                        >
                                            <option value="">— Choose an asset —</option>
                                            {mediaItems.map((m: any) => (
                                                <option key={m.id} value={m.url}>{m.title || m.url || "Untitled"}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Direct URL / Upload</Label>
                                        <input
                                            id="thumbnail-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, thumbnail: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <Input
                                            placeholder="Or paste cover URL (WebP, PNG, JPG)..."
                                            value={formData.thumbnail || ""}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            className="h-10 rounded-xl bg-secondary border-border text-[11px] font-bold focus:bg-white"
                                        />
                                    </div>

                                    {/* Social Preview / OG Image */}
                                    <div className="space-y-4 pt-4 border-t border-zinc-100/50">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Social Card (OG Image)</Label>
                                        <div
                                            onClick={() => document.getElementById('og-upload')?.click()}
                                            className="aspect-[1.91/1] w-full rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:bg-emerald-50/30 hover:border-emerald-300 transition-all"
                                        >
                                            {formData.og_image ? (
                                                <>
                                                    <img src={getSafeImageSrc(formData.og_image)} alt="OG Preview" className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-[9px] font-black uppercase tracking-widest bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">Change OG Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 transition-all">
                                                    <ImageIcon className="h-6 w-6 text-zinc-400" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Upload social image</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id="og-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, og_image: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <Input
                                            placeholder="OG Image URL (WebP/PNG)..."
                                            value={formData.og_image || ""}
                                            onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                                            className="h-10 rounded-xl bg-secondary border-border text-[10px] font-bold focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Publication Status */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                <CardTitle className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" /> Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'draft' })}
                                        className={cn(
                                            "relative h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 group",
                                            formData.status === 'draft'
                                                ? "border-amber-500 bg-amber-50 shadow-lg shadow-amber-100"
                                                : "border-zinc-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                                        )}
                                    >
                                        <Edit className={cn(
                                            "h-5 w-5 transition-colors",
                                            formData.status === 'draft' ? "text-amber-600" : "text-zinc-400 group-hover:text-amber-500"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-wide transition-colors",
                                            formData.status === 'draft' ? "text-amber-700" : "text-zinc-500 group-hover:text-amber-600"
                                        )}>
                                            Draft
                                        </span>
                                        {formData.status === 'draft' && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'published' })}
                                        className={cn(
                                            "relative h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 group",
                                            formData.status === 'published'
                                                ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                                                : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"
                                        )}
                                    >
                                        <Globe className={cn(
                                            "h-5 w-5 transition-colors",
                                            formData.status === 'published' ? "text-emerald-600" : "text-zinc-400 group-hover:text-emerald-500"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-wide transition-colors",
                                            formData.status === 'published' ? "text-emerald-700" : "text-zinc-500 group-hover:text-emerald-600"
                                        )}>
                                            Published
                                        </span>
                                        {formData.status === 'published' && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-medium text-center pt-1">
                                    {formData.status === 'draft'
                                        ? "Draft stories are only visible in the admin panel"
                                        : "Published stories are visible on the public website"}
                                </p>
                            </CardContent>
                        </Card>

                        {/* SEO Metadata */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" /> SEO Settings
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateSEO}
                                    disabled={isGenerating}
                                    className="h-6 gap-1 px-2 rounded-lg border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all text-[8px] font-bold uppercase tracking-wider"
                                >
                                    {isGenerating ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Sparkles className="h-2.5 w-2.5" />}
                                    AI Rewrite
                                </Button>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Title</Label>
                                    <Input
                                        value={formData.meta_title || ""}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        className="h-10 text-xs font-bold rounded-xl border-border bg-secondary focus:bg-white"
                                        placeholder="SEO-optimized title (max 60 chars)"
                                    />
                                    <div className="flex justify-end">
                                        <span className={cn("text-[9px] font-bold", formData.meta_title.length > 60 ? "text-rose-500" : "text-zinc-300")}>
                                            {formData.meta_title.length}/60
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Description</Label>
                                    <Textarea
                                        className="min-h-[90px] text-xs font-bold rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white resize-none"
                                        value={formData.meta_description || ""}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        placeholder="SEO-optimized description (max 160 chars)"
                                    />
                                    <div className="flex justify-end">
                                        <span className={cn("text-[9px] font-bold", formData.meta_description.length > 160 ? "text-rose-500" : "text-zinc-300")}>
                                            {formData.meta_description.length}/160
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Keywords</Label>
                                    <Input
                                        value={formData.meta_keywords || ""}
                                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                        className="h-10 text-xs font-bold rounded-xl border-border bg-secondary focus:bg-white"
                                        placeholder="Keywords, separated, by, commas"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Image Alt Text</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleGenerateAltText}
                                            disabled={isGenerating}
                                            className="h-5 px-1.5 text-[8px] font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-all"
                                        >
                                            {isGenerating ? <Loader2 className="h-2 w-2 animate-spin" /> : <Sparkles className="h-2 w-2 mr-1" />}
                                            AI Generate
                                        </Button>
                                    </div>
                                    <Input
                                        value={formData.image_alt || ""}
                                        onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                                        className="h-10 text-xs font-bold rounded-xl border-border bg-secondary focus:bg-white"
                                        placeholder="Descriptive alt text for featured image"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Publishing Options */}
                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardContent className="p-5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-zinc-900">Featured Story</div>
                                        <div className="text-[11px] text-zinc-500 font-medium">Highlight on homepage</div>
                                    </div>
                                    <Switch
                                        checked={formData.isFeatured}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                                        className="data-[state=checked]:bg-indigo-600 transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-zinc-900">Table of Contents</div>
                                        <div className="text-[11px] text-zinc-500 font-medium">Show automated TOC on page</div>
                                    </div>
                                    <Switch
                                        checked={formData.show_table_of_contents}
                                        onCheckedChange={(checked) => setFormData({ ...formData, show_table_of_contents: checked })}
                                        className="data-[state=checked]:bg-emerald-600 transition-all"
                                    />
                                </div>
                                <div className="pt-4 border-t border-zinc-100">
                                    <div className="flex items-center gap-3 justify-center text-xs font-bold text-emerald-600 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                                        <CheckCircle2 className="h-4 w-4" /> Ready to Publish
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

export default function NewStoryPage() {
    return (
        <Suspense fallback={<div className="flex-1 p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-300" /></div>}>
            <NewStoryPageContent />
        </Suspense>
    );
}
