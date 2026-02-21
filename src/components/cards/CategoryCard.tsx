"use client";

import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";

interface CategoryCardProps {
  slug: string;
  name: string;
  icon: LucideIcon;
  startupCount: number;
  description: string;
}

export function CategoryCard({
  slug,
  name,
  icon: Icon,
  startupCount,
  description,
}: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="block group">
      <article className="card-editorial p-6 h-full flex items-center gap-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-card border border-border/50 min-h-[110px]">
        <div className="w-14 h-14 rounded-xl bg-accent/10 flex flex-shrink-0 items-center justify-center group-hover:bg-accent text-accent group-hover:text-white transition-colors duration-300">
          <Icon className="h-7 w-7" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base mb-0.5 group-hover:text-accent transition-colors truncate">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground truncate mb-1">
            {startupCount} startups
          </p>
        </div>

        <div className="flex-shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-accent" />
          </div>
        </div>
      </article>
    </Link>
  );
}
