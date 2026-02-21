"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    MapPin,
    Settings,
    LogOut as LogOutIcon,
    Users,
    Mail,
    Layers,
    Rocket,
    Sparkles,
    LayoutTemplate,
    PanelBottom,
    Images,
    BookOpen,
    Globe,
    MailOpen,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
    title: string;
    href: string;
    icon: any;
    iconBg: string;   // always-visible icon badge bg
    iconColor: string; // icon color
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        label: "Overview",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
                iconBg: "bg-blue-500",
                iconColor: "text-white",
            },
        ],
    },
    {
        label: "Content",
        items: [
            {
                title: "Stories",
                href: "/dashboard/stories",
                icon: BookOpen,
                iconBg: "bg-violet-500",
                iconColor: "text-white",
            },
            {
                title: "Startups",
                href: "/dashboard/startups",
                icon: Building2,
                iconBg: "bg-indigo-500",
                iconColor: "text-white",
            },
            {
                title: "Categories",
                href: "/dashboard/categories",
                icon: Layers,
                iconBg: "bg-purple-500",
                iconColor: "text-white",
            },
            {
                title: "Cities",
                href: "/dashboard/hubs",
                icon: MapPin,
                iconBg: "bg-pink-500",
                iconColor: "text-white",
            },
            {
                title: "Media",
                href: "/dashboard/media",
                icon: Images,
                iconBg: "bg-rose-500",
                iconColor: "text-white",
            },
        ],
    },
    {
        label: "Engagement",
        items: [
            {
                title: "Submissions",
                href: "/dashboard/submissions",
                icon: Mail,
                iconBg: "bg-emerald-500",
                iconColor: "text-white",
            },
            {
                title: "Newsletter",
                href: "/dashboard/newsletter",
                icon: Mail,
                iconBg: "bg-teal-500",
                iconColor: "text-white",
            },
            {
                title: "AI Prompts",
                href: "/dashboard/prompts",
                icon: Sparkles,
                iconBg: "bg-cyan-500",
                iconColor: "text-white",
            },
        ],
    },
    {
        label: "Site",
        items: [
            {
                title: "Pages",
                href: "/dashboard/site-pages",
                icon: Globe,
                iconBg: "bg-orange-500",
                iconColor: "text-white",
            },
            {
                title: "Navbar",
                href: "/dashboard/menus",
                icon: LayoutTemplate,
                iconBg: "bg-amber-500",
                iconColor: "text-white",
            },
            {
                title: "Footer",
                href: "/dashboard/footer",
                icon: PanelBottom,
                iconBg: "bg-yellow-500",
                iconColor: "text-white",
            },
        ],
    },
    {
        label: "System",
        items: [
            {
                title: "Settings",
                href: "/dashboard/settings",
                icon: Settings,
                iconBg: "bg-slate-500",
                iconColor: "text-white",
            },
        ],
    },
];

export function AppSidebar({
    className,
    initialNav: _initialNav,
    ...props
}: React.ComponentProps<typeof Sidebar> & { initialNav?: any[] }) {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();

    const handleNavClick = () => {
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar
            className={cn(
                "flex flex-col h-full border-r border-slate-200 bg-white",
                className
            )}
            {...props}
        >
            {/* ── Brand ── */}
            <SidebarHeader className="h-16 flex items-center px-5 border-b border-slate-100">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                        <Rocket className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-900 tracking-tight">
                        StartupSaga
                    </span>
                </Link>
            </SidebarHeader>

            {/* ── Nav ── */}
            <ScrollArea className="flex-1 px-3 py-3">
                <SidebarContent className="gap-0">
                    {navGroups.map((group) => (
                        <div key={group.label} className="mb-5">
                            {/* Group label */}
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1.5">
                                {group.label}
                            </p>

                            <SidebarMenu className="gap-0.5">
                                {group.items.map((item) => {
                                    const isActive =
                                        pathname === item.href ||
                                        (item.href !== "/dashboard" &&
                                            pathname.startsWith(item.href));

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                className={cn(
                                                    "h-10 px-2 rounded-xl transition-all duration-150 w-full",
                                                    isActive
                                                        ? "bg-slate-100 shadow-sm"
                                                        : "hover:bg-slate-50"
                                                )}
                                            >
                                                <Link href={item.href} className="flex items-center gap-3" onClick={handleNavClick}>
                                                    {/* Colorful icon badge — always visible */}
                                                    <div className={cn(
                                                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-150",
                                                        item.iconBg,
                                                        isActive ? "shadow-md scale-105" : "opacity-85"
                                                    )}>
                                                        <item.icon size={14} className={item.iconColor} />
                                                    </div>

                                                    <span className={cn(
                                                        "text-[13px] flex-1",
                                                        isActive
                                                            ? "font-semibold text-slate-900"
                                                            : "font-medium text-slate-600"
                                                    )}>
                                                        {item.title}
                                                    </span>

                                                    {/* Active dot */}
                                                    {isActive && (
                                                        <div className={cn(
                                                            "h-1.5 w-1.5 rounded-full shrink-0",
                                                            item.iconBg
                                                        )} />
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </div>
                    ))}
                </SidebarContent>
            </ScrollArea>

            {/* ── Footer ── */}
            <SidebarFooter className="p-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                        <Rocket className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-900 truncate">Admin</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Control Panel</span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full h-9 text-slate-400 hover:text-rose-500 hover:bg-rose-50 text-xs font-medium gap-2 rounded-lg transition-all"
                    onClick={() => { window.location.href = "/api/auth/signout"; }}
                >
                    <LogOutIcon size={13} />
                    Sign Out
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
