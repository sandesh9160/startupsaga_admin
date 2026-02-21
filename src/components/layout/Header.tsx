"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { Menu, X, Rocket, Search, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  initialNav?: any[];
}

export function Header({ initialNav = [] }: HeaderProps) {
  const isHydrated = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fallback links if the database is empty
  const defaults = [
    { id: 'stories', label: "Stories", url: "/stories", children: [] },
    { id: 'startups', label: "Startups", url: "/startups", children: [] },
    { id: 'cities', label: "Cities", url: "/cities", children: [] },
    { id: 'categories', label: "Categories", url: "/categories", children: [] },
  ];

  const [navLinks, setNavLinks] = useState<any[]>(initialNav.length > 0 ? initialNav : defaults);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    isHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!isHydrated.current) return;

    async function loadNav() {
      try {
        // Fetch hierarchical navigation from server
        const res = await fetch(`${API_BASE_URL}/navigation/?position=header&hierarchical=true`);
        if (res.ok) {
          const items = await res.json();
          if (items && items.length > 0) {
            setNavLinks(items);
          }
        }
      } catch (err) {
        console.error("Failed to load header navigation client-side", err);
      }
    }
    loadNav();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300 w-full",
      scrolled
        ? "bg-background/90 backdrop-blur-xl shadow-sm border-b border-border py-2"
        : "bg-background border-b border-border py-4"
    )}>
      <div className="container-wide">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link href="/" className="hover:scale-105 transition-transform">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const hasChildren = link.children && link.children.length > 0;
                const style = link.settings || {};

                if (hasChildren) {
                  return (
                    <DropdownMenu key={link.id}>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-accent rounded-full hover:bg-accent/5 transition-all flex items-center gap-1.5 outline-none group"
                          style={{
                            color: style.color || undefined,
                            fontWeight: style.is_bold ? '900' : undefined
                          }}
                        >
                          {link.label}
                          <ChevronDown className="h-3.5 w-3.5 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-2xl border-border bg-popover animate-in fade-in zoom-in-95 duration-200">
                        {link.children.map((child: any) => (
                          <DropdownMenuItem key={child.id} asChild className="rounded-xl focus:bg-accent/5 focus:text-accent p-0 overflow-hidden">
                            <Link
                              href={child.url || "/"}
                              className="flex items-center w-full px-4 py-3 text-sm font-medium transition-colors"
                              style={{
                                color: child.settings?.color || undefined,
                                fontWeight: child.settings?.is_bold ? '800' : undefined
                              }}
                            >
                              {child.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <Link
                    key={link.id}
                    href={link.url || "/"}
                    className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-accent rounded-full hover:bg-accent/5 transition-all relative group"
                    style={{
                      color: style.color || undefined,
                      fontWeight: style.is_bold ? '900' : undefined
                    }}
                  >
                    {link.label}
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent transition-all group-hover:w-4 rounded-full" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-accent/5 hover:text-accent rounded-full" suppressHydrationWarning>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="accent" size="lg" className="bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-full h-11 px-6 group" asChild suppressHydrationWarning>
              <Link href="/submit" className="flex items-center gap-2">
                <span className="font-bold">Submit Startup</span>
                <Rocket className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground focus:ring-2 focus:ring-accent/20 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            suppressHydrationWarning
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-accent" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-card border border-border rounded-2xl p-6 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const hasChildren = link.children && link.children.length > 0;

                return (
                  <div key={link.id} className="flex flex-col">
                    <Link
                      href={link.url || "#"}
                      className="text-lg font-bold text-foreground hover:text-accent transition-all px-4 py-3 rounded-xl hover:bg-accent/5"
                      onClick={() => !hasChildren && setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {hasChildren && (
                      <div className="pl-8 flex flex-col border-l border-border ml-4 gap-1 mb-4 mt-1">
                        {link.children.map((child: any) => (
                          <Link
                            key={child.id}
                            href={child.url || "/"}
                            className="text-sm font-semibold text-muted-foreground hover:text-accent py-2 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="h-[1px] bg-border/50 my-4" />
              <Button variant="accent" size="lg" className="w-full bg-accent text-white hover:bg-accent/90 shadow-xl shadow-accent/20 rounded-xl h-14" asChild suppressHydrationWarning>
                <Link href="/submit" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-3">
                  <span className="font-bold">Submit Your Startup</span>
                  <Rocket className="h-5 w-5" />
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
