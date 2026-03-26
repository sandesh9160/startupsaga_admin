
import { getPromptTemplate, fillTemplate } from "./prompt-manager";
import { generateContent, generateSEO } from "./api";

/**
 * City SEO Generator
 * Generates meta title and description for a city hub page.
 */
export async function CitySEOGenerator(name: string, description: string) {
    // Rely on backend-managed template
    const template = await getPromptTemplate("City SEO Generator");

    if (template) {
        const prompt = fillTemplate(template, {
            title: name,
            description: description || "",
            name: name // for consistency
        });

        const result = await generateContent(prompt);

        if (result.content) {
            try {
                const text = result.content;
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}') + 1;
                if (jsonStart !== -1 && jsonEnd !== 0) {
                    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd));
                    if (parsed.meta_title && parsed.meta_description) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.error("Failed to parse City SEO AI result", e);
            }
        }
    }console.warn("City SEO Generator: Using fallback SEO generation for", name);

    // Fallback to standard backend SEO if custom prompt not found or failed
    return await generateSEO({
        title: name,
        description: description || "",
        content: description || "",
        type: "hub"
    });
}

/**
 * City Description
 */
export async function CityDescription(name: string, description: string) {
    // Fetch from backend dashboard
    const template = await getPromptTemplate("City Description");
    if (!template) return description; // No prompt = No change

    const prompt = fillTemplate(template, {
        name,
        description: description || "No description provided."
    });

    const response = await generateContent(prompt);
    return response?.content || response;
}

/**
 * City Alt Text
 */
export async function CityAltText(name: string) {
    // Fetch from backend dashboard
    const template = await getPromptTemplate("City Alt Text");
    if (!template) return "";

    const prompt = fillTemplate(template, { name });

    const response = await generateContent(prompt);
    let altText = response?.content || response;

    if (altText && typeof altText === 'string') {
        return altText.replace(/^["']|["']$/g, '').trim();
    }
    return altText;
}
