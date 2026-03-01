"use client";

import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import { cn } from "@/lib/utils";
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
    MoreHorizontal,
    LayoutGrid
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { fetchAPI, generateContent, generateSEO, getSubmissionDetail, createStory, getStories, updateStory, getStoryById, updateSubmissionStatus, getStartups, getCategories, getHubs, startupsApi } from "@/lib/api";
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
    image_alt?: string;
    show_table_of_contents: boolean;
    status: StoryStatus;
    og_image?: string;
};

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

function NewStoryPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const submissionId = searchParams.get('submission');
    const editSlug = searchParams.get('edit');
    const editIdParam = searchParams.get('editId');
    const sectionIdCounter = useRef(0);
    const [startups, setStartups] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [isSlugSynced, setIsSlugSynced] = useState(true);
    const [sections, setSections] = useState<Array<{ id: string; title: string; content: string }>>([]);
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [editingStoryId, setEditingStoryId] = useState<number | null>(null);
    const [publishType, setPublishType] = useState<"story" | "startup">("story");
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
        image_alt: "",
        show_table_of_contents: true,
        status: "draft",
        og_image: ""
    });

    const [startupData, setStartupData] = useState({
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


    const isStory = publishType === "story";
    const currentThumbnail = isStory ? formData.thumbnail : startupData.logo;
    const currentStatus = isStory ? formData.status : (startupData.status as StoryStatus);
    const currentSEO = isStory ? formData : startupData;

    const setThumbnail = (val: string) => {
        if (isStory) setFormData((prev: StoryFormData) => ({ ...prev, thumbnail: val }));
        else setStartupData((prev: any) => ({ ...prev, logo: val, og_image: val }));
    };

    const setStatus = (val: StoryStatus) => {
        if (isStory) setFormData((prev: StoryFormData) => ({ ...prev, status: val }));
        else setStartupData((prev: any) => ({ ...prev, status: val }));
    };

    const setSEO = (field: string, val: string) => {
        if (isStory) setFormData((prev: StoryFormData) => ({ ...prev, [field]: val }));
        else setStartupData((prev: any) => ({ ...prev, [field]: val }));
    };

    const [tagInput, setTagInput] = useState("");

    // Local state to hold raw submission info for display
    const [submissionDetails, setSubmissionDetails] = useState<any | null>(null);

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
                        image_alt: story.image_alt || "",
                        show_table_of_contents: story.show_table_of_contents ?? true,
                        status,
                        og_image: story.og_image || ""
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
                    setFormData((prev: StoryFormData) => ({
                        ...prev,
                        title: titleFromSubmission ? `${titleFromSubmission}: A Startup Journey` : "",
                        slug: generateSlugFromText(titleFromSubmission),
                        category: sub.category || "Funding",
                        city: sub.city || "Mumbai",
                        excerpt: sub.excerpt || sub.short_description || sub.description || "",
                        content: sub.content || sub.full_story || sub.story || sub.description || "",
                        author: prev.author || sub.founder_name || "Editorial Team",
                        meta_title: titleFromSubmission ? `How ${titleFromSubmission} is Revolutionizing ${sub.category || 'their Industry'}` : "",
                        thumbnail: sub.thumbnail || sub.logo || sub.logo_url || prev.thumbnail || "",
                        og_image: sub.thumbnail || sub.logo || sub.logo_url || prev.og_image || "",
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
        getStartups().then(data => setStartups((data || []).filter(Boolean))).catch((err) => console.error("Failed to load startups", err));
        getCategories().then(data => setCategories((data || []).filter(Boolean))).catch((err) => console.error("Failed to load categories", err));
        getHubs().then(data => setHubs((data || []).filter(Boolean))).catch((err) => console.error("Failed to load hubs", err));
        fetchAPI("/media/").then(data => setMediaItems(Array.isArray(data) ? data.filter(Boolean) : [])).catch((err) => console.error("Failed to load media", err));
    }, []);

    const handleWriteWithAI = async () => {
        if (!formData.title) {
            toast.error("Please enter a story title first!");
            return;
        }
        setIsGenerating(true);
        console.log("🤖 Starting AI content generation for:", formData.title);

        try {
            let template = await getPromptTemplate("Story Content Generator");
            const prompt = fillTemplate(template, { title: formData.title });

            console.log("📝 Sending prompt to AI:", prompt.substring(0, 100) + "...");

            const result = await generateContent(prompt);
            console.log("✅ AI Response received:", result);

            // Check for error response from backend
            if (result.error) {
                console.error("❌ AI Error:", result.error);
                toast.error(`AI Error: ${result.error}`);
                return;
            }

            if (result.content) {
                console.log("✅ Content generated, length:", result.content.length);
                setFormData(prev => ({ ...prev, content: result.content }));
                toast.success("✨ AI-generated content ready!");
            } else {
                console.warn("⚠️ No content in response:", result);
                toast.error("AI returned empty response. Please try again.");
            }
        } catch (err: any) {
            console.error("❌ Content Generation Error:", err);
            const errorMessage = err.message || String(err);
            toast.error(`Failed to generate content: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSEO = async () => {
        const title = isStory ? formData.title : startupData.name;
        const description = isStory ? formData.excerpt : startupData.tagline;
        const content = isStory ? formData.content : startupData.description;

        if (!title) {
            toast.error("Please enter a title first!");
            return;
        }
        setIsGenerating(true);
        console.log("🤖 Starting SEO generation for:", title);

        try {
            const template = await getPromptTemplate(isStory ? "Story SEO Generator" : "Startup SEO Generator") || (isStory ? "Story SEO Generator" : "Startup SEO Generator");

            // Use custom prompt via generateContent
            const prompt = (typeof template === 'string' && template.includes('{title}'))
                ? fillTemplate(template, { title, description: description || "", content: content || "", type: publishType })
                : `Generate SEO metadata for a ${publishType} titled "${title}". Description: ${description}. Content excerpt: ${content?.substring(0, 500)}. Return JSON with meta_title, meta_description, meta_keywords, image_alt.`;

            const fullPrompt = prompt + "\n\nReturn the result strictly as a JSON object with keys: meta_title, meta_description, meta_keywords, image_alt. The meta_description MUST BE 160 characters OR LESS.";

            const result = await generateContent(fullPrompt);

            if (result.content) {
                try {
                    const jsonStart = result.content.indexOf('{');
                    const jsonEnd = result.content.lastIndexOf('}') + 1;
                    const jsonStr = result.content.slice(jsonStart, jsonEnd);
                    const parsed = JSON.parse(jsonStr);

                    if (parsed.meta_title && parsed.meta_description) {
                        const seoData = {
                            meta_title: parsed.meta_title,
                            meta_description: parsed.meta_description?.slice(0, 160),
                            meta_keywords: parsed.meta_keywords || parsed.keywords || "",
                        };

                        if (isStory) {
                            setFormData(prev => ({ ...prev, ...seoData, image_alt: parsed.image_alt || prev.image_alt }));
                        } else {
                            setStartupData(prev => ({ ...prev, ...seoData }));
                        }
                        toast.success(`✨ SEO metadata for ${publishType} generated!`);
                    } else {
                        throw new Error("Incomplete result");
                    }
                } catch (e) {
                    console.error("Failed to parse SEO response", e);
                    // Standard fallback
                    const fallback = await generateSEO({ title, description: description || "", content: content || "", type: publishType });
                    if (fallback.meta_title) {
                        const seoData = {
                            meta_title: fallback.meta_title,
                            meta_description: fallback.meta_description?.slice(0, 160),
                            meta_keywords: fallback.meta_keywords || "",
                        };
                        if (isStory) {
                            setFormData(prev => ({ ...prev, ...seoData, image_alt: fallback.image_alt || prev.image_alt }));
                        } else {
                            setStartupData(prev => ({ ...prev, ...seoData }));
                        }
                        toast.success("✨ SEO metadata generated via fallback!");
                    }
                }
            }
        } catch (err: any) {
            console.error("❌ SEO Generation Error:", err);
            toast.error(`Failed to generate SEO: ${err.message || String(err)}`);
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
        console.log("🤖 Starting alt text generation for:", formData.title);

        try {
            const template = await getPromptTemplate("Story Alt Text Generator");
            const prompt = fillTemplate(template, { title: formData.title });

            const result = await generateContent(prompt);
            console.log("✅ Alt Text Response received:", result);

            if (result.error) {
                console.error("❌ Alt Text Error:", result.error);
                toast.error(`AI Error: ${result.error}`);
            } else if (result.content) {
                let altText = result.content.replace(/^["']|["']$/g, '');
                console.log("✅ Generated alt text:", altText);
                setFormData(prev => ({ ...prev, image_alt: altText }));
                toast.success("✨ Alt text generated!");
            } else {
                console.warn("⚠️ No content in alt text response");
                toast.error("Failed to generate alt text.");
            }
        } catch (err: any) {
            console.error("❌ Alt Text Generation Error:", err);
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
        console.log("🤖 Starting slug generation for:", formData.title);

        try {
            const template = await getPromptTemplate("Slug Generator");
            const prompt = fillTemplate(template, { title: formData.title });

            const result = await generateContent(prompt);
            console.log("✅ Slug Response received:", result);

            if (result.error) {
                console.error("❌ Slug Error:", result.error);
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

    const handleGenerateStartupContent = async () => {
        if (!startupData.name) {
            toast.error("Please enter a startup name first");
            return;
        }
        setIsGenerating(true);
        try {
            const descResult = await generateContent(`Write a catchy tagline and a professional 3-sentence description for a startup named "${startupData.name}". Respond in JSON format with "tagline" and "description" keys.`);

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
                title: startupData.name,
                description: generatedDesc || startupData.name,
                content: generatedDesc || startupData.name,
                type: 'startup'
            });

            setStartupData(prev => ({
                ...prev,
                tagline: generatedTagline || prev.tagline,
                description: generatedDesc || prev.description,
                meta_title: seoResult.meta_title || `${startupData.name} | Startup Directory`,
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
        setStartupData(prev => ({
            ...prev,
            founders_data: [...prev.founders_data, { name: "", role: "", linkedin: "", image: "" }]
        }));
    };

    const removeFounder = (index: number) => {
        setStartupData(prev => ({
            ...prev,
            founders_data: prev.founders_data.filter((_, i) => i !== index)
        }));
    };

    const updateFounder = (index: number, field: string, value: string) => {
        setStartupData(prev => ({
            ...prev,
            founders_data: prev.founders_data.map((f, i) => i === index ? { ...f, [field]: value } : f)
        }));
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !startupData.industry_tags.includes(tag)) {
            setStartupData(prev => ({ ...prev, industry_tags: [...prev.industry_tags, tag] }));
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setStartupData(prev => ({ ...prev, industry_tags: startupData.industry_tags.filter(t => t !== tag) }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setStartupData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (targetStatus: StoryStatus) => {
        if (isPublishing) return;
        setIsPublishing(true);

        try {
            if (publishType === "story") {
                if (!formData.title.trim()) { toast.error("Please enter a story title!"); setIsPublishing(false); return; }
                if (!formData.content.trim()) { toast.error("Please add content to your story!"); setIsPublishing(false); return; }
                if (!formData.slug.trim()) { toast.error("Please provide a URL slug!"); setIsPublishing(false); return; }

                const storyData: any = {
                    ...formData,
                    sections: sections.length > 0 ? sections : undefined,
                    status: targetStatus
                };

                if (editingStoryId) {
                    await updateStory(editingStoryId, storyData);
                    toast.success(targetStatus === 'published' ? "🎉 Story published!" : "💾 Draft saved!");
                } else {
                    await createStory(storyData);
                    toast.success(targetStatus === 'published' ? "🎉 Story published!" : "💾 Draft saved!");
                }
                router.push("/dashboard/stories");
            } else {
                if (!startupData.name.trim()) { toast.error("Please enter startup name!"); setIsPublishing(false); return; }
                if (!startupData.slug.trim()) { toast.error("Please provide a URL slug!"); setIsPublishing(false); return; }

                const cleanData = {
                    ...startupData,
                    founded_year: startupData.founded_year ? parseInt(startupData.founded_year.toString()) : undefined,
                    funding_stage: startupData.stage,
                    industry_tags: startupData.industry_tags.length > 0 ? startupData.industry_tags : (startupData.sector ? [startupData.sector] : []),
                    status: targetStatus === 'draft' ? 'draft' : 'published'
                };
                await startupsApi.create(cleanData);
                toast.success("Startup created successfully");
                router.push("/dashboard/startups");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to save.");
            setIsPublishing(false);
        }
    };


    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-screen">
                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/dashboard/stories")}
                            className="h-10 w-10 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 shadow-sm transition-all flex items-center justify-center shrink-0"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900 mt-1">
                                Write a Story
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (formData.slug) {
                                    window.open(`${FRONTEND_URL}/stories/${formData.slug}`, '_blank');
                                } else {
                                    toast.error("Slug required for preview");
                                }
                            }}
                            className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-widest"
                        >
                            <Eye className="h-3.5 w-3.5" /> Preview
                        </button>

                        <button
                            onClick={() => handleSave('draft')}
                            disabled={isPublishing}
                            className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-widest"
                        >
                            {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Save Draft
                        </button>

                        <button
                            onClick={() => handleSave('published')}
                            disabled={isPublishing}
                            className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-purple-200 flex items-center gap-1.5"
                        >
                            {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                            {isPublishing ? "Saving..." : (editingStoryId && formData.status === 'published' ? 'Update' : 'Publish')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                    <div className="lg:col-span-2 space-y-6">
                        {publishType === "story" ? (
                            <>
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
                                                placeholder="e.g., Zepto Raises $665M, Becomes India's Fastest Growing Unicorn"
                                                value={formData.title}
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
                                                placeholder="Brief summary that appears at the top of the story..."
                                                value={formData.excerpt}
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
                                                    value={formData.author}
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

                                {/* Social Media Preview (OG Image) Card */}
                                <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                                    <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                        <CardTitle className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon className="h-3.5 w-3.5" /> Social Media Preview (OG Image)
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-3 text-[10px] font-bold text-primary hover:bg-indigo-50 rounded-lg"
                                            onClick={() => {
                                                if (formData.thumbnail) {
                                                    setFormData(prev => ({ ...prev, og_image: prev.thumbnail }));
                                                    toast.success("Used thumbnail as OG image");
                                                } else {
                                                    toast.error("No thumbnail available to use");
                                                }
                                            }}
                                        >
                                            Use Thumbnail
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Upload OG Image</Label>
                                                <div
                                                    onClick={() => document.getElementById('og-image-upload-story')?.click()}
                                                    className="aspect-[1200/630] w-full rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:bg-slate-50/50 hover:border-indigo-300 transition-all shadow-inner"
                                                >
                                                    {formData.og_image ? (
                                                        <>
                                                            <img src={getSafeImageSrc(formData.og_image)} alt="OG Preview" className="h-full w-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white text-xs font-bold bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">Change Image</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 opacity-50 group-hover:opacity-100 group-hover:text-indigo-600 transition-all text-center">
                                                            <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-zinc-200">
                                                                <Plus className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest block">Add Social Image</span>
                                                                <span className="text-[9px] font-bold opacity-60">1200 x 630px recommended</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    id="og-image-upload-story"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setSEO('og_image', reader.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <Input
                                                    placeholder="Or paste OG Image URL..."
                                                    value={formData.og_image}
                                                    onChange={(e) => setSEO('og_image', e.target.value)}
                                                    className="h-10 text-xs rounded-xl bg-zinc-50"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block text-center">Social Card Preview</Label>
                                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100/50">
                                                    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                                                        <div className="aspect-[1200/630] bg-zinc-100 flex items-center justify-center overflow-hidden">
                                                            {formData.og_image ? (
                                                                <img src={getSafeImageSrc(formData.og_image)} alt="Facebook/Twitter Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <ImageIcon className="h-10 w-10 text-zinc-200" />
                                                            )}
                                                        </div>
                                                        <div className="p-4 space-y-1.5">
                                                            <div className="text-[10px] font-bold text-zinc-400 uppercase truncate tracking-wider">
                                                                {formData.slug || 'story-slug-preview'}
                                                            </div>
                                                            <div className="text-sm font-bold text-zinc-900 line-clamp-1">
                                                                {formData.meta_title || formData.title || 'Your story title would appear here'}
                                                            </div>
                                                            <div className="text-[11px] text-zinc-500 line-clamp-2 leading-snug">
                                                                {formData.meta_description || formData.excerpt || 'The meta description or story excerpt will provide a brief summary of the content to social media users...'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[9px] text-center text-zinc-400 font-medium px-4">
                                                    This is an approximation of how your content will appear when shared on platforms like Facebook, Twitter, and LinkedIn.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <>
                                {/* Startup Identity Card */}
                                <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                                    <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                        <CardTitle className="text-[10px] font-black flex items-center gap-2.5 text-zinc-500 uppercase tracking-widest">
                                            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                                <Building2 className="h-3 w-3 text-white" />
                                            </div>
                                            Venture Identity
                                        </CardTitle>
                                        <Button
                                            onClick={handleGenerateStartupContent}
                                            disabled={isGenerating || !startupData.name}
                                            className="h-7 px-3 rounded-lg text-[9px] font-black bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all border-none"
                                        >
                                            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                                            AI Assistant
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Startup Name</Label>
                                                <Input
                                                    placeholder="e.g. Acme Fintech"
                                                    value={startupData.name}
                                                    onChange={(e) => {
                                                        const newName = e.target.value;
                                                        setStartupData(prev => ({
                                                            ...prev,
                                                            name: newName,
                                                            slug: prev.slug || newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                                                        }));
                                                    }}
                                                    className="h-11 px-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL Slug</Label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">/startups/</div>
                                                    <Input
                                                        placeholder="acme-fintech"
                                                        value={startupData.slug}
                                                        onChange={(e) => setStartupData({ ...startupData, slug: e.target.value })}
                                                        className="h-11 pl-16 pr-3 rounded-xl border-zinc-200 bg-white focus:ring-2 focus:ring-primary/10 font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Website URL</Label>
                                                <Input
                                                    placeholder="https://example.com"
                                                    value={startupData.website_url}
                                                    onChange={(e) => setStartupData({ ...startupData, website_url: e.target.value })}
                                                    className="h-11 rounded-xl border-zinc-200 bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tagline</Label>
                                                <Input
                                                    placeholder="e.g. 10-minute grocery delivery"
                                                    value={startupData.tagline}
                                                    onChange={(e) => setStartupData({ ...startupData, tagline: e.target.value })}
                                                    className="h-11 rounded-xl border-zinc-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                                                <Select
                                                    value={startupData.category}
                                                    onValueChange={(v) => setStartupData({ ...startupData, category: v })}
                                                >
                                                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white">
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
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Location City</Label>
                                                <Select
                                                    value={startupData.city}
                                                    onValueChange={(v) => setStartupData({ ...startupData, city: v })}
                                                >
                                                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white">
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
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Business Stats Card */}
                                <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                                    <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                        <CardTitle className="text-[10px] font-black flex items-center gap-2.5 text-zinc-500 uppercase tracking-widest">
                                            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                                <LayoutGrid className="h-3 w-3 text-white" />
                                            </div>
                                            Business Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        <div className="grid grid-cols-4 gap-5">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Founded</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="2024"
                                                    value={startupData.founded_year}
                                                    onChange={(e) => setStartupData({ ...startupData, founded_year: e.target.value })}
                                                    className="h-10 rounded-xl border-zinc-200"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Stage</Label>
                                                <Select
                                                    value={startupData.stage}
                                                    onValueChange={(v) => setStartupData({ ...startupData, stage: v })}
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
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Model</Label>
                                                <Select
                                                    value={startupData.business_model}
                                                    onValueChange={(v) => setStartupData({ ...startupData, business_model: v })}
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
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Team</Label>
                                                <Select
                                                    value={startupData.team_size}
                                                    onValueChange={(v) => setStartupData({ ...startupData, team_size: v })}
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
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sector</Label>
                                            <Select
                                                value={startupData.sector}
                                                onValueChange={(v) => setStartupData({ ...startupData, sector: v })}
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
                                    </CardContent>
                                </Card>

                                {/* Startup Journey Editor */}
                                <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                                    <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                        <CardTitle className="text-[10px] font-black flex items-center gap-2.5 text-zinc-500 uppercase tracking-widest">
                                            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                                <PenTool className="h-3 w-3 text-white" />
                                            </div>
                                            Startup Journey
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <RichTextEditor
                                            content={startupData.description}
                                            onChange={(val) => setStartupData({ ...startupData, description: val })}
                                            placeholder="Tell the full story of the startup journey..."
                                        />
                                    </CardContent>
                                </Card>

                                {/* Startup Social Media Preview Card */}
                                <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                                    <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                        <CardTitle className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon className="h-3.5 w-3.5" /> Social Media Preview (OG Image)
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-3 text-[10px] font-bold text-primary hover:bg-indigo-50 rounded-lg"
                                            onClick={() => {
                                                if (startupData.logo) {
                                                    setStartupData(prev => ({ ...prev, og_image: prev.logo }));
                                                    toast.success("Used logo as OG image");
                                                } else {
                                                    toast.error("No logo available to use");
                                                }
                                            }}
                                        >
                                            Use Logo
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Upload OG Image</Label>
                                                <div
                                                    onClick={() => document.getElementById('og-image-upload-startup')?.click()}
                                                    className="aspect-[1200/630] w-full rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:bg-slate-50/50 hover:border-indigo-300 transition-all shadow-inner"
                                                >
                                                    {startupData.og_image ? (
                                                        <>
                                                            <img src={getSafeImageSrc(startupData.og_image)} alt="OG Preview" className="h-full w-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white text-xs font-bold bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">Change Image</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 opacity-50 group-hover:opacity-100 group-hover:text-indigo-600 transition-all text-center">
                                                            <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-zinc-200">
                                                                <Plus className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest block">Add Social Image</span>
                                                                <span className="text-[9px] font-bold opacity-60">1200 x 630px recommended</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    id="og-image-upload-startup"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setSEO('og_image', reader.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <Input
                                                    placeholder="Or paste OG Image URL..."
                                                    value={startupData.og_image}
                                                    onChange={(e) => setSEO('og_image', e.target.value)}
                                                    className="h-10 text-xs rounded-xl bg-zinc-50"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block text-center">Social Card Preview</Label>
                                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100/50">
                                                    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                                                        <div className="aspect-[1200/630] bg-zinc-100 flex items-center justify-center overflow-hidden">
                                                            {startupData.og_image ? (
                                                                <img src={getSafeImageSrc(startupData.og_image)} alt="Facebook/Twitter Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <ImageIcon className="h-10 w-10 text-zinc-200" />
                                                            )}
                                                        </div>
                                                        <div className="p-4 space-y-1.5">
                                                            <div className="text-[10px] font-bold text-zinc-400 uppercase truncate tracking-wider">
                                                                {startupData.slug || 'startup-slug-preview'}
                                                            </div>
                                                            <div className="text-sm font-bold text-zinc-900 line-clamp-1">
                                                                {startupData.meta_title || startupData.name || 'Startup Listing Preview'}
                                                            </div>
                                                            <div className="text-[11px] text-zinc-500 line-clamp-2 leading-snug">
                                                                {startupData.meta_description || startupData.tagline || 'The startup tagline or description will appear here on social platforms...'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Dynamic Editable Table of Contents - Sidebar */}
                        {isStory && (
                            <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white group/toc relative">
                                <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                            <List className="h-3 w-3 text-orange-600" />
                                        </div>
                                        <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                                            Content Outline
                                        </CardTitle>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-100">
                                                <Plus className="h-3.5 w-3.5 text-orange-600" />
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
                                                    className="rounded-lg py-2 cursor-pointer focus:bg-orange-50 focus:text-orange-700"
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
                                                        item.tag === 'h2' ? "text-orange-500/50" : "text-zinc-300 ml-1.5"
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
                                                <Plus className="h-4 w-4 text-orange-500" />
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
                        )}



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
                                    <ImageIcon className="h-3.5 w-3.5" /> {isStory ? "Cover Image" : "Startup Logo"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-4">
                                    <div
                                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                                        className="aspect-video w-full rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all"
                                    >
                                        {currentThumbnail ? (
                                            <>
                                                <img src={getSafeImageSrc(currentThumbnail)} alt="Cover" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 opacity-50 group-hover:opacity-100 group-hover:text-indigo-600 transition-all">
                                                <div className="h-12 w-12 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-zinc-200 group-hover:border-indigo-300">
                                                    <Plus className="h-6 w-6" />
                                                </div>
                                                <span className="text-xs font-bold">Add Image</span>
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
                                            value={currentThumbnail || ""}
                                            onChange={(e) => setThumbnail(e.target.value)}
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
                                                        setThumbnail(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <Input
                                            placeholder="Or paste image URL..."
                                            value={currentThumbnail || ""}
                                            onChange={(e) => setThumbnail(e.target.value)}
                                            className="h-10 rounded-xl bg-secondary border-border text-[11px] font-bold focus:bg-white"
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
                                        onClick={() => setStatus('draft')}
                                        className={cn(
                                            "relative h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 group",
                                            currentStatus === 'draft'
                                                ? "border-amber-500 bg-amber-50 shadow-lg shadow-amber-100"
                                                : "border-zinc-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                                        )}
                                    >
                                        <Edit className={cn(
                                            "h-5 w-5 transition-colors",
                                            currentStatus === 'draft' ? "text-amber-600" : "text-zinc-400 group-hover:text-amber-500"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-wide transition-colors",
                                            currentStatus === 'draft' ? "text-amber-700" : "text-zinc-500 group-hover:text-amber-600"
                                        )}>
                                            Draft
                                        </span>
                                        {currentStatus === 'draft' && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStatus('published')}
                                        className={cn(
                                            "relative h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 group",
                                            currentStatus === 'published'
                                                ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                                                : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"
                                        )}
                                    >
                                        <Globe className={cn(
                                            "h-5 w-5 transition-colors",
                                            currentStatus === 'published' ? "text-emerald-600" : "text-zinc-400 group-hover:text-emerald-500"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-wide transition-colors",
                                            currentStatus === 'published' ? "text-emerald-700" : "text-zinc-500 group-hover:text-emerald-600"
                                        )}>
                                            Published
                                        </span>
                                        {currentStatus === 'published' && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-medium text-center pt-1">
                                    {currentStatus === 'draft'
                                        ? "Drafts are only visible in the admin panel"
                                        : "Published items are visible on the public website"}
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
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleGenerateSEO}
                                    disabled={isGenerating}
                                    className="h-7 px-3 text-[10px] font-bold text-primary hover:text-primary/90 hover:bg-emerald-50 rounded-lg"
                                >
                                    {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                    Auto-Fill
                                </Button>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Title</Label>
                                    <Input
                                        value={currentSEO.meta_title}
                                        onChange={(e) => setSEO('meta_title', e.target.value)}
                                        className="h-10 text-xs font-bold rounded-xl border-border bg-secondary focus:bg-white"
                                        placeholder="SEO-optimized title (max 60 chars)"
                                    />
                                    <div className="flex justify-end">
                                        <span className={cn("text-[9px] font-bold", currentSEO.meta_title.length > 60 ? "text-rose-500" : "text-zinc-300")}>
                                            {currentSEO.meta_title.length}/60
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Description</Label>
                                    <Textarea
                                        className="min-h-[90px] text-xs font-bold rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white resize-none"
                                        value={currentSEO.meta_description}
                                        onChange={(e) => setSEO('meta_description', e.target.value)}
                                        placeholder="SEO-optimized description (max 160 chars)"
                                    />
                                    <div className="flex justify-end">
                                        <span className={cn("text-[9px] font-bold", currentSEO.meta_description.length > 160 ? "text-rose-500" : "text-zinc-300")}>
                                            {currentSEO.meta_description.length}/160
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Keywords</Label>
                                    <Input
                                        value={currentSEO.meta_keywords}
                                        onChange={(e) => setSEO('meta_keywords', e.target.value)}
                                        className="h-10 text-xs font-bold rounded-xl border-border bg-secondary focus:bg-white"
                                        placeholder="Keywords, separated, by, commas"
                                    />
                                </div>
                                {isStory && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Image Alt Text</Label>
                                        <Input
                                            value={formData.image_alt}
                                            onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                                            className="h-10 text-xs font-bold rounded-xl border-border bg-secondary focus:bg-white"
                                            placeholder="Descriptive alt text for featured image"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Publishing Options */}
                        {isStory && (
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
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}

export default function NewStoryPage() {
    return (
        <Suspense fallback={<div className="flex-1 p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-300" /></div>}>
            <NewStoryPageContent />
        </Suspense>
    );
}
