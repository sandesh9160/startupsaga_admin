import { getPrompts } from "./api";
import { AIPrompt } from "@/types";

/**
 * Cache configuration
 */
let promptsCache: AIPrompt[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * Fetches proper prompt template from backend configuration or returns default
 * @param key The exact name of the prompt in the Admin Panel
 * @param defaultTemplate The fallback template if not found
 */
export async function getPromptTemplate(key: string, defaultTemplate: string = ""): Promise<string> {
    const now = Date.now();

    // Refresh cache if needed
    if (!promptsCache || (now - lastFetch > CACHE_TTL)) {
        try {
            console.log("🔄 Refreshing prompt cache...");
            promptsCache = await getPrompts();
            lastFetch = now;
        } catch (e) {
            console.error("❌ Failed to fetch prompts:", e);
            // If fetch fails, try to use stale cache, otherwise default
            if (!promptsCache) return defaultTemplate;
        }
    }

    const prompt = promptsCache?.find(p => p.name.trim() === key.trim() && p.is_active);

    if (prompt) {
        console.log(`✅ Using custom prompt for '${key}'`);
        return prompt.prompt_text;
    }

    console.log(`ℹ️ Using default template for '${key}'`);
    return defaultTemplate;
}

/**
 * Replaces placeholders like {title} in the template with values
 */
export function fillTemplate(template: string, data: Record<string, string | number | undefined | null>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        const value = data[key];
        return value !== undefined && value !== null ? String(value) : match;
    });
}
