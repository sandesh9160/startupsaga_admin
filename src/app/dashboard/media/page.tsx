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

    const filteredMedia = (mediaItems || []).filter(item =>
        (item?.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item?.alt_text?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const groupedMedia = filteredMedia.reduce((acc, item) => {
        const folder = item.folder || 'root';
        if (!acc[folder]) acc[folder] = [];
        acc[folder].push(item);
        return acc;
    }, {} as Record<string, any[]>);

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
                    <div className="space-y-6">
                        {(Object.entries(groupedMedia) as [string, any[]][]).map(([folder, items]) => (
                            <div key={folder} className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
                                <div className="bg-zinc-50/80 border-b border-zinc-200/60 px-5 py-3.5 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-100/50 flex items-center justify-center border border-indigo-100/50 text-indigo-600 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                                    </div>
                                    <h2 className="text-sm font-bold text-zinc-800 tracking-tight">
                                        {folder === 'root' ? 'Root Directory' : '/' + folder}
                                    </h2>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-auto bg-white px-2.5 py-1 rounded-full border border-zinc-200 shadow-sm">
                                        {items.length} files
                                    </span>
                                </div>
                                <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    <AnimatePresence>
                                        {items.map((item, i) => {
                                            const fullUrl = item.url ? (item.url.startsWith("http") ? item.url : `${API_BASE_URL.replace("/api", "")}${item.url}`) : "";
                                            const isImage = !item.file_type && item.type === "image" || (item.file_type && item.file_type.includes("image"));

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="group relative bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                                                >
                                                    {/* Thumbnail Area */}
                                                    <div className="aspect-square bg-zinc-100/80 flex items-center justify-center overflow-hidden relative border-b border-zinc-100">
                                                        {isImage && fullUrl ? (
                                                            <img
                                                                src={fullUrl}
                                                                alt={item.alt_text || item.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            getFileIcon(item.file_type || item.type)
                                                        )}

                                                        {/* Hover Actions */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                className="h-8 w-8 rounded-full bg-white/95 hover:bg-white text-zinc-900 shadow-sm hover:scale-105 transition-transform"
                                                                onClick={() => handleCopyUrl(item.url)}
                                                                title="Copy URL"
                                                            >
                                                                <Copy size={14} />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                className="h-8 w-8 rounded-full shadow-sm hover:scale-105 transition-transform"
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
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 uppercase font-black tracking-wider">
                                                                {(item.file_type || item.type) ? (item.file_type || item.type).split('/')[1] || item.type : 'FILE'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
