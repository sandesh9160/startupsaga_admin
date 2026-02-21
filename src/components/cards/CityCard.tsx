"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { getSafeImageSrc } from "@/lib/images";
import { useState, useEffect } from "react";

interface CityCardProps {
  slug: string;
  name: string;
  image: string;
  startupCount: number;
  storyCount: number;
  tier?: string;
}

export function CityCard({ slug, name, image, startupCount, storyCount, tier }: CityCardProps) {
  const imageSrc = getSafeImageSrc(image);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedStartupCount = isMounted ? startupCount.toLocaleString('en-US') : "0";

  return (
    <Link href={`/cities/${slug}`} className="block group">
      <article className="card-editorial relative overflow-hidden aspect-[4/3] rounded-[1.5rem] border border-zinc-100 shadow-sm">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          unoptimized={imageSrc.toLowerCase().endsWith(".svg")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent opacity-80" />

        {/* Tier Badge */}
        {tier && (
          <div className="absolute top-3 right-3">
            <div className="bg-primary px-2.5 py-0.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg shadow-orange-500/30">
              Tier {tier}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 text-white/60 mb-0.5">
            <MapPin className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Regional Hub</span>
          </div>
          <h3 className="font-serif text-lg font-black text-white group-hover:text-primary transition-colors leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-3 mt-2.5 text-white/70 text-[11px] font-bold">
            <span className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-primary" />
              {formattedStartupCount} Startups
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-primary" />
              {storyCount} Stories
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
