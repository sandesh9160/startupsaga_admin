"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import {
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    Mail,
    Inbox,
    Trash2,
    Edit,
    FileText,
    Globe,
    User,
    Sparkles,
    MapPin,
    Calendar,
    Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    // DialogHeader,
    DialogTitle,
    // DialogFooter,
} from "@/components/ui/dialog";
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
import { getSubmissions, updateSubmissionStatus, deleteSubmission, updateSubmission, getSubmissionsPage, PaginatedResponse, Submission } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSafeImageSrc } from "@/lib/images";
import { DashboardPagination } from "@/components/dashboard/Pagination";

export default function SubmissionsPage() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [submissionToDelete, setSubmissionToDelete] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pagination, setPagination] = useState<PaginatedResponse<Submission> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    const loadSubmissions = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const data = await getSubmissionsPage({
                page: currentPage,
                page_size: pageSize,
                search: searchQuery,
                status: statusFilter
            });
            setSubmissions(data.results);
            setPagination(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch submissions");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, [currentPage, searchQuery, statusFilter]);

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected' | 'pending') => {
        try {
            await updateSubmissionStatus(id, status);
            loadSubmissions(false);
            toast.success(`Entry ${status === 'approved' ? 'Verified' : 'Archived'}`);
        } catch (err) {
            console.error(err);
            toast.error("Operation failed");
        }
    };

    const handleDelete = (id: number) => {
        setSubmissionToDelete(id);
    };

    const confirmDelete = async (id: number) => {
        try {
            await deleteSubmission(id);
            setSubmissions(prev => prev.filter(s => s.id !== id));
            toast.success("Submission removed");
        } catch (err) {
            toast.error("Delete failed");
        } finally {
            setSubmissionToDelete(null);
        }
    };

    const pendingCount = submissions.filter(s => s.status === 'pending').length;

    const filteredSubmissions = submissions;

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <Inbox className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Queue</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900 capitalize">{statusFilter} Submissions</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {pendingCount > 0 && (
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">Pending</span>
                                <span className="text-base font-bold text-zinc-900 tabular-nums">{pendingCount} New</span>
                            </div>
                        )}
                        <button
                            onClick={() => loadSubmissions(true)}
                            disabled={isLoading || isRefreshing}
                            className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Clock size={13} className={cn(isRefreshing && "animate-spin")} />
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search applications..."
                            className="pl-9 h-10 border-none shadow-sm bg-white rounded-xl text-xs font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                        {(['all', 'approved', 'pending', 'rejected'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                    statusFilter === status
                                        ? "bg-purple-600 text-white shadow-sm"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-10">
                    {isLoading && submissions.length === 0 ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-[450px] rounded-[2.5rem] bg-white border border-slate-100 shadow-sm animate-pulse" />
                        ))
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-32 text-center rounded-[3rem] bg-zinc-50 border border-dashed border-zinc-200 shadow-sm">
                            <Inbox size={64} className="text-zinc-200 mb-6" />
                            <h3 className="text-2xl font-bold text-zinc-900 mb-2">
                                Empty Queue
                            </h3>
                            <p className="text-zinc-500 max-w-xs">No startup applications match your current filters.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredSubmissions.map((submission) => (
                                <motion.div
                                    key={submission.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group/card relative flex flex-col bg-white rounded-[2.5rem] border border-zinc-200/60 shadow-md hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-700 overflow-hidden"
                                >
                                    {/* Substantial Card Header - Much taller */}
                                    <div className="relative h-64 bg-zinc-100 flex items-center justify-center overflow-hidden">
                                        {submission.thumbnail ? (
                                            <img
                                                src={getSafeImageSrc(submission.thumbnail)}
                                                alt={submission.startup_name}
                                                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-[1500ms]"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-zinc-50">
                                                <Building2 size={80} className="text-zinc-100" />
                                            </div>
                                        )}

                                        {/* Premium Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90" />

                                        {/* Status & Identifiers */}
                                        <div className="absolute top-6 left-6 flex flex-col gap-3">
                                            <Badge className={cn(
                                                "w-fit backdrop-blur-md border-none font-black text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 shadow-2xl",
                                                submission.status === 'pending'
                                                    ? "bg-orange-500 text-white animate-pulse"
                                                    : submission.status === 'approved'
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-rose-500 text-white"
                                            )}>
                                                {submission.status}
                                            </Badge>
                                            {submission.category && (
                                                <div className="w-fit px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                                    {submission.category}
                                                </div>
                                            )}
                                        </div>

                                        {/* Floating Actions/Logo */}
                                        <div className="absolute top-6 right-6">
                                            {submission.logo ? (
                                                <div className="h-16 w-16 rounded-[1.25rem] bg-white p-2.5 shadow-2xl border border-white/50 group-hover/card:rotate-3 transition-all duration-500">
                                                    <img
                                                        src={getSafeImageSrc(submission.logo)}
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 rounded-[1.25rem] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                                    <Sparkles className="text-white h-7 w-7" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Main Identity Overlay */}
                                        <div className="absolute bottom-8 left-8 right-8 text-white">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-3xl font-black tracking-tighter drop-shadow-lg line-clamp-1">
                                                    {submission.startup_name}
                                                </h3>
                                                {submission.og_image && <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg"><Globe size={12} className="text-white" /></div>}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 text-zinc-300">
                                                    <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center">
                                                        <Mail size={14} />
                                                    </div>
                                                    <span className="text-sm font-semibold tracking-tight">{submission.email}</span>
                                                </div>
                                                {submission.city && (
                                                    <div className="flex items-center gap-2 text-zinc-300">
                                                        <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <span className="text-sm font-semibold tracking-tight">{submission.city}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comprehensive Action Layout */}
                                    <div className="p-8 bg-white flex flex-col gap-8">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                                                    <User className="h-6 w-6 text-zinc-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.15em]">Founder Identity</span>
                                                    <span className="text-lg font-bold text-zinc-900 leading-tight">{submission.founder_name || "Anonymous Founder"}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-right">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.15em]">Cycle Phase</span>
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Calendar size={14} className="text-zinc-400" />
                                                        <span className="text-sm font-bold text-zinc-700">
                                                            {new Date(submission.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Large, Neat Interactive Buttons */}
                                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-50">
                                            <div className="flex gap-3 flex-1 min-w-[300px]">
                                                {submission.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(submission.id, 'approved')}
                                                            className="flex-1 h-16 rounded-[1.25rem] bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 group/btn"
                                                        >
                                                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                                                <CheckCircle2 size={20} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-[11px] font-black uppercase tracking-widest">Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                                            className="flex-1 h-16 rounded-[1.25rem] bg-zinc-900 hover:bg-rose-600 text-white shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3 transition-all active:scale-95 group/btn"
                                                        >
                                                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                                                <XCircle size={20} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-[11px] font-black uppercase tracking-widest">Dismiss</span>
                                                        </button>
                                                    </>
                                                )}

                                                {submission.status === 'approved' && (
                                                    <button
                                                        onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=startup`)}
                                                        className="flex-1 h-16 rounded-[1.25rem] bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/20 flex items-center justify-center gap-4 transition-all active:scale-95 group/btn"
                                                    >
                                                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                                            <Building2 size={24} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest">Build Venture Profile</span>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex gap-3 ml-auto">
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=submission`)}
                                                    className="h-16 w-16 rounded-[1.25rem] bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm"
                                                    title="Refine Data"
                                                >
                                                    <Edit size={22} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=story`)}
                                                    className="h-16 w-16 rounded-[1.25rem] bg-zinc-50 hover:bg-indigo-50 text-indigo-600 border border-zinc-200 flex items-center justify-center transition-all hover:-translate-y-1 shadow-sm"
                                                    title="Write Feature"
                                                >
                                                    <FileText size={22} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(submission.id)}
                                                    className="h-16 w-16 rounded-[1.25rem] bg-white hover:bg-rose-50 text-zinc-300 hover:text-rose-600 border border-zinc-200 flex items-center justify-center transition-all hover:-translate-y-1"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={22} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {pagination && pagination.total_pages && pagination.total_pages > 1 && (
                    <DashboardPagination
                        currentPage={currentPage}
                        totalPages={pagination.total_pages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>



            <AlertDialog open={!!submissionToDelete} onOpenChange={(open) => !open && setSubmissionToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-zinc-100 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-zinc-900 font-serif">
                            Permanently Delete?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500 text-sm">
                            This action will remove the submission permanently from your records. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all font-bold text-xs uppercase tracking-widest">
                            Keep it
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => submissionToDelete && confirmDelete(submissionToDelete)}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all font-bold text-xs uppercase tracking-widest px-6"
                        >
                            Delete Submission
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
