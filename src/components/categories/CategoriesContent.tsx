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
        <>
            {/* Header */}
            <section className="container-wide py-12 md:py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
                    Explore by Category
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Discover startups transforming every sector of India's economy. From fintech unicorns to healthcare innovators.
                </p>
            </section>

            {/* Categories Grid */}
            <section className="container-wide pb-16">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <CategoryCard key={category.slug} {...category} icon={getIcon(category.iconName || "help-circle")} />
                    ))}
                </div>
            </section>
        </>
    );
}
