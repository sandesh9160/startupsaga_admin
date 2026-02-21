"use client";

import { useEffect, useMemo, useState, createContext, useContext, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getThemeSettings } from "@/lib/api";

export type ThemeSettings = Record<string, string>;

const ThemeContext = createContext<ThemeSettings | null>(null);

/** Map admin theme keys to CSS variable names */
const THEME_KEY_MAP: Record<string, string> = {
  background_color: "--theme-background",
  bg_color: "--theme-background",
  accent_color: "--theme-accent",
  primary_color: "--theme-primary",
  text_color: "--theme-foreground",
  font_family: "--theme-font-family",
  font_size: "--theme-font-size",
  border_radius: "--theme-radius",
  link_color: "--theme-link-color",
  dropdown_style: "data-dropdown-style",
};

function themeToStyleObject(theme: ThemeSettings): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme)) {
    if (!value) continue;
    const cssVar = THEME_KEY_MAP[key] || (key.startsWith("--") ? key : `--theme-${key.replace(/_/g, "-")}`);
    if (cssVar.startsWith("data-")) continue;
    style[cssVar as any] = value;
  }
  // Apply background/foreground when set (full-page effect)
  if (theme.background_color || theme.bg_color) {
    style.background = style.background || theme.background_color || theme.bg_color || "";
  }
  if (theme.text_color) {
    style.color = theme.text_color;
  }
  if (theme.font_family) {
    style.fontFamily = theme.font_family;
  }
  return style as React.CSSProperties;
}

function themeToDataAttrs(theme: ThemeSettings): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (theme.dropdown_style) attrs["data-dropdown-style"] = theme.dropdown_style;
  return attrs;
}

const RESERVED_SLUGS = ["stories", "startups", "categories", "cities", "submit", "dashboard", "admin", "api"];

function pathToThemeParams(pathname: string): { pageKey?: string; pageSlug?: string } {
  if (!pathname || pathname === "/") return { pageKey: "homepage" };
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const first = segments[0];
  if (first === "submit") return { pageKey: "submit" };
  if (first === "stories") return { pageKey: segments.length > 1 ? "stories_detail" : "stories_list" };
  if (first === "startups") return { pageKey: segments.length > 1 ? "startups_detail" : "startups_list" };
  if (first === "categories") return { pageKey: segments.length > 1 ? "categories_detail" : "categories_list" };
  if (first === "cities") return { pageKey: segments.length > 1 ? "cities_detail" : "cities_list" };
  if (!RESERVED_SLUGS.includes(first) && segments.length === 1) return { pageSlug: first };
  return {};
}

interface ThemeProviderProps {
  children: ReactNode;
  pageKey?: string;
  pageSlug?: string;
  initialTheme?: ThemeSettings;
}

export function ThemeProvider({
  children,
  pageKey: propPageKey,
  pageSlug: propPageSlug,
  initialTheme,
}: ThemeProviderProps) {
  const pathname = usePathname();
  const { pageKey: pathPageKey, pageSlug: pathPageSlug } = pathToThemeParams(pathname || "");
  const pageKey = propPageKey ?? pathPageKey;
  const pageSlug = propPageSlug ?? pathPageSlug;

  const [theme, setTheme] = useState<ThemeSettings>(initialTheme || {});

  useEffect(() => {
    if (initialTheme && Object.keys(initialTheme).length > 0) {
      setTheme(initialTheme);
      return;
    }
    getThemeSettings({ pageKey, pageSlug })
      .then(setTheme)
      .catch(() => setTheme({}));
  }, [pageKey, pageSlug]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const style = useMemo(() => themeToStyleObject(theme), [theme]);
  const dataAttrs = useMemo(() => themeToDataAttrs(theme), [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <div
        style={isMounted ? style : {}}
        {...(isMounted ? dataAttrs : {})}
        className="theme-wrapper min-h-full"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext) || {};
}

export function SectionWrapper({
  children,
  settings,
}: {
  children: ReactNode;
  settings?: Record<string, string> | null;
}) {
  if (!settings || Object.keys(settings).length === 0) {
    return <>{children}</>;
  }
  const style = themeToStyleObject(settings);
  const attrs = themeToDataAttrs(settings);
  return (
    <div style={style} {...attrs}>
      {children}
    </div>
  );
}
