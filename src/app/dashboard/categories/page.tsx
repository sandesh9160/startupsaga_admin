"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Layers,
    TrendingUp,
    ChevronDown,
    MoreVertical,
    CheckCircle2,
    Zap,
    ArrowUpRight,
    PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCategories, updateCategory, deleteCategory, Category } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getIcon } from "@/lib/icons";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("name");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
            toast.error("Taxonomy sync failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (category: Category) => {
        setCategoryToDelete(category);
    };

    const confirmDelete = async (category: Category) => {
        setCategoryToDelete(null);
        try {
            await deleteCategory(category.slug);
            await loadCategories();
            toast.success("Category removed");
        } catch (err: any) {
            toast.error("Operation failed");
        }
    };

    const filteredCategories = categories
        .filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === "name") return a.name.localeCompare(b.name);
            if (sortOrder === "startups") return (b.startupCount || 0) - (a.startupCount || 0);
            if (sortOrder === "stories") return (b.storyCount || 0) - (a.storyCount || 0);
            return 0;
        });

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <Layers className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Directory</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Categories</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</span>
                            <span className="text-lg font-black text-zinc-900 tabular-nums">{categories.length}</span>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/categories/new")}
                            className="flex items-center gap-2 h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm shadow-purple-200"
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            New Category
                        </button>
                    </div>
                </div>

                {/* ── FILTER BAR — single compact row ── */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search by name or slug…"
                            className="pl-9 h-9 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {isMounted && (
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="h-9 w-36 bg-white border border-slate-200 rounded-xl px-3 text-xs font-semibold text-slate-600 shadow-sm shrink-0">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="name">Alphabetical</SelectItem>
                                <SelectItem value="startups">Most Startups</SelectItem>
                                <SelectItem value="stories">Most Stories</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* --- GRID --- Compact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {isLoading ? (
                        [...Array(8)].map((_, i) => (
                            <Card key={i} className="border-none shadow-sm bg-white rounded-2xl p-4 space-y-3 animate-pulse">
                                <div className="h-16 bg-slate-50 rounded-xl w-full" />
                                <div className="space-y-1.5">
                                    <div className="h-4 bg-slate-50 rounded-md w-2/3" />
                                    <div className="h-3 bg-slate-50 rounded-md w-full" />
                                </div>
                            </Card>
                        ))
                    ) : filteredCategories.map((category) => {
                        const Icon = getIcon(category.iconName || "layers");
                        return (
                            <div key={category.slug} className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-200 transition-all duration-300 overflow-hidden">

                                {/* Card Header */}
                                <div className="relative p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 group-hover:bg-purple-600 transition-all duration-300 shadow-sm">
                                            <Icon size={18} className="text-purple-500 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="bg-slate-100 text-slate-500 border border-slate-200 font-mono text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                            {category.slug}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-0.5">
                                            {category.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed h-[2.5em]">
                                            {category.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>

                                {/* Card Footer / Stats + Actions */}
                                <div className="mt-auto px-4 py-3 flex items-center justify-between border-t border-slate-200 bg-slate-50">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Startups</span>
                                            <span className="text-slate-700 font-bold text-[12px]">{category.startupCount || 0}</span>
                                        </div>
                                        <div className="w-px h-6 bg-slate-200" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Stories</span>
                                            <span className="text-slate-700 font-bold text-[12px]">{category.storyCount || 0}</span>
                                        </div>
                                    </div>

                                    {/* Actions — always visible, colorful */}
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => router.push(`/dashboard/categories/edit/${category.slug}`)}
                                            title="Edit"
                                            className="h-7 w-7 rounded-lg bg-purple-100 hover:bg-purple-600 text-purple-600 hover:text-white transition-all flex items-center justify-center"
                                        >
                                            <Edit size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category)}
                                            title="Delete"
                                            className="h-7 w-7 rounded-lg bg-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white transition-all flex items-center justify-center"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-zinc-100 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-zinc-900 font-serif">
                            Delete Taxonomy
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500 text-sm">
                            Are you sure you want to delete <span className="font-bold text-zinc-900">"{categoryToDelete?.name}"</span>?
                            This may affect startups and stories indexed under this category.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all font-bold text-xs uppercase tracking-widest">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => categoryToDelete && confirmDelete(categoryToDelete)}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all font-bold text-xs uppercase tracking-widest px-6"
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
