"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    // Building2,
    Mail,
    Inbox,
    Trash2,
    Edit,
    FilePlus,
    Clock3,
    Globe,
    Plus,
    ImageIcon,
    Building,
    User,
    ChevronRight,
    Sparkles,
    Layout,
    Save,
    MapPin,
    Tag,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

    // Edit Modal State
    const [editingSubmission, setEditingSubmission] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        startup_name: "",
        founder_name: "",
        email: "",
        website: "",
        description: "",
        city: "",
        category: "",
        full_story: "",
        funding_stage: "",
        logo: "" as string | null,
        thumbnail: "" as string | null,
        og_image: "" as string | null
    });

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

    const handleEditClick = (submission: any) => {
        setEditingSubmission(submission);
        setEditForm({
            startup_name: submission.startup_name || "",
            founder_name: submission.founder_name || "",
            email: submission.email || "",
            website: submission.website || "",
            description: submission.description || "",
            city: submission.city || "",
            category: submission.category || "",
            full_story: submission.full_story || "",
            funding_stage: submission.funding_stage || "Early Stage",
            logo: submission.logo || null,
            thumbnail: submission.thumbnail || null,
            og_image: submission.og_image || null
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'thumbnail' | 'og_image') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingSubmission) return;
        setIsSaving(true);
        try {
            await updateSubmission(editingSubmission.id, editForm);
            toast.success("Submission updated successfully");
            setEditingSubmission(null);
            loadSubmissions(false);
        } catch (err) {
            toast.error("Failed to update submission");
        } finally {
            setIsSaving(false);
        }
    };

    const statusPriority: Record<string, number> = {
        approved: 1,
        pending: 2,
        rejected: 3
    };

    const filteredSubmissions = submissions;

    const pendingCount = submissions.filter(s => s.status === 'pending').length;

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {isLoading && submissions.length === 0 ? (
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
                        ))
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-20 text-center rounded-3xl bg-white border border-slate-100 shadow-sm">
                            <Inbox size={32} className="text-slate-300 mb-4" />
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
                                No Applications
                            </h3>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredSubmissions.map((submission) => (
                                <motion.div
                                    key={submission.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="group/card relative flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                                >
                                    {/* Card Header Section - Now matches Hubs style */}
                                    <div className="relative h-32 bg-slate-100 flex items-center justify-center overflow-hidden">
                                        {submission.thumbnail ? (
                                            <img
                                                src={getSafeImageSrc(submission.thumbnail)}
                                                alt={submission.startup_name}
                                                className="h-full w-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                                            />
                                        ) : submission.logo ? (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center p-6">
                                                <img
                                                    src={getSafeImageSrc(submission.logo)}
                                                    alt={submission.startup_name}
                                                    className="max-h-full max-w-full object-contain group-hover/card:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-300 transition-colors duration-500 group-hover/card:bg-slate-100">
                                                <Building size={32} className="opacity-20" />
                                            </div>
                                        )}

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            <Badge className={cn(
                                                "backdrop-blur-md border-none font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 shadow-sm",
                                                submission.status === 'pending'
                                                    ? "bg-amber-500/90 text-white"
                                                    : submission.status === 'approved'
                                                        ? "bg-emerald-500/90 text-white"
                                                        : "bg-rose-500/90 text-white"
                                            )}>
                                                {submission.status}
                                            </Badge>
                                        </div>

                                        {/* Logo Inset if thumbnail exists */}
                                        {submission.thumbnail && submission.logo && (
                                            <div className="absolute top-3 left-3 h-8 w-8 rounded-lg bg-white/95 backdrop-blur-sm p-1 shadow-lg border border-white/50 group-hover/card:scale-105 transition-transform">
                                                <img
                                                    src={getSafeImageSrc(submission.logo)}
                                                    alt=""
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        )}

                                        {/* OG Image Indicator if present */}
                                        {submission.og_image && (
                                            <div className="absolute top-10 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest shadow-lg border border-indigo-400/30">
                                                <Globe size={8} /> OG Active
                                            </div>
                                        )}

                                        {/* Bottom Content Over Image */}
                                        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                                            <h3 className="text-sm font-serif font-medium tracking-tight mb-0.5 group-hover/card:translate-x-0.5 transition-transform overflow-hidden whitespace-nowrap text-overflow-ellipsis">
                                                {submission.startup_name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 opacity-80 group-hover/card:opacity-100 transition-opacity">
                                                <Mail size={10} className="shrink-0" />
                                                <span className="text-[10px] font-medium truncate">{submission.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body Section for Actions */}
                                    <div className="px-4 py-3 bg-white flex items-center justify-between border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest">Received</span>
                                            <span className="text-[10px] font-bold text-slate-600">
                                                {new Date(submission.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex gap-1">
                                            {submission.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(submission.id, 'approved')}
                                                        className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 flex items-center justify-center transition-all shadow-sm"
                                                        title="Verify Startup"
                                                    >
                                                        <CheckCircle2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                                        className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100 flex items-center justify-center transition-all shadow-sm"
                                                        title="Archive"
                                                    >
                                                        <XCircle size={12} />
                                                    </button>
                                                </>
                                            )}
                                            {submission.status === 'approved' && (submission as any).startup_slug ? (
                                                <button
                                                    onClick={() => router.push(`/dashboard/startups/${(submission as any).startup_slug}/edit`)}
                                                    className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 flex items-center justify-center transition-all shadow-sm"
                                                    title="Configure Startup Profile"
                                                >
                                                    <Building size={12} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditClick(submission)}
                                                    className="h-7 w-7 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white border border-slate-200 flex items-center justify-center transition-all shadow-sm"
                                                    title="Edit Details"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => router.push(`/dashboard/stories/new?submission=${submission.id}`)}
                                                className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 flex items-center justify-center transition-all shadow-sm"
                                                title="Write Story"
                                            >
                                                <FilePlus size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(submission.id)}
                                                className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white border border-slate-200 flex items-center justify-center transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
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

            {/* EDIT SUBMISSION MODAL */}
            <Dialog open={!!editingSubmission} onOpenChange={(open) => !open && setEditingSubmission(null)}>
                <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-[1.5rem] border-none shadow-2xl p-0 bg-white">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/30">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                                <Edit className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold tracking-tight text-zinc-900">Edit Submission</DialogTitle>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Image Assets Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon className="h-3.5 w-3.5" /> Logo
                                </Label>
                                <div
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                    className="h-24 w-24 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center cursor-pointer group hover:bg-white hover:border-zinc-300 transition-all overflow-hidden relative shadow-sm"
                                >
                                    {editForm.logo ? (
                                        <img src={getSafeImageSrc(editForm.logo)} alt="Logo" className="w-full h-full object-contain p-3" />
                                    ) : (
                                        <Plus className="h-4 w-4 text-zinc-300" />
                                    )}
                                    <input id="logo-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon className="h-3.5 w-3.5" /> Thumbnail
                                </Label>
                                <div
                                    onClick={() => document.getElementById('thumb-upload')?.click()}
                                    className="aspect-video w-full max-w-[240px] rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center cursor-pointer group hover:bg-white hover:border-zinc-300 transition-all overflow-hidden relative shadow-sm"
                                >
                                    {editForm.thumbnail ? (
                                        <img src={getSafeImageSrc(editForm.thumbnail)} alt="Thumb" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 text-zinc-300" />
                                    )}
                                    <input id="thumb-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'thumbnail')} />
                                </div>
                            </div>
                        </div>

                        {/* Text Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-medium uppercase text-zinc-400 tracking-wider">Startup Name</Label>
                                <Input
                                    value={editForm.startup_name}
                                    onChange={(e) => setEditForm({ ...editForm, startup_name: e.target.value })}
                                    className="h-10 rounded-xl bg-zinc-50 border-zinc-100 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-medium uppercase text-zinc-400 tracking-wider">Founder Name</Label>
                                <Input
                                    value={editForm.founder_name}
                                    onChange={(e) => setEditForm({ ...editForm, founder_name: e.target.value })}
                                    className="h-10 rounded-xl bg-zinc-50 border-zinc-100 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-medium uppercase text-zinc-400 tracking-wider">Email</Label>
                                <Input
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="h-10 rounded-xl bg-zinc-50 border-zinc-100 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-medium uppercase text-zinc-400 tracking-wider">Website</Label>
                                <Input
                                    value={editForm.website}
                                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                    className="h-10 rounded-xl bg-zinc-50 border-zinc-100 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-medium uppercase text-zinc-400 tracking-wider">Story Narrative</Label>
                            <Textarea
                                value={editForm.full_story}
                                onChange={(e) => setEditForm({ ...editForm, full_story: e.target.value })}
                                className="min-h-[160px] rounded-xl bg-zinc-50 border-zinc-100 p-4 text-xs leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setEditingSubmission(null)}
                            className="rounded-xl px-6 h-10 font-medium text-xs"
                        >
                            Cancel
                        </Button>
                        <button
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

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
