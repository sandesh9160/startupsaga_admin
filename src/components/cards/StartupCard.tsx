"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { getSafeImageSrc } from "@/lib/images";

interface StartupCardProps {
  slug: string;
  name: string;
  tagline?: string;
  logo: string;
  category: any;
  categorySlug?: string;
  city: any;
  citySlug?: string;
  website?: string;
  website_url?: string;
}

export function StartupCard({
  slug,
  name,
  tagline,
  logo,
  category,
  categorySlug,
  city,
  citySlug,
  website,
  website_url,
}: StartupCardProps) {
  const displayCategory = typeof category === 'object' ? category.name : category;
  const displayCity = typeof city === 'object' ? city.name : city;
  const siteUrl = website || website_url;
  const logoSrc = getSafeImageSrc(logo);
  const isSvgLogo = logoSrc.toLowerCase().endsWith(".svg");

  return (
    <article className="card-editorial p-6 h-full flex flex-col group relative">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0 relative">
          <Image
            src={logoSrc}
            alt={`${name} logo`}
            fill
            className="object-cover"
            sizes="64px"
            unoptimized={isSvgLogo}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-base font-semibold text-foreground mb-1 group-hover:text-accent transition-colors truncate">
            {/* Main link covers the whole card via pseudo-element */}
            <Link href={`/startups/${slug}`} className="before:absolute before:inset-0 before:z-10 focus:outline-none">
              {name}
            </Link>
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{tagline}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap relative z-20">
        {/* These links sit above the main link click area */}
        {categorySlug ? (
          <Link href={`/categories/${categorySlug}`} className="badge-category text-xs hover:opacity-80 transition-opacity">
            {displayCategory}
          </Link>
        ) : (
          <span className="badge-category text-xs">{displayCategory}</span>
        )}

        {citySlug ? (
          <Link href={`/cities/${citySlug}`} className="badge-city text-xs hover:opacity-80 transition-opacity">
            {displayCity}
          </Link>
        ) : (
          <span className="badge-city text-xs">{displayCity}</span>
        )}
      </div>

      {siteUrl && (
        <div className="mt-auto pt-4 border-t border-border relative z-20">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </article>
  );
}
