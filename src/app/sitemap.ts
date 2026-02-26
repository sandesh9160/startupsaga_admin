import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchJson<T>(url: string): Promise<T> {
  const urlToUse = url.includes("localhost") ? url.replace("localhost", "127.0.0.1") : url;
  const res = await fetch(urlToUse, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function toArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data;
  return (data as { results?: Record<string, unknown>[] })?.results || [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let stories: Record<string, unknown>[] = [];
  let startups: Record<string, unknown>[] = [];
  let categories: Record<string, unknown>[] = [];
  let cities: Record<string, unknown>[] = [];
  let pages: Record<string, unknown>[] = [];

  try {
    const [storiesRes, startupsRes, categoriesRes, citiesRes, pagesRes] = await Promise.all([
      fetchJson<unknown>(`${API_BASE_URL}/stories/`),
      fetchJson<unknown>(`${API_BASE_URL}/startups/`),
      fetchJson<Record<string, unknown>[]>(`${API_BASE_URL}/categories/`),
      fetchJson<Record<string, unknown>[]>(`${API_BASE_URL}/cities/`),
      fetchJson<Record<string, unknown>[]>(`${API_BASE_URL}/pages/`),
    ]);
    stories = toArray(storiesRes);
    startups = toArray(startupsRes);
    categories = Array.isArray(categoriesRes) ? categoriesRes : [];
    cities = Array.isArray(citiesRes) ? citiesRes : [];
    pages = Array.isArray(pagesRes) ? pagesRes : [];
  } catch (e) {
    console.error("Sitemap fetch error:", e);
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now },
    { url: `${SITE_URL}/stories`, lastModified: now },
    { url: `${SITE_URL}/startups`, lastModified: now },
    { url: `${SITE_URL}/categories`, lastModified: now },
    { url: `${SITE_URL}/cities`, lastModified: now },
    { url: `${SITE_URL}/submit`, lastModified: now },
  ];

  const storyPages = stories.map((s: Record<string, unknown>) => ({
    url: `${SITE_URL}/stories/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at as string) : now,
  }));

  const startupPages = startups.map((s: Record<string, unknown>) => ({
    url: `${SITE_URL}/startups/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at as string) : now,
  }));

  const categoryPages = categories.map((c: Record<string, unknown>) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    lastModified: now,
  }));

  const cityPages = cities.map((c: Record<string, unknown>) => ({
    url: `${SITE_URL}/cities/${c.slug}`,
    lastModified: now,
  }));

  const pagePages = pages.map((p: Record<string, unknown>) => ({
    url: `${SITE_URL}/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at as string) : now,
  }));

  return [
    ...staticPages,
    ...storyPages,
    ...startupPages,
    ...categoryPages,
    ...cityPages,
    ...pagePages,
  ];
}
