"use client";

import { usePathname } from "next/navigation";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { motion } from "framer-motion";

interface DashboardLayoutWrapperProps {
    children: React.ReactNode;
    initialNav?: any[];
}

export function DashboardLayoutWrapper({ children, initialNav = [] }: DashboardLayoutWrapperProps) {
    const pathname = usePathname();

    return (
        <SidebarProvider defaultOpen={true}>
            {/* AppSidebar renders as a Sheet (offcanvas) on mobile, fixed sidebar on desktop */}
            <AppSidebar initialNav={initialNav} />

            <SidebarInset className="flex flex-col min-w-0 bg-background relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* Mobile top bar — hamburger to open sidebar Sheet */}
                <header className="md:hidden flex items-center h-14 px-4 border-b border-slate-100 bg-white/80 backdrop-blur-md relative z-20 shrink-0">
                    <SidebarTrigger className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all" />
                    <span className="ml-3 text-sm font-bold text-slate-900 tracking-tight">StartupSaga</span>
                </header>

                {/* Main Content with Page Transitions */}
                <main className="flex-1 overflow-y-auto bg-background/30 backdrop-blur-[2px] transition-all duration-500">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="mx-auto max-w-7xl relative z-10"
                    >
                        {children}
                    </motion.div>
                </main>

            </SidebarInset>
        </SidebarProvider>
    );
}
