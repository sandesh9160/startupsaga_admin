"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Image as ImageIcon,
    ExternalLink,
    Eye,
    EyeOff
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { BannerEditor } from "@/components/admin/BannerEditor";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BannersPage() {
    const [banners, setBanners] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Record<string, unknown> | null>(null);

    const loadBanners = async () => {
        setLoading(true);
        try {
            const data = await fetchAPI("/sections/?page=homepage");
            // Filter only banner types
            setBanners(data.filter((s: Record<string, unknown>) => s.section_type === 'banner' || s.section_type === 'hero_banner'));
        } catch (error) {
            console.error("Failed to load banners", error);
            toast.error("Failed to load banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sections/${id}/delete/`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Banner deleted");
                loadBanners();
            } else {
                toast.error("Deletion failed");
            }
        } catch {
            toast.error("Error deleting banner");
        }
    };

    const handleToggleStatus = async (banner: Record<string, unknown>) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sections/${banner.id}/update/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !banner.is_active })
            });
            if (res.ok) {
                toast.success(`Banner ${!banner.is_active ? 'enabled' : 'disabled'}`);
                loadBanners();
            }
        } catch {
            toast.error("Status update failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Homepage Banners</h1>
                    <p className="text-sm text-muted-foreground">Manage promotional banners and hero announcements on the homepage.</p>
                </div>
                <Button onClick={() => { setEditingBanner(null); setIsEditorOpen(true); }} className="gap-2 bg-[#FF5722] hover:bg-[#FF5722]/90 h-10 px-6 rounded-xl font-bold">
                    <Plus className="h-4 w-4" /> Add Banner
                </Button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-muted-foreground animate-pulse">Loading banners...</div>
            ) : banners.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center justify-center bg-zinc-50/50">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-zinc-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-1">No banners found</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-6">Create your first promotional banner to engage your visitors.</p>
                    <Button variant="outline" onClick={() => setIsEditorOpen(true)} className="rounded-xl font-bold">
                        Add My First Banner
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {banners.map((banner, index) => (
                        <Card key={(banner.id as string | number) || index} className="overflow-hidden group border-zinc-200/60 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-center">
                                {/* Preview Thumbnail */}
                                <div className="w-full md:w-48 h-32 bg-zinc-100 overflow-hidden relative shrink-0">
                                    {banner.image ? (
                                        <Image
                                            src={(banner.image as string).startsWith('http') ? (banner.image as string) : `${process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000'}${(banner.image as string)}`}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                                            <ImageIcon className="h-6 w-6 text-zinc-400" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2">
                                        <Badge className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md ${banner.is_active ? 'bg-[#FF5722] text-white' : 'bg-zinc-400 text-white'}`}>
                                            {banner.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="flex-1 p-5 md:px-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5722]">{(banner.subtitle as string) || "Promotion"}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-zinc-900 leading-tight">{banner.title as string}</h3>
                                            <p className="text-xs text-zinc-500 line-clamp-1 max-w-md">{banner.description as string}</p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-400 hover:text-zinc-900"
                                                onClick={() => handleToggleStatus(banner)}
                                                title={banner.is_active ? "Deactivate" : "Activate"}
                                            >
                                                {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-400 hover:text-zinc-900"
                                                onClick={() => { setEditingBanner(banner); setIsEditorOpen(true); }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                    <DropdownMenuItem asChild>
                                                        <Link href="/" target="_blank" className="cursor-pointer flex items-center gap-2">
                                                            <ExternalLink className="h-3.5 w-3.5" /> View on Site
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-rose-600 cursor-pointer flex items-center gap-2"
                                                        onClick={() => handleDelete(banner.id as number)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" /> Delete Banner
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 border-r pr-4">
                                                Order: <span className="text-zinc-900">{banner.order as number}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                Link: <span className="text-blue-500 lowercase font-medium">{(banner.link_url as string) || "None"}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {isEditorOpen && (
                <BannerEditor
                    banner={editingBanner}
                    onClose={() => setIsEditorOpen(false)}
                    onSaved={() => { setIsEditorOpen(false); loadBanners(); }}
                />
            )}
        </div>
    );
}
