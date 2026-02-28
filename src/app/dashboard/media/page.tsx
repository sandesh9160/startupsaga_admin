"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Image as ImageIcon, Upload, Search, FileText, Video, Loader2, Copy, Trash2
} from "lucide-react";
import { getMediaItems, API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function MediaLibraryPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const data = await getMediaItems();
            setMediaItems(data || []);
        } catch (error) {
            toast.error("Failed to load media items");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyUrl = (url: string) => {
        const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL.replace("/api", "")}${url}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("URL copied to clipboard");
    };

    const filteredMedia = mediaItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.alt_text && item.alt_text.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getFileIcon = (fileType: string) => {
        if (!fileType) return <ImageIcon className="text-zinc-400" size={24} />;
        if (fileType.includes("image")) return <ImageIcon className="text-blue-500" size={24} />;
        if (fileType.includes("video")) return <Video className="text-purple-500" size={24} />;
        return <FileText className="text-zinc-400" size={24} />;
    };

    return (
        <div className="min-h-screen bg-zinc-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                        <ImageIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Media Library</h1>
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mt-0.5">Manage your digital assets</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group max-w-xs w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="Search media..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl h-10 text-sm font-medium"
                        />
                    </div>
                    <Button className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm gap-2 shadow-sm transition-all active:scale-95">
                        <Upload size={16} />
                        Upload
                    </Button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white rounded-2xl border border-zinc-200/60 shadow-sm">
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Media...</p>
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-2xl border border-dashed border-zinc-300 shadow-sm">
                        <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-zinc-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-zinc-600">No media files found</p>
                            <p className="text-xs font-medium text-zinc-400 mt-1">Upload your first image to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <AnimatePresence>
                            {filteredMedia.map((item, i) => {
                                const fullUrl = item.url ? (item.url.startsWith("http") ? item.url : `${API_BASE_URL.replace("/api", "")}${item.url}`) : "";
                                const isImage = !item.file_type || item.file_type.includes("image");

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                                    >
                                        {/* Thumbnail Area */}
                                        <div className="aspect-square bg-zinc-100 flex items-center justify-center overflow-hidden relative border-b border-zinc-100">
                                            {isImage && fullUrl ? (
                                                <img
                                                    src={fullUrl}
                                                    alt={item.alt_text || item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                getFileIcon(item.file_type)
                                            )}

                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-zinc-900 shadow-sm"
                                                    onClick={() => handleCopyUrl(item.url)}
                                                    title="Copy URL"
                                                >
                                                    <Copy size={14} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-8 w-8 rounded-full shadow-sm"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="p-3">
                                            <h3 className="text-xs font-semibold text-zinc-900 truncate" title={item.title}>
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400">
                                                    {item.file_type ? item.file_type.split('/')[1] : 'IMG'}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
