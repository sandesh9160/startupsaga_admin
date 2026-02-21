"use client";

import { useState, useEffect } from "react";
import {
    Layout,
    Palette,
    Type,
    Settings,
    Save,
    Loader2,
    Globe,
    Smartphone,
    Monitor,
    Zap,
    Hash,
    AppWindow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLayoutSettings } from "@/lib/api";

export default function LayoutSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getLayoutSettings()
            .then(setSettings)
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
        }, 1500);
    };

    return (
        <div className="admin-page">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-sans text-foreground">System Appearance</h2>
                    <p className="text-muted-foreground">Manage global layout, colors, and content styles.</p>
                </div>
                <Button onClick={handleSave} className="bg-primary text-primary-foreground gap-2 min-w-[140px]" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Deploy Changes
                </Button>
            </div>

            <Tabs defaultValue="visuals" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-full justify-start max-w-md border border-border/50">
                    <TabsTrigger value="visuals" className="rounded-xl h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 gap-2">
                        <Palette className="h-4 w-4" /> Branding
                    </TabsTrigger>
                    <TabsTrigger value="structure" className="rounded-xl h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 gap-2">
                        <Monitor className="h-4 w-4" /> Layout
                    </TabsTrigger>
                    <TabsTrigger value="features" className="rounded-xl h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 gap-2">
                        <Zap className="h-4 w-4" /> Features
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="visuals" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-border shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-accent" />
                                    Identity & Palette
                                </CardTitle>
                                <CardDescription>Primary colors and brand assets.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Accent Color</Label>
                                            <div className="flex gap-3">
                                                <Input value={settings.accent_color || "#7c3aed"} className="font-mono h-11" />
                                                <div className="h-11 w-11 rounded-xl border border-border/50 shrink-0" style={{ backgroundColor: settings.accent_color || "#7c3aed" }} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Shadow Intensity</Label>
                                            <Input value={settings.shadow_intensity || "0.2"} className="h-11" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Site Logo Text</Label>
                                        <div className="relative group">
                                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input value={settings.logo_text || "StartupSaga.in"} className="pl-10 h-12 bg-muted/20" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-accent" />
                                    Global Typography
                                </CardTitle>
                                <CardDescription>Fonts used across the public platform.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Heading Font (Google Fonts)</Label>
                                        <Input value={settings.heading_font || "Playfair Display"} className="h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Body Font Family</Label>
                                        <Input value={settings.body_font || "Outfit, sans-serif"} className="h-12" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="structure" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-border shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AppWindow className="h-5 w-5 text-accent" />
                                Interface Controls
                            </CardTitle>
                            <CardDescription>Major layout toggles and visibility settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <div className="flex items-center justify-between space-x-4 p-4 rounded-2xl bg-muted/20 border border-border/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Sticky Header</Label>
                                    <p className="text-xs text-muted-foreground line-clamp-1">Keep navigation visible on scroll.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between space-x-4 p-4 rounded-2xl bg-muted/20 border border-border/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Show Newsletter</Label>
                                    <p className="text-xs text-muted-foreground">Site-wide subscription footer.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between space-x-4 p-4 rounded-2xl bg-muted/20 border border-border/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Infinite Scroll</Label>
                                    <p className="text-xs text-muted-foreground">Load stories automatically.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
