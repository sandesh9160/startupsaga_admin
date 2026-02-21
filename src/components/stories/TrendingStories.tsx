import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { Story } from "@/lib/api";
import { getSafeImageSrc } from "@/lib/images";

interface TrendingStoriesProps {
    stories: Story[];
}

export function TrendingStories({ stories }: TrendingStoriesProps) {
    return (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2 className="font-serif text-xl font-bold text-foreground">Trending This Week</h2>
            </div>

            <div className="flex flex-col gap-6">
                {stories.map((story, index) => {
                    const thumbnailSrc = getSafeImageSrc(story.thumbnail);
                    const isSvgThumbnail = thumbnailSrc.toLowerCase().endsWith(".svg");

                    return (
                        <Link
                            key={story.slug}
                            href={`/stories/${story.slug}`}
                            className="group flex gap-4 items-start"
                        >
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <span className="absolute top-0 left-0 bg-accent/90 text-white text-[10px] font-bold px-1.5 py-0.5 z-10 rounded-br-md">
                                    #{index + 1}
                                </span>
                                <Image
                                    src={thumbnailSrc}
                                    alt={story.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    sizes="80px"
                                    unoptimized={isSvgThumbnail}
                                />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                                <h3 className="font-medium text-foreground text-sm line-clamp-2 leading-snug group-hover:text-accent transition-colors mb-1.5">
                                    {story.title}
                                </h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                    {story.category}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t border-border text-center">
                <Link href="/stories" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
                    View All Stories →
                </Link>
            </div>
        </div>
    );
}
