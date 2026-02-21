"use client";

import Link from "next/link";
import Image from "next/image";
import { getSafeImageSrc } from "@/lib/images";

interface StoryCardProps {
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  categorySlug?: string;
  city: string;
  citySlug?: string;
  publishDate: string;
  featured?: boolean;
  isFeatured?: boolean;
}

export function StoryCard({
  slug,
  title,
  excerpt,
  thumbnail,
  category,
  categorySlug,
  city,
  citySlug,
  publishDate,
  featured = false,
  isFeatured,
}: StoryCardProps) {
  const thumbnailSrc = getSafeImageSrc(thumbnail);
  const isSvgThumbnail = thumbnailSrc.toLowerCase().endsWith(".svg");

  const isFeaturedCard = featured || isFeatured;

  if (isFeaturedCard) {
    return (
      <article className="card-editorial relative overflow-hidden aspect-[16/10] md:aspect-[2/1] group">
        {/* Main image background */}
        <Image
          src={thumbnailSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          unoptimized={isSvgThumbnail}
          priority
        />
        <div className="absolute inset-0 story-card-overlay" />

        {/* Content Content - Not wrapped in main link directly */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none">
          {/* Interactive elements must be pointer-events-auto */}
          <div className="flex items-center gap-3 mb-3 pointer-events-auto">
            {categorySlug && (
              <Link
                href={`/categories/${categorySlug}`}
                className="badge-category relative z-20"
              >
                {category}
              </Link>
            )}
            {citySlug && (
              <Link
                href={`/cities/${citySlug}`}
                className="badge-city relative z-20"
              >
                {city}
              </Link>
            )}
          </div>

          <Link href={`/stories/${slug}`} className="block pointer-events-auto group-hover:text-accent transition-colors">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
          </Link>

          <p className="text-white/80 text-sm md:text-sm max-w-2xl line-clamp-2 mb-3">
            {excerpt}
          </p>
          <time className="text-white/60 text-xs">{publishDate}</time>
        </div>

        {/* Full card clickable overlay - carefully positioned below other links */}
        <Link
          href={`/stories/${slug}`}
          className="absolute inset-0 z-10"
          aria-label={`Read story: ${title}`}
        />
      </article>
    );
  }

  return (
    <article className="card-editorial h-full flex flex-col group relative">
      <div className="relative aspect-[3/2] overflow-hidden">
        <Image
          src={thumbnailSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={isSvgThumbnail}
        />
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3 relative z-20">
          {categorySlug && (
            <Link href={`/categories/${categorySlug}`} className="badge-category text-xs hover:opacity-80 transition-opacity">
              {category}
            </Link>
          )}
          {citySlug && (
            <Link href={`/cities/${citySlug}`} className="badge-city text-xs hover:opacity-80 transition-opacity">
              {city}
            </Link>
          )}
        </div>

        <h3 className="font-serif text-base font-semibold text-foreground mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
          <Link href={`/stories/${slug}`} className="before:absolute before:inset-0 before:z-10">
            {title}
          </Link>
        </h3>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
          {excerpt}
        </p>
        <time className="text-muted-foreground/70 text-xs">{publishDate}</time>
      </div>
    </article>
  );
}
