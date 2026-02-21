"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Mail,
    Calendar,
    Search,
    Download,
    Trash2,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getNewsletterSubscribers } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadSubscribers = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const data = await getNewsletterSubscribers();
            setSubscribers(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch subscribers");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadSubscribers();
    }, []);

    const filteredSubscribers = subscribers.filter(s =>
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ["Email", "Status", "Joined Date"];
        const rows = filteredSubscribers.map(s => [
            s.email,
            s.is_active ? "Active" : "Inactive",
            s.created_at
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Newsletter</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Subscribers</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total</span>
                            <span className="text-base font-bold text-zinc-900 tabular-nums">{subscribers.length}</span>
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="h-9 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-900 shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                        <button
                            onClick={() => loadSubscribers(true)}
                            disabled={isLoading || isRefreshing}
                            className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                        >
                            <Clock size={14} className={cn(isRefreshing && "animate-spin")} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-3 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by email..."
                            className="pl-9 h-9 border border-slate-200 shadow-sm bg-white rounded-xl text-xs font-medium focus-visible:ring-1 focus-visible:ring-purple-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-around px-4">
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active</p>
                            <p className="text-sm font-bold text-emerald-600">{subscribers.filter(s => s.is_active).length}</p>
                        </div>
                        <div className="h-6 w-px bg-slate-100" />
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Inactive</p>
                            <p className="text-sm font-bold text-slate-500">{subscribers.filter(s => !s.is_active).length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-700 uppercase tracking-wider">Subscriber</th>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-700 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-700 uppercase tracking-wider">Joined On</th>
                                    <th className="px-6 py-3.5 text-[10px] font-black text-slate-700 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence mode="popLayout">
                                    {filteredSubscribers.map((sub, idx) => (
                                        <motion.tr
                                            key={sub.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <Mail size={14} />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-900">{sub.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge className={cn(
                                                    "text-[9px] uppercase font-bold py-0.5 px-2",
                                                    sub.is_active
                                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                                )}>
                                                    {sub.is_active ? "Active" : "Unsubscribed"}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                    <Calendar size={12} />
                                                    {sub.created_at}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {isLoading && (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Clock className="animate-spin text-purple-300" size={28} />
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading subscribers...</p>
                        </div>
                    )}
                    {!isLoading && filteredSubscribers.length === 0 && (
                        <div className="p-20 text-center space-y-3">
                            <Users className="mx-auto text-slate-200" size={48} />
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">No Subscribers Found</h3>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">Try a different search query or check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
