"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutTemplate, Loader2, Edit2, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export default function DashboardMenusPage() {
    const router = useRouter();
    const [positions, setPositions] = useState<{ id: string; label: string }[]>([]);
    const [menuItems, setMenuItems] = useState<Record<string, any[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCheck = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/navigation/positions/`, { credentials: "include" });
                if (res.ok) {
                    const posData = await res.json();
                    setPositions(posData || []);

                    const validPositions = posData || [];
                    const itemsMap: Record<string, any[]> = {};

                    await Promise.all(validPositions.map(async (pos: any) => {
                        try {
                            const itemRes = await fetch(`${API_BASE_URL}/navigation/?position=${pos.id}`, { credentials: "include" });
                            if (itemRes.ok) {
                                const items = await itemRes.json();
                                itemsMap[pos.id] = items;
                            }
                        } catch (err) {
                            console.error(`Failed to load items for ${pos.id}`, err);
                        }
                    }));

                    setMenuItems(itemsMap);
                }
            } catch (error) {
                console.error("Failed to load positions", error);
                toast.error("Failed to load menu positions");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCheck();
    }, []);

    const filteredPositions = positions.filter(pos => pos.id === 'header');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <Navigation className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Site</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Navigation</h1>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">Manage header, footer, and sidebar navigation menus.</p>
                </div>

                {/* ── MENU POSITIONS ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                            <LayoutTemplate className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Menu Positions</span>
                    </div>

                    {filteredPositions.length > 0 ? (
                        <div className="divide-y divide-zinc-100">
                            {filteredPositions.map((pos) => {
                                const items = menuItems[pos.id] || [];
                                const topLevelItems = items.filter((i: any) => !i.parent).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

                                return (
                                    <div
                                        key={pos.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50 transition-colors group gap-3 cursor-pointer"
                                        onClick={() => router.push(`/dashboard/menus/${pos.id}`)}
                                    >
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 mt-0.5 border border-purple-100">
                                                <LayoutTemplate size={15} />
                                            </div>
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div>
                                                    <h3 className="font-bold text-sm text-zinc-900 leading-none capitalize">{pos.label}</h3>
                                                    <p className="text-[10px] text-zinc-400 mt-0.5 hidden sm:block font-mono">position: {pos.id}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {topLevelItems.length > 0 ? topLevelItems.map((item: any) => (
                                                        <Badge
                                                            key={item.id}
                                                            variant="secondary"
                                                            className="text-[10px] h-5 px-1.5 font-semibold bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border border-zinc-200"
                                                        >
                                                            {item.label}
                                                        </Badge>
                                                    )) : (
                                                        <span className="text-[10px] text-zinc-300 italic">No items yet</span>
                                                    )}
                                                    {items.length > topLevelItems.length && (
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-zinc-300 border-dashed">
                                                            +{items.length - topLevelItems.length} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/menus/${pos.id}`); }}
                                            className="h-9 w-9 rounded-xl border border-zinc-200 hover:border-purple-300 hover:bg-purple-50 text-zinc-400 hover:text-purple-600 flex items-center justify-center shadow-sm transition-all shrink-0 ml-auto sm:ml-0"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-14 text-center flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <LayoutTemplate className="h-6 w-6 text-purple-200" />
                            </div>
                            <p className="text-sm font-bold text-zinc-400">No navigation positions found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
