"use client";

import { useEffect } from "react";

/**
 * Props for SEOHead component
 */
interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * Client-side SEO component
 * NOTE: Not ideal for SEO in Next.js App Router.
 * Prefer server-side metadata when possible.
 */
export function SEOHead({
  title,
  description,
  ogImage = "https://startupsaga.in/og-image.jpg",
  canonicalUrl,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
}: SEOHeadProps) {
  const fullTitle = `${title} | StartupSaga.in`;

  useEffect(() => {
    // Update page title
    document.title = fullTitle;

    /**
     * Helper function to create or update meta tags
     */
    const updateMeta = (
      name: string,
      content: string,
      isProperty = false
    ) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    /* Basic meta */
    updateMeta("description", description);

    /* Open Graph */
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:image", ogImage, true);
    updateMeta("og:type", type, true);
    updateMeta("og:site_name", "StartupSaga.in", true);

    /* Twitter */
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);

    /* Article-specific tags */
    if (type === "article") {
      if (publishedTime) {
        updateMeta("article:published_time", publishedTime, true);
      }
      if (modifiedTime) {
        updateMeta("article:modified_time", modifiedTime, true);
      }
      if (author) {
        updateMeta("article:author", author, true);
      }
    }

    /* Canonical URL */
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", canonicalUrl);
    }

    // Cleanup on unmount
    return () => {
      document.title = "StartupSaga.in - Startup Stories from India";
    };
  }, [
    fullTitle,
    description,
    ogImage,
    canonicalUrl,
    type,
    publishedTime,
    modifiedTime,
    author,
  ]);

  return null;
}
