"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Palette, ExternalLink } from "lucide-react";

const ADMIN_BASE = "";

const THEME_KEYS = [
  { key: "background_color", desc: "Page background (hex, hsl, or CSS color)" },
  { key: "accent_color", desc: "Accent/CTA color" },
  { key: "primary_color", desc: "Primary brand color" },
  { key: "text_color", desc: "Main text color" },
  { key: "font_family", desc: "e.g. Georgia, serif or Inter, sans-serif" },
  { key: "border_radius", desc: "e.g. 0.5rem, 1rem" },
  { key: "dropdown_style", desc: "minimal | rounded | bordered" },
];

export default function DashboardThemePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Theme & Design</h1>
        <Button variant="secondary" asChild>
          <Link href="/dashboard/theme/layout" className="gap-2">
            <ExternalLink className="h-4 w-4" /> Layout Settings
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground">
        Control global colors, fonts, and component styles. Overrides can be applied per page (About, Homepage, etc.) or per section.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-8 w-8 text-accent" />
            <h2 className="font-semibold">Global Theme (Layout Settings)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Add key-value pairs. Keys: <code className="text-xs bg-muted px-1 rounded">background_color</code>, <code className="text-xs bg-muted px-1 rounded">accent_color</code>, <code className="text-xs bg-muted px-1 rounded">font_family</code>, etc.
          </p>
          <Button asChild>
            <Link href="/dashboard/theme/layout">
              Manage Theme
            </Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Per-Page Overrides</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Customize Homepage, Stories, Startups, About, Contact, etc. separately.
          </p>
          <Button variant="outline" asChild>
            <Link href="/dashboard/theme/overrides">
              Page Theme Overrides
            </Link>
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-2">Supported theme keys (JSON)</h3>
        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
          {THEME_KEYS.map(({ key, desc }) => `  ${key}: ${desc}`).join("\n")}
        </pre>
        <p className="text-sm text-muted-foreground mt-2">
          For Pages: use the &quot;Theme Overrides&quot; field (JSON). For Page Sections: use the &quot;Section Styling&quot; settings (JSON).
        </p>
      </Card>
    </div>
  );
}
