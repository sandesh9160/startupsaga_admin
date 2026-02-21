import { getNavigation } from "@/lib/api";
import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper";


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    let navItems: any[] = [];

    // Only fetch during runtime if we are in development, or always if you want fresh data on every SSR
    // In production build-time (export), you might want to avoid this or handle differently
    try {
        navItems = await getNavigation('dashboard_sidebar');
    } catch (error) {
        console.error("DashboardLayout: Failed to fetch navigation", error);
    }

    return (
        <DashboardLayoutWrapper initialNav={navItems}>
            {children}
        </DashboardLayoutWrapper>
    );
}
