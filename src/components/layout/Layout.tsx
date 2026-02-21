import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { getNavigation } from "@/lib/api";

import { FrontendBreadcrumbs } from "./FrontendBreadcrumbs";

interface LayoutProps {
  children: ReactNode;
}

export async function Layout({ children }: LayoutProps) {
  let navItems: any[] = [];

  try {
    navItems = await getNavigation('header');
  } catch (error) {
    console.error("Layout: Failed to fetch navigation", error);
    // Fallback to empty array - client will handle fetching
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header initialNav={navItems} />
      <main className="flex-1">
        <FrontendBreadcrumbs />
        {children}
      </main>
      <Footer />
    </div>
  );
}
