"use client";

import { CategoryCard } from "@/components/cards/CategoryCard";
import { useState, useEffect } from "react";
import { getCategories, Category } from "@/lib/api";
import { getIcon } from "@/lib/icons";


export function CategoriesContent() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        getCategories().then(setCategories).catch(err => console.error(err));
    }, []);

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            {/* Header / Hero Section */}
            <section className="container-wide pt-16 pb-12 md:pt-24 md:pb-16 text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-zinc-900 mb-8 font-serif leading-[1.1] max-w-4xl mx-auto tracking-tight">
                    Explore India's Startup Ecosystem by Category
                </h1>

                <div className="space-y-4 mb-12">
                    <p className="text-base md:text-lg text-zinc-600 max-w-4xl mx-auto leading-relaxed">
                        Discover startups transforming every sector of India's economy. From high-growth fintech unicorns to disruptive healthcare innovators and cutting-edge SaaS platforms.
                    </p>
                    <p className="text-sm md:text-base text-zinc-500 max-w-3xl mx-auto leading-relaxed">
                        Each category features a curated list of companies, recent funding trends, and the key players driving innovation in their respective fields across Bharat.
                    </p>
                </div>
            </section>

            {/* Sticky Filters (Mockup if needed or just space) */}
            <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-y border-zinc-100 shadow-sm">
                <div className="container-wide py-4">
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Browse All Categories</span>
                    </div>
                </div>
            </div>

            {/* Categories Grid Section */}
            <section className="container-wide py-16 md:py-20">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {categories.map((category) => (
                        <div key={category.slug} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CategoryCard {...category} icon={getIcon(category.iconName || "help-circle")} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
