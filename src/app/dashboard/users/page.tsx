"use client";

import { useState } from "react";
import {
    Users,
    ExternalLink,
    ShieldCheck,
    UserPlus,
    Shield,
    Trash2,
    Ban,
    Search,
    ChevronDown,
    MoreVertical,
    Mail,
    Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ADMIN_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8000";

// Custom StartupSaga User Mockup
const MOCK_USERS = [
    {
        id: "1",
        name: "EcoSystem_Node_Bangalore",
        email: "hub@blrhub.in",
        role: "HUB PARTNER",
        roleColor: "bg-blue-50 text-blue-600",
        status: "Verified",
        account: "Active",
        avatar: "E",
        avatarBg: "bg-blue-600"
    },
    {
        id: "2",
        name: "Founder_Priya",
        email: "priya.startup@gmail.com",
        role: "FOUNDER",
        roleColor: "bg-slate-50 text-slate-600",
        status: "Verified",
        account: "Active",
        avatar: "P",
        avatarBg: "bg-indigo-600"
    },
    {
        id: "3",
        name: "Tech_Accelerator_IN",
        email: "ops@accelerate.in",
        role: "HUB PARTNER",
        roleColor: "bg-blue-50 text-blue-600",
        status: "Verified",
        account: "Active",
        avatar: "T",
        avatarBg: "bg-blue-400"
    },
    {
        id: "4",
        name: "Investor_Group_Alpha",
        email: "dealflow@alpha.vc",
        role: "INVESTOR",
        roleColor: "bg-blue-50 text-blue-600",
        status: "Verified",
        account: "Active",
        avatar: "I",
        avatarBg: "bg-blue-600"
    },
    {
        id: "5",
        name: "Mentor_Arjun",
        email: "arjun.coach@startupsaga.in",
        role: "MENTOR",
        roleColor: "bg-slate-50 text-slate-600",
        status: "Verified",
        account: "Active",
        avatar: "M",
        avatarBg: "bg-blue-500"
    }
];

export default function DashboardUsersPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans pb-10">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-10 space-y-8">

                {/* --- HEADER --- Matching Image 1 Style */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-blue-600 tracking-tight">Identity Management</h1>
                    <p className="text-base font-medium text-slate-500">Manage and monitor all platform participants and their access protocols.</p>
                </div>

                {/* --- FILTER BAR --- Matching Image 1 Style */}
                <div className="flex flex-col lg:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full lg:max-w-3xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 font-bold" />
                        <Input
                            placeholder="Search by identity or email..."
                            className="pl-12 h-14 border-none shadow-sm bg-white rounded-2xl text-[13px] font-medium placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <Button
                            variant="outline"
                            className="h-14 bg-white border-none shadow-sm rounded-2xl px-6 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-8 min-w-[140px]"
                        >
                            All Personas
                            <ChevronDown size={16} className="text-slate-400" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-14 bg-white border-none shadow-sm rounded-2xl px-6 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-8 min-w-[140px]"
                        >
                            All Status
                            <ChevronDown size={16} className="text-slate-400" />
                        </Button>
                    </div>
                </div>

                {/* --- USER TABLE --- Matching Image 1 Neat Styling */}
                <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden p-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 font-bold text-[11px] uppercase tracking-widest bg-slate-50/50">
                                    <th className="px-8 py-5 font-bold">User</th>
                                    <th className="px-6 py-5 font-bold text-center">Persona</th>
                                    <th className="px-6 py-5 font-bold text-center">Status</th>
                                    <th className="px-6 py-5 font-bold text-center">Account</th>
                                    <th className="px-8 py-5 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {MOCK_USERS.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm", user.avatarBg)}>
                                                    {user.avatar}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 text-[13px] leading-tight">{user.name}</span>
                                                    <span className="text-[11px] text-slate-400 font-medium">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <Badge className={cn("border-none text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight", user.roleColor)}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 w-fit mx-auto">
                                                <ShieldCheck size={12} className="text-emerald-500" />
                                                Verified
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Circle size={8} fill="currentColor" className="text-emerald-500" />
                                                <span className="text-[12px] font-bold text-slate-600">Active</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-slate-100/50">
                                                    <Shield size={16} />
                                                </button>
                                                <button className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-all flex items-center justify-center border border-slate-100/50">
                                                    <Ban size={16} />
                                                </button>
                                                <button className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-slate-100/50">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* --- SYSTEM LINK --- */}
                <div className="flex items-center justify-center pt-4">
                    <Button asChild className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl px-8 font-bold text-xs uppercase tracking-widest h-12 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                        <Link href={`${ADMIN_BASE}/admin/auth/user/`} target="_blank" rel="noopener" className="gap-2">
                            <ExternalLink size={14} /> Global Control Vault
                        </Link>
                    </Button>
                </div>

            </div>
        </div>
    );
}
