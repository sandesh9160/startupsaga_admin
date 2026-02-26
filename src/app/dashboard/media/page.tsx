"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus,
    Search,
    Trash2,
    Image as ImageIcon,
    Upload,
    Loader2,
    X,
    Copy,
    Check,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { mediaApi, MediaItem } from "@/lib/api";
import { getSafeImageSrc } from "@/lib/images";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MediaPage() {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMedia();
    }, []);

    const loadMedia = async () => {
        setIsLoading(true);
        try {
            const data = await mediaApi.list();
            setMediaItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load media", err);
            toast.error("Failed to sync media library");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${files.length} file(s)...`);

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);
                await mediaApi.upload(formData);
            }
            toast.success("Upload complete", { id: toastId });
            loadMedia();
        } catch (err) {
            console.error("Upload failed", err);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (item: MediaItem) => {
        if (!confirm(`Permanently delete ${item.file_name}?`)) return;

        try {
            await mediaApi.delete(item.id);
            setMediaItems(mediaItems.filter((i) => i.id !== item.id));
            toast.success("Item removed");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const copyToClipboard = (url: string, id: number) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.info("URL copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredMedia = mediaItems.filter((item) =>
        (item.file_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
                            <ImageIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Assets</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Media Library</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Files</span>
                            <span className="text-lg font-black text-zinc-900 tabular-nums">{mediaItems.length}</span>
                        </div>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 h-10 px-5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm shadow-orange-200"
                        >
                            {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} strokeWidth={2.5} />}
                            {isUploading ? "Uploading..." : "Upload Assets"}
                        </button>
                    </div>
                </div>

                {/* ── FILTER BAR ── */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by file name..."
                            className="pl-10 h-10 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 gap-2 text-xs font-bold text-slate-600">
                        <Filter size={14} /> Filters
                    </Button>
                </div>

                {/* ── GRID ── */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-zinc-50 animate-pulse border border-zinc-100" />
                        ))}
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-50/50 rounded-[32px] border-2 border-dashed border-zinc-100">
                        <div className="h-16 w-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6">
                            <ImageIcon size={28} className="text-zinc-200" />
                        </div>
                        <p className="text-sm font-bold text-zinc-500">No media assets found</p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">Upload your first image to get started with your journey.</p>
                        <Button
                            variant="link"
                            className="mt-4 text-orange-600 font-bold text-xs"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Start Uploading
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredMedia.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative"
                                >
                                    <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-orange-500/50">
                                        <img
                                            src={getSafeImageSrc(item.file)}
                                            alt={item.file_name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => copyToClipboard(item.file, item.id)}
                                                className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-zinc-900 backdrop-blur-md transition-all flex items-center justify-center border border-white/20"
                                                title="Copy Link"
                                            >
                                                {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="h-10 w-10 rounded-xl bg-white/10 hover:bg-rose-500 text-white backdrop-blur-md transition-all flex items-center justify-center border border-white/20"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info Strip */}
                                    <div className="mt-2 px-1">
                                        <p className="text-[11px] font-bold text-zinc-900 truncate">
                                            {item.file_name}
                                        </p>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '--'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
