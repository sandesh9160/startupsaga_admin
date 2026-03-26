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
    const [statusUpdating, setStatusUpdating] = useState<Record<number, 'approved' | 'rejected' | 'pending' | null>>({});
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

    const getNextVisibleSubmissions = (
        current: any[],
        id: number,
        nextStatus: 'approved' | 'rejected' | 'pending'
    ) => {
        if (statusFilter !== 'all' && statusFilter !== nextStatus) {
            return current.filter((submission) => submission.id !== id);
        }

        return current.map((submission) =>
            submission.id === id ? { ...submission, status: nextStatus } : submission
        );
    };

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected' | 'pending') => {
        const previousSubmissions = submissions;
        setStatusUpdating((prev) => ({ ...prev, [id]: status }));
        setSubmissions((prev) => getNextVisibleSubmissions(prev, id, status));

        try {
            await updateSubmissionStatus(id, status);
            loadSubmissions(false);
            toast.success(`Entry ${status === 'approved' ? 'Verified' : 'Archived'}`);
        } catch (err) {
            setSubmissions(previousSubmissions);
            console.error(err);
            toast.error("Operation failed");
        } finally {
            setStatusUpdating((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
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
            <div className="max-w-[1480px] mx-auto p-4 lg:p-8 space-y-8 flex flex-col min-h-[85vh]">

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
                <div
                    className="grid gap-5 items-stretch"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 320px))" }}
                >
                    {isLoading && submissions.length === 0 ? (
                        [...Array(16)].map((_, i) => (
                            <div key={i} className="h-[340px] rounded-[24px] bg-white border border-slate-100 shadow-sm animate-pulse" />
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
                                (() => {
                                    const activeStatusUpdate = statusUpdating[submission.id];
                                    const isStatusBusy = Boolean(activeStatusUpdate);

                                    return (
                                <motion.div
                                    key={submission.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="group/card relative flex w-full min-h-[340px] min-w-0 self-stretch flex-col bg-white rounded-[24px] border border-zinc-200 shadow-[0_16px_40px_rgba(15,23,42,0.06)] hover:border-zinc-300 hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                                    style={{ width: "100%", minHeight: 340 }}
                                >
                                    <div className="relative h-32 bg-zinc-50 flex items-center justify-center overflow-hidden">
                                        {(submission.thumbnail || submission.logo) ? (
                                            <img
                                                src={getSafeImageSrc(submission.thumbnail || submission.logo)}
                                                alt={submission.startup_name}
                                                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-zinc-50">
                                                <Building2 size={34} className="text-zinc-200" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/15 to-transparent" />

                                        <div className="absolute top-4 left-4 flex flex-col gap-1">
                                            <Badge className={cn(
                                                "w-fit border-none font-bold text-[10px] uppercase tracking-[0.2em] px-3 py-1 shadow-sm rounded-full",
                                                submission.status === 'pending'
                                                    ? "bg-amber-500 text-white"
                                                    : submission.status === 'approved'
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-rose-500 text-white"
                                            )}>
                                                {submission.status}
                                            </Badge>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <h3 className="text-base font-semibold tracking-tight line-clamp-2 drop-shadow-sm leading-tight">
                                                {submission.startup_name}
                                            </h3>
                                            <p className="mt-1 text-xs font-medium text-white/80 truncate">
                                                {submission.founder_name || "Anonymous founder"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col p-4 gap-3">
                                        <div className="flex items-center justify-between gap-3 overflow-hidden">
                                            <span className="text-[13px] font-semibold text-zinc-700 truncate flex items-center gap-2">
                                                <User size={14} className="text-zinc-400" />
                                                {submission.founder_name || "Anonymous"}
                                            </span>
                                            <span className="text-xs font-medium text-zinc-400 shrink-0">
                                                {new Date(submission.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 min-h-[22px] overflow-hidden">
                                            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                                {submission.category || "No Category"}
                                            </span>
                                            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 truncate">
                                                <MapPin size={12} />
                                                {submission.city || "Remote"}
                                            </span>
                                        </div>

                                        <div className="mt-auto pt-3 border-t border-zinc-100 space-y-2.5">
                                            {submission.status === 'pending' ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(submission.id, 'approved')}
                                                        disabled={isStatusBusy}
                                                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {activeStatusUpdate === 'approved' ? <Clock size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                        {activeStatusUpdate === 'approved' ? 'Approving' : 'Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                                        disabled={isStatusBusy}
                                                        className="h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[9px] font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                        title="Reject"
                                                    >
                                                        {activeStatusUpdate === 'rejected' ? <Clock size={14} className="animate-spin" /> : <XCircle size={14} />}
                                                        {activeStatusUpdate === 'rejected' ? 'Rejecting' : 'Reject'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(submission.id, submission.status === 'approved' ? 'pending' : 'approved')}
                                                        disabled={isStatusBusy}
                                                        className={cn(
                                                            "h-10 rounded-xl text-[9px] font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-all border disabled:opacity-60 disabled:cursor-not-allowed",
                                                            submission.status === 'approved'
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                                : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                                                        )}
                                                    >
                                                        {activeStatusUpdate === 'approved' || activeStatusUpdate === 'pending'
                                                            ? <Clock size={14} className="animate-spin" />
                                                            : <CheckCircle2 size={14} />}
                                                        {activeStatusUpdate === 'approved'
                                                            ? 'Approving'
                                                            : activeStatusUpdate === 'pending'
                                                                ? 'Moving'
                                                                : submission.status === 'approved'
                                                                    ? 'Approved'
                                                                    : 'Pending'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                                        disabled={isStatusBusy}
                                                        className="h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[9px] font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {activeStatusUpdate === 'rejected' ? <Clock size={14} className="animate-spin" /> : <XCircle size={14} />}
                                                        {activeStatusUpdate === 'rejected' ? 'Rejecting' : 'Reject'}
                                                    </button>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=startup`)}
                                                    className="h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[8px] font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-1 transition-all shadow-sm"
                                                    title="Create Startup"
                                                >
                                                    <Building2 size={14} />
                                                    Startup
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=submission`)}
                                                    className="h-10 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-[8px] font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-1 transition-all"
                                                    title="Edit Submission"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}&type=story`)}
                                                    className="h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[8px] font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-1 transition-all"
                                                    title="Write Feature"
                                                >
                                                    <FileText size={14} />
                                                    Write
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                    );
                                })()
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
