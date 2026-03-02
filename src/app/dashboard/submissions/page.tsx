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
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-8">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-sm">
                            <Inbox className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider mb-0">Queue</p>
                            <h1 className="text-base font-medium tracking-tight text-zinc-900 capitalize">{statusFilter} Submissions</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {pendingCount > 0 && (
                            <div className="hidden sm:flex flex-col items-end mr-1">
                                <span className="text-[8px] font-medium text-amber-500 uppercase tracking-wider leading-none">Pending</span>
                                <span className="text-xs font-medium text-zinc-900 tabular-nums">{pendingCount} New</span>
                            </div>
                        )}
                        <button
                            onClick={() => loadSubmissions(true)}
                            disabled={isLoading || isRefreshing}
                            className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-medium transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Clock size={12} className={cn(isRefreshing && "animate-spin")} />
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
                    {isLoading && submissions.length === 0 ? (
                        [...Array(16)].map((_, i) => (
                            <div key={i} className="h-56 rounded-lg bg-white border border-slate-100 shadow-sm animate-pulse" />
                        ))
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center rounded-xl bg-zinc-50 border border-dashed border-zinc-200">
                            <Inbox size={32} className="text-zinc-200 mb-2" />
                            <h3 className="text-sm font-normal text-zinc-900 mb-0.5">
                                Empty Queue
                            </h3>
                            <p className="text-zinc-500 text-[11px] max-w-xs font-normal">No applications match filters.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredSubmissions.map((submission) => (
                                <motion.div
                                    key={submission.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="group/card relative flex flex-col bg-white rounded-lg border border-zinc-100 shadow-sm hover:border-zinc-300 transition-all duration-150 overflow-hidden"
                                >
                                    {/* Ultra Mini Header */}
                                    <div className="relative h-20 bg-zinc-50 flex items-center justify-center overflow-hidden">
                                        {submission.thumbnail ? (
                                            <img
                                                src={getSafeImageSrc(submission.thumbnail)}
                                                alt={submission.startup_name}
                                                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-zinc-50">
                                                <Building2 size={24} className="text-zinc-200" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                        {/* Status - Floating micro */}
                                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                                            <Badge className={cn(
                                                "w-fit border-none font-normal text-[7px] uppercase tracking-wider px-1 py-0 shadow-sm",
                                                submission.status === 'pending'
                                                    ? "bg-amber-500 text-white"
                                                    : submission.status === 'approved'
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-rose-500 text-white"
                                            )}>
                                                {submission.status}
                                            </Badge>
                                        </div>

                                        {/* Logo - Floating smaller */}
                                        <div className="absolute top-1.5 right-1.5">
                                            {submission.logo ? (
                                                <div className="h-6 w-6 rounded bg-white p-0.5 shadow-sm border border-white/50">
                                                    <img
                                                        src={getSafeImageSrc(submission.logo)}
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-6 w-6 rounded bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                                    <Sparkles className="text-white h-2.5 w-2.5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Minimal Identity Info on Header */}
                                        <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                                            <h3 className="text-[10px] font-normal tracking-tight line-clamp-1 drop-shadow-sm">
                                                {submission.startup_name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Compact Action Layout */}
                                    <div className="p-1.5 flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between gap-1 overflow-hidden">
                                            <span className="text-[9px] font-normal text-zinc-600 truncate">{submission.founder_name || "Anonymous"}</span>
                                            <span className="text-[8px] font-normal text-zinc-400 shrink-0">
                                                {new Date(submission.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Metadata Row */}
                                        <div className="flex items-center gap-1 min-h-[12px] overflow-hidden">
                                            <span className="text-[8px] font-normal text-zinc-400 uppercase tracking-tighter truncate">
                                                {submission.category || "No Category"}
                                            </span>
                                            <span className="text-zinc-200">|</span>
                                            <span className="text-[8px] font-normal text-zinc-400 flex items-center gap-0.5 truncate">
                                                <MapPin size={7} />
                                                {submission.city || "Remote"}
                                            </span>
                                        </div>

                                        {/* Ultra Compact Actions */}
                                        <div className="flex items-center gap-1 pt-1.5 border-t border-zinc-50">
                                            {submission.status === 'pending' ? (
                                                <div className="flex gap-1 flex-1">
                                                    <button
                                                        onClick={() => handleStatusUpdate(submission.id, 'approved')}
                                                        className="flex-1 h-6 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-normal uppercase tracking-tight flex items-center justify-center gap-1 transition-all"
                                                    >
                                                        <CheckCircle2 size={10} />
                                                        Verify
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                                        className="h-6 w-6 rounded bg-zinc-50 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 flex items-center justify-center transition-all border border-zinc-100"
                                                        title="Dismiss"
                                                    >
                                                        <XCircle size={10} />
                                                    </button>
                                                </div>
                                            ) : submission.status === 'approved' && (
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=startup`)}
                                                    className="flex-1 h-6 rounded bg-purple-600 hover:bg-purple-700 text-white text-[8px] font-normal uppercase tracking-tight flex items-center justify-center gap-1 transition-all"
                                                >
                                                    <Building2 size={10} />
                                                    Base
                                                </button>
                                            )}

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=submission`)}
                                                    className="h-6 w-6 rounded bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border border-zinc-100 flex items-center justify-center transition-all"
                                                    title="Refine Data"
                                                >
                                                    <Edit size={10} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=story`)}
                                                    className="h-6 w-6 rounded bg-zinc-50 hover:bg-indigo-50 text-indigo-600 border border-zinc-100 flex items-center justify-center transition-all"
                                                    title="Write Feature"
                                                >
                                                    <FileText size={10} />
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
