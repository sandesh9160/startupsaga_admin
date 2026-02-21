"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface BannerProps {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    link_text?: string;
    link_url?: string;
    settings?: any;
}

export function Banner({
    title,
    subtitle,
    description,
    image,
    link_text,
    link_url,
    settings = {}
}: BannerProps) {
    const bgColor = settings.bg_color || "#FF5722";
    const textColor = settings.text_color || "#FFFFFF";

    return (
        <section className="py-12 md:py-16 relative overflow-hidden">
            <div
                className="absolute inset-0 z-0"
                style={{ backgroundColor: bgColor }}
            >
                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_0)] bg-[length:24px_24px]" />

                {/* Subtle Gradient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                {image && (
                    <div className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-105">
                        <img
                            src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000'}${image}`}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>

            <div className="container-wide relative z-10">
                <div className="max-w-4xl mx-auto text-center" style={{ color: textColor }}>
                    {subtitle && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                        >
                            <Sparkles className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{subtitle}</span>
                        </motion.div>
                    )}

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-[1.1]"
                    >
                        {title}
                    </motion.h2>

                    {description && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl opacity-80 mb-8 max-w-2xl mx-auto leading-relaxed"
                        >
                            {description}
                        </motion.p>
                    )}

                    {link_url && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                size="lg"
                                className="bg-white text-zinc-900 hover:bg-white/90 rounded-full px-8 shadow-xl shadow-black/10 transition-all active:scale-95 group"
                                asChild
                            >
                                <Link href={link_url}>
                                    <span className="font-bold">{link_text || "Learn More"}</span>
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
