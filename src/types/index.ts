/**
 * @file types/index.ts
 * @description Centralized type definitions for the StartupSaga platform.
 * Using a single file for types to maintain the "don't create too many files" rule
 * while keeping the codebase professional and typed.
 */

/**
 * Represents a Startup Story/Article
 */
export interface Story {
    id?: number;
    slug: string;
    title: string;
    excerpt: string;
    thumbnail: string;
    category: string;
    categorySlug?: string;
    city: string;
    citySlug?: string;
    publishDate: string;
    author: string;
    content: string;
    isFeatured?: boolean;
    published_at?: string;
    updated_at?: string;
    stage?: string;
    views?: number;
    trendingScore?: number;
    status?: "draft" | "published";
    sections?: StorySection[];
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    image_alt?: string;
    show_table_of_contents?: boolean;
    og_image?: string;
}

/**
 * Represents a section within a story (for long-form content)
 */
export interface StorySection {
    id: string;
    title: string;
    content: string;
}

/**
 * Represents a Startup Listing
 */
export interface Startup {
    id?: number;
    slug: string;
    name: string;
    logo: string;
    tagline?: string;
    category: any; // Can be string or object depending on fetch depth
    categorySlug?: string;
    city: any; // Can be string or object depending on fetch depth
    citySlug?: string;
    website_url?: string;
    description: string;
    founded_year?: number | string;
    founder_name?: string;
    founder_linkedin?: string;
    stage?: string;
    sector?: string;
    team_size?: string;
    founders_data?: any[];
    is_featured?: boolean;
    status?: string;
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    created_at?: string;
}

/**
 * Represents a Hub (Regional Ecosystem)
 */
export interface Hub {
    id?: number;
    slug: string;
    name: string;
    image: string;
    startupCount: number;
    storyCount?: number;
    unicornCount?: number;
    description: string;
    tier?: string;
    is_featured?: boolean;
    status?: string;
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
}

/**
 * Represents a Business Category (e.g., SaaS, FinTech)
 */
export interface Category {
    id?: number;
    slug: string;
    name: string;
    iconName?: string;
    startupCount: number;
    storyCount?: number;
    description: string;
}

/**
 * Represents a Startup Submission from a user
 */
export interface Submission {
    id: number;
    startup_name: string;
    website: string;
    description: string;
    status: "pending" | "approved" | "rejected";
    submitted_at: string;
    contact_email?: string;
    logo?: string;
    thumbnail?: string;
    og_image?: string;
    logo_url?: string;
}

/**
 * Represents an AI Prompt used for generation
 */
export interface AIPrompt {
    id: number;
    name: string;
    category: string;
    prompt_text: string;
    is_active: boolean;
}

/**
 * Generic Paginated Response wrapper
 */
export interface PaginatedResponse<T> {
    count: number;
    total_pages?: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
