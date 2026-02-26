"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Building2,
    ArrowUpRight,
    ChevronRight,
    Activity,
    FileText,
    ShieldAlert,
    Clock,
    MapPin,
    Zap,
    LayoutDashboard,
    Inbox,
    Settings,
    Plus,
    RefreshCw,
    Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStoriesCount, getStartupsCount, getSubmissionsCount, getCitiesCount, getCityStats, getActivityStats } from "@/lib/api";
import { motion } from "framer-motion";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

export function DashboardClientContent({ initialCounts }: { initialCounts: any }) {
    const [counts, setCounts] = useState(initialCounts);
    const [cityData, setCityData] = useState<any[]>([]);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState<string>("");

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const [stories, startups, submissions, hubs, cities, activity] = await Promise.all([
                getStoriesCount(),
                getStartupsCount(),
                getSubmissionsCount("pending"),
                getCitiesCount(),
                getCityStats(),
                getActivityStats()
            ]);
            setCounts({ stories, startups, submissions, hubs });
            setCityData(cities);
            setActivityData(activity);
        } catch (error) {
            console.error("Dashboard refresh failed", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const clockInterval = setInterval(updateTime, 60000);
        return () => { clearInterval(interval); clearInterval(clockInterval); };
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };
    const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

    const statsConfig = [
        {
            title: "Total Stories",
            value: counts.stories,
            icon: FileText,
            iconBg: "bg-purple-600",
            iconShadow: "shadow-purple-200",
            valueBg: "bg-purple-50",
            valueText: "text-purple-700",
            path: "/dashboard/stories"
        },
        {
            title: "Active Startups",
            value: counts.startups,
            icon: Building2,
            iconBg: "bg-blue-600",
            iconShadow: "shadow-blue-200",
            valueBg: "bg-blue-50",
            valueText: "text-blue-700",
            path: "/dashboard/startups"
        },
        {
            title: "Cities / Hubs",
            value: counts.hubs,
            icon: MapPin,
            iconBg: "bg-emerald-600",
            iconShadow: "shadow-emerald-200",
            valueBg: "bg-emerald-50",
            valueText: "text-emerald-700",
            path: "/dashboard/hubs"
        },
        {
            title: "Pending Reviews",
            value: counts.submissions,
            icon: ShieldAlert,
            iconBg: "bg-rose-500",
            iconShadow: "shadow-rose-200",
            valueBg: "bg-rose-50",
            valueText: "text-rose-700",
            path: "/dashboard/submissions",
            alert: counts.submissions > 0
        }
    ];

    const quickLinks = [
        { label: "New Story", path: "/dashboard/stories/new", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Add Startup", path: "/dashboard/startups/new", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Media Library", path: "/dashboard/media", icon: ImageIcon, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Reviews", path: "/dashboard/submissions", icon: Inbox, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Settings", path: "/dashboard/settings", icon: Settings, color: "text-zinc-600", bg: "bg-zinc-100" },
    ];

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">StartupSaga</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Admin Dashboard</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live clock */}
                        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
                            <Clock size={13} className="text-zinc-400" />
                            <span className="text-xs font-bold text-zinc-600 tabular-nums" suppressHydrationWarning>
                                {currentTime}
                            </span>
                        </div>

                        {/* Live indicator */}
                        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isRefreshing ? "bg-blue-400" : "bg-emerald-400")} />
                                <span className={cn("relative inline-flex rounded-full h-2 w-2", isRefreshing ? "bg-blue-500" : "bg-emerald-500")} />
                            </span>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">
                                {isRefreshing ? "Syncing" : "Live"}
                            </span>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={fetchData}
                            disabled={isRefreshing}
                            className="h-9 w-9 rounded-xl border border-zinc-200 bg-white text-zinc-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 flex items-center justify-center shadow-sm transition-all disabled:opacity-50"
                            suppressHydrationWarning
                        >
                            <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* ── STAT CARDS ── */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {statsConfig.map((stat) => (
                        <motion.div variants={item} key={stat.title}>
                            <Link href={stat.path}>
                                <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-md", stat.iconBg, stat.iconShadow)}>
                                            <stat.icon size={18} className="text-white" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {stat.alert && (
                                                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                            )}
                                            <ArrowUpRight size={16} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className={cn("text-3xl font-black tabular-nums", stat.valueText)} suppressHydrationWarning>
                                            {stat.value}
                                        </h3>
                                        <p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">{stat.title}</p>
                                    </div>
                                    {/* Subtle bg glow */}
                                    <div className={cn("absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity", stat.valueBg)} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── ACTIVITY CHART ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
                >
                    <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                            <Activity className="h-3 w-3 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Activity Overview</span>
                            <span className="text-[10px] text-zinc-300 ml-3 font-medium">Publication velocity · Last 7 days</span>
                        </div>
                    </div>
                    <div className="p-4 h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorStories" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorStartups" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f4f4f5', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', fontSize: '12px', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="stories" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStories)" />
                                <Area type="monotone" dataKey="startups" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStartups)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* ── BOTTOM ROW: GEO CHART + SIDEBAR ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Geographic Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-rose-500 flex items-center justify-center">
                                <MapPin className="h-3 w-3 text-white" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Geographic Distribution</span>
                                <span className="text-[10px] text-zinc-300 ml-3 font-medium">Top cities by startup count</span>
                            </div>
                        </div>
                        <div className="p-4 h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cityData} margin={{ left: 0, right: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 500, fill: '#a1a1aa' }} axisLine={false} tickLine={false} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} allowDecimals={false} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#fafafa' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', fontSize: '12px', fontWeight: 600 }}
                                    />
                                    <Bar dataKey="value" fill="#9333ea" radius={[5, 5, 0, 0]} barSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Right sidebar: Pending CTA + Quick links */}
                    <div className="space-y-4">

                        {/* Pending submissions CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="relative bg-purple-600 rounded-2xl overflow-hidden p-5 shadow-lg shadow-purple-200">
                                {/* Background glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-700 opacity-80" />
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <ShieldAlert size={100} className="text-white" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                                            <Zap size={16} className="text-amber-300" />
                                        </div>
                                        {counts.submissions > 0 && (
                                            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
                                                Action Required
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-2xl font-black text-white tabular-nums" suppressHydrationWarning>
                                        {counts.submissions}
                                    </h4>
                                    <p className="text-purple-200 text-xs font-medium mb-4">Submissions pending review</p>
                                    <Link href="/dashboard/submissions">
                                        <button
                                            className="w-full py-2 bg-white text-purple-700 rounded-xl text-xs font-black hover:bg-purple-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                            suppressHydrationWarning
                                        >
                                            Review Queue <ChevronRight size={12} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick links */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
                        >
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Plus className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Quick Actions</span>
                            </div>
                            <div className="p-2">
                                {quickLinks.map((link) => (
                                    <Link href={link.path} key={link.label}>
                                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", link.bg)}>
                                                    <link.icon size={13} className={link.color} />
                                                </div>
                                                <span className="text-xs font-semibold text-zinc-600 group-hover:text-zinc-900 transition-colors">{link.label}</span>
                                            </div>
                                            <ChevronRight size={13} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </div>
    );
}
