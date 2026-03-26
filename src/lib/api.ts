/**
 * @file lib/api.ts
 * @description Professional API Client for the StartupSaga Admin Dashboard.
 * This file handles all communication with the Django backend.
 */
import {
  Story,
  Startup,
  Hub,
  Category,
  Submission,
  AIPrompt,
  PaginatedResponse
} from "@/types";

export type {
  Story,
  Startup,
  Hub,
  Hub as City,
  Category,
  Submission,
  AIPrompt,
  PaginatedResponse
};

/**
 * Base API configuration
 * - Supports both the current NEXT_PUBLIC_API_URL and the older
 *   NEXT_PUBLIC_API_BASE_URL used in some local environments.
 */
const resolveApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

export const API_BASE_URL = resolveApiBaseUrl();

const getBaseUrl = () => {
  return resolveApiBaseUrl();
};
/**
 * Core fetch wrapper with error handling and CSRF support
 * @param endpoint - API endpoint (e.g., /stories/)
 * @param options - Request options
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${getBaseUrl()}${endpoint}`;
  const method = (options.method || "GET").toUpperCase();
  const isStartupDebugRequest = endpoint.includes("/startups/");

  try {
    const isSafeMethod = ["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add CSRF token for non-safe methods on the client side
    if (typeof window !== "undefined" && !isSafeMethod) {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }
      headers["X-Requested-With"] = "XMLHttpRequest";
    }

    if (isStartupDebugRequest) {
      console.log("[fetchAPI:startups] request", {
        method,
        endpoint,
        url,
        body: options.body,
      });
    }

    const res = await fetch(url, {
      cache: "no-store", // Completely disable caching for admin data
      ...options,
      credentials: "include", // Required for session-based auth
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      if (isStartupDebugRequest) {
        console.error("[fetchAPI:startups] error response", {
          method,
          endpoint,
          status: res.status,
          statusText: res.statusText,
          body: errorText,
        });
      }
      // Remove console.error to avoid Next.js overlay on handled errors
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    // Some endpoints (like DELETE) might return 204 No Content
    if (res.status === 204) return null;

    const json = await res.json();
    if (isStartupDebugRequest) {
      console.log("[fetchAPI:startups] response", {
        method,
        endpoint,
        status: res.status,
        json,
      });
    }
    return json;
  } catch (error) {
    if (isStartupDebugRequest) {
      console.error("[fetchAPI:startups] request failed", {
        method,
        endpoint,
        url,
        error,
      });
    }
    // Only throw, do not console.error which triggers Next.js dev overlay unconditionally
    throw error;
  }
}

/**
 * Multipart/form-data upload helper with the same auth/CSRF behavior as fetchAPI.
 */
export async function uploadAPI(endpoint: string, formData: FormData) {
  const url = `${getBaseUrl()}${endpoint}`;
  const headers: Record<string, string> = {};

  if (typeof window !== "undefined") {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

/**
 * Helper to handle list responses (handles both direct arrays and DRF pagination)
 */
async function fetchList<T>(endpoint: string): Promise<T[]> {
  const data = await fetchAPI(endpoint);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

/**
 * Helper to get count from (potentially) paginated response
 */
async function fetchCount(endpoint: string): Promise<number> {
  const data = await fetchAPI(endpoint);
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === 'object' && typeof data.count === 'number') {
    return data.count;
  }
  return 0;
}

/* =========================================================
   STORY MANAGEMENT
   ========================================================= */

export const storiesApi = {
  /** Get all stories */
  list: () => fetchList<Story>("/stories/"),

  /** Get single story for editing */
  get: (id: number) => fetchAPI(`/stories/${id}/update/`),

  /** Create a new story */
  create: (data: Partial<Story>) => fetchAPI("/stories/create/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  /** Update existing story */
  update: (id: number, data: Partial<Story>) => fetchAPI(`/stories/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  /** Delete a story */
  delete: (id: number) => fetchAPI(`/stories/${id}/delete/`, {
    method: "DELETE",
  }),

  /** Get total count of stories */
  count: () => fetchCount("/stories/?page_size=1"),
};

/* =========================================================
   STARTUP MANAGEMENT
   ========================================================= */

export const startupsApi = {
  /** Get all startups */
  list: () => fetchList<Startup>("/startups/"),

  /** Create a startup */
  create: (data: Partial<Startup>) => fetchAPI("/startups/create/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  /** Get startup detail by slug */
  get: (slug: string) => fetchAPI(`/startups/${slug}/`),

  /** Update startup details by slug */
  update: (slug: string, data: Partial<Startup>) => fetchAPI(`/startups/${slug}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  /** Delete a startup by slug */
  delete: (slug: string) => fetchAPI(`/startups/${slug}/delete/`, {
    method: "DELETE",
  }),

  /** Update submission status */
  updateStatus: (id: number, status: string) => fetchAPI(`/submissions/${id}/status/`, {
    method: "POST",
    body: JSON.stringify({ status }),
  }),

  /** Get total count of startups */
  count: () => fetchCount("/startups/?page_size=1"),
};

/* =========================================================
   HUB (CITY) MANAGEMENT
   ========================================================= */

export const hubsApi = {
  /** Get all regional hubs */
  list: () => fetchList<Hub>("/cities/"),

  /** Get single hub by slug */
  get: (slug: string) => fetchAPI(`/cities/${slug}/`),

  /** Create a hub */
  create: (data: Partial<Hub>) => fetchAPI("/cities/create/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  /** Update a hub */
  update: (slug: string, data: Partial<Hub>) => fetchAPI(`/cities/${slug}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  /** Delete a hub */
  delete: (slug: string) => fetchAPI(`/cities/${slug}/delete/`, {
    method: "DELETE",
  }),

  /** Get total count of hubs */
  count: () => fetchCount("/cities/?page_size=1"),
};

/* =========================================================
   CATEGORY MANAGEMENT
   ========================================================= */

export const categoriesApi = {
  /** Get all categories */
  list: () => fetchList<Category>("/categories/"),

  /** Create a category */
  create: (data: Partial<Category>) => fetchAPI("/categories/create/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  /** Update a category */
  update: (slug: string, data: Partial<Category>) => fetchAPI(`/categories/${slug}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  /** Delete a category */
  delete: (slug: string) => fetchAPI(`/categories/${slug}/delete/`, {
    method: "DELETE",
  }),
};

/* =========================================================
   PAGE MANAGEMENT
   ========================================================= */

export const pagesApi = {
  /** Get all pages */
  list: () => fetchList<any>("/pages/"),

  /** Get single page by ID */
  get: (id: string | number) => fetchAPI(`/pages/${id}/`),

  /** Create a new page */
  create: (data: any) => fetchAPI("/pages/create/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  /** Update an existing page */
  update: (id: string | number, data: any) => fetchAPI(`/pages/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  /** Delete a page */
  delete: (id: string | number) => fetchAPI(`/pages/${id}/delete/`, {
    method: "DELETE",
  }),
};

/* =========================================================
   PROMPT MANAGEMENT
   ========================================================= */

export const promptsApi = {
  /** Get all prompts */
  list: () => fetchList<AIPrompt>("/prompts/"),

  /** Create a prompt */
  create: (data: Partial<AIPrompt>) => fetchAPI("/prompts/create/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  /** Update a prompt */
  update: (id: number, data: Partial<AIPrompt>) => fetchAPI(`/prompts/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  /** Delete a prompt */
  delete: (id: number) => fetchAPI(`/prompts/${id}/delete/`, {
    method: "DELETE",
  }),

  /** Apply prompt logic to all content */
  applyAll: () => fetchAPI("/prompts/apply-all/", {
    method: "POST",
  }),
};

/* =========================================================
   SYSTEM CONTENT & CONFIG
   ========================================================= */

export const systemApi = {
  /** Get prompt configurations */
  getPrompts: () => fetchList<AIPrompt>("/prompts/"),

  /** Get global layout settings */
  getLayout: () => fetchAPI("/layout-settings/"),

  /** Update global layout settings */
  updateLayout: (data: Record<string, any>) => fetchAPI("/layout-settings/update/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  /** Get SEO settings */
  getSEO: () => fetchAPI("/seo-settings/"),

  /** Update SEO settings */
  updateSEO: (data: Record<string, any>) => {
    // Remove undefined or null values
    const cleanedData: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanedData[key] = value;
      }
    });

    return fetchAPI("/seo-settings/update/", {
      method: "POST",
      body: JSON.stringify(cleanedData),
    });
  },

  /** Apply SEO settings to all existing content */
  applyAllSEO: () => fetchAPI("/seo-settings/apply-all/", {
    method: "POST",
  }),


  /** Get navigation items */
  getNavigation: (position: string = "dashboard_sidebar") =>
    fetchAPI(`/navigation/?position=${position}`),

  getThemeSettings: (params: { pageKey?: string; pageSlug?: string }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== undefined) {
          cleanParams[key] = String(value);
        }
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return fetchAPI(`/theme/${query ? `?${query}` : ""}`);
  },

  /** Get categories */
  getCategories: () => categoriesApi.list(),
};

// Legacy exports for backward compatibility (can be phased out)
export const getStories = storiesApi.list;
export const getStoryById = storiesApi.get;
export const createStory = storiesApi.create;
export const updateStory = storiesApi.update;
export const deleteStory = storiesApi.delete;
export const getStartups = startupsApi.list;
export const getStartupById = startupsApi.get;
export const createStartup = startupsApi.create;
export const updateStartup = startupsApi.update;
export const getSubmissions = () => fetchList<Submission>("/submissions/list/");
export const getSubmissionsCount = (status?: string) => fetchCount(`/submissions/list/?page_size=1${status ? `&status=${status}` : ''}`);
export const getCities = hubsApi.list;
export const getNavigation = systemApi.getNavigation;
export const getLayoutSettings = systemApi.getLayout;
export const updateLayoutSettings = systemApi.updateLayout;
export const getSEOSettings = systemApi.getSEO;
export const updateSEOSettings = systemApi.updateSEO;
export const getPrompts = systemApi.getPrompts;
export const createPrompt = promptsApi.create;
export const updatePrompt = promptsApi.update;
export const deletePrompt = promptsApi.delete;
export const getSections = (page: string) => fetchList<any>(`/sections/?page=${page}`);
export const getTrendingStories = () => fetchList<any>("/stories/trending/");
export const getCitiesList = hubsApi.list;
export const getCityBySlug = hubsApi.get;
export const createCity = hubsApi.create;
export const updateCity = hubsApi.update;
export const deleteCity = hubsApi.delete;

export const getHubs = hubsApi.list;
export const getHubBySlug = hubsApi.get;
export const createHub = hubsApi.create;
export const updateHub = hubsApi.update;
export const deleteHub = hubsApi.delete;

export const getStoriesCount = storiesApi.count;
export const getStartupsCount = startupsApi.count;
export const getCitiesCount = hubsApi.count;
export const getThemeSettings = systemApi.getThemeSettings;
export const getCategories = categoriesApi.list;
export const createCategory = categoriesApi.create;
export const updateCategory = categoriesApi.update;
// Analytics helpers
export const getCategoryStats = async () => {
  const categories = await categoriesApi.list();
  return categories
    .map((c: any) => ({ name: c.name, value: c.startupCount || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories
};

export const getCityStats = async () => {
  const cities = await hubsApi.list();
  return cities
    .map((c: any) => ({ name: c.name, value: c.startupCount || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 cities
};

export const getActivityStats = () => fetchList<any>("/activity-stats/");
export const deleteCategory = categoriesApi.delete;
export const getPages = pagesApi.list;
export const getPageById = pagesApi.get;

/** Paginated stories with filters */
export const getStoriesPage = (params?: any) => {
  const cleanParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== undefined) {
        cleanParams[key] = String(value);
      }
    });
  }
  const query = new URLSearchParams(cleanParams).toString();
  return fetchAPI(`/stories/${query ? `?${query}` : ''}`);
};

/** Paginated startups with filters */
export const getStartupsPage = (params?: any): Promise<PaginatedResponse<Startup>> => {
  const cleanParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== undefined) {
        cleanParams[key] = String(value);
      }
    });
  }
  const query = new URLSearchParams(cleanParams).toString();
  return fetchAPI(`/startups/${query ? `?${query}` : ''}`);
};

/** Paginated hubs with filters */
export const getHubsPage = (params?: any): Promise<PaginatedResponse<Hub>> => {
  const cleanParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== undefined) {
        cleanParams[key] = String(value);
      }
    });
  }
  const query = new URLSearchParams(cleanParams).toString();
  return fetchAPI(`/cities/${query ? `?${query}` : ''}`);
};

/** Paginated submissions with filters */
export const getSubmissionsPage = (params?: any): Promise<PaginatedResponse<Submission>> => {
  const cleanParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== undefined) {
        cleanParams[key] = String(value);
      }
    });
  }
  const query = new URLSearchParams(cleanParams).toString();
  return fetchAPI(`/submissions/list/${query ? `?${query}` : ''}`);
};

// AI generation
export const generateContent = (prompt: string) => fetchAPI("/generate-content/", {
  method: "POST",
  body: JSON.stringify({ prompt }),
});

export const generateSEO = (data: { title: string; description: string; content: string; type: string }) => fetchAPI("/generate-seo/", {
  method: "POST",
  body: JSON.stringify(data),
});

// Submission helpers
export const getSubmissionDetail = (id: number) => fetchAPI(`/submissions/${id}/`);
export const updateSubmission = (id: number, data: any) => fetchAPI(`/submissions/${id}/update/`, {
  method: "PUT",
  body: JSON.stringify(data),
});
export const updateSubmissionStatus = (id: number, status: string) => fetchAPI(`/submissions/${id}/status/`, {
  method: "PUT",
  body: JSON.stringify({ status }),
});
export const deleteSubmission = (id: number) => fetchAPI(`/submissions/${id}/delete/`, {
  method: "DELETE",
});



/** Submit a new startup for review */
export const submitStartup = async (data: any) => {
  return fetchAPI('/submissions/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
/** Get newsletter subscribers */
export const getNewsletterSubscribers = () => fetchList<any>("/newsletter/list/");

/** Delete newsletter subscriber */
export const deleteNewsletterSubscriber = (id: number) => fetchAPI(`/newsletter/${id}/delete/`, {
  method: "DELETE",
});

/** Toggle block status for newsletter subscriber */
export const toggleBlockSubscriber = (id: number) => fetchAPI(`/newsletter/${id}/toggle-block/`, {
  method: "POST",
});

/** Send test admin alert email */
export const sendTestAdminAlert = () => fetchAPI("/newsletter/test-admin-alert/", {
  method: "POST",
});

export const newsletterTemplatesApi = {
  list: () => fetchList<any>("/newsletter/templates/"),
  get: (id: number) => fetchAPI(`/newsletter/templates/${id}/`),
  create: (data: any) => fetchAPI("/newsletter/templates/create/", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchAPI(`/newsletter/templates/${id}/update/`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/newsletter/templates/${id}/delete/`, {
    method: "DELETE",
  }),
};

export const getMediaItems = () => fetchList<any>("/media/");
export const uploadMediaItem = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return uploadAPI("/media/upload/", formData);
};
