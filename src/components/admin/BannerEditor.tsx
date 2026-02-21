"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Sparkles, Layout, Palette, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

interface BannerEditorProps {
    banner?: any;
    onClose: () => void;
    onSaved: () => void;
}


export function BannerEditor({ banner, onClose, onSaved }: BannerEditorProps) {
    const isEditing = !!banner;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: banner?.title || "",
        subtitle: banner?.subtitle || "",
        description: banner?.description || "",
        link_text: banner?.link_text || "Learn More",
        link_url: banner?.link_url || "",
        order: banner?.order || 0,
        is_active: banner?.is_active !== undefined ? banner.is_active : true,
        image: null as string | null,
        settings: banner?.settings || {
            bg_color: "#FF5722",
            text_color: "#FFFFFF"
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            settings: { ...prev.settings, [key]: value }
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title) {
            toast.error("Banner title is required");
            return;
        }

        setIsLoading(true);
        const url = isEditing
            ? `${process.env.NEXT_PUBLIC_API_URL}/sections/${banner.id}/update/`
            : `${process.env.NEXT_PUBLIC_API_URL}/sections/create/`;

        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const payload = {
                ...formData,
                page: 'homepage',
                section_type: 'banner'
            };

            // If image is not updated and we're editing, don't send the null/empty image field to avoid overwriting
            if (isEditing && !formData.image) {
                delete (payload as any).image;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(isEditing ? "Banner updated" : "Banner created");
                onSaved();
            } else {
                toast.error("Failed to save banner");
            }
        } catch (error) {
            console.error("Save error", error);
            toast.error("Error saving banner");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2rem] border-none shadow-2xl">
                <DialogHeader className="p-8 pb-4 shrink-0 bg-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#FF5722]/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-[#FF5722]" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tight">{isEditing ? "Edit Banner" : "New Promotional Banner"}</DialogTitle>
                            <DialogDescription className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                                Homepage Section Editor
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 bg-zinc-50/50">
                    {/* Basic Content Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout className="h-4 w-4 text-zinc-400" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Banner Content</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Overline / Subtitle</Label>
                                <Input
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    className="rounded-xl border-zinc-200 bg-white h-11 text-sm font-medium"
                                    placeholder="e.g. LIMITED TIME OFFER"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Order / Position</Label>
                                <Input
                                    name="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={handleChange}
                                    className="rounded-xl border-zinc-200 bg-white h-11 text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Main Heading</Label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="rounded-xl border-zinc-200 bg-white h-11 text-sm font-bold"
                                placeholder="Enter banner headline"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Description Content</Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="rounded-xl border-zinc-200 bg-white min-h-[100px] text-sm leading-relaxed"
                                placeholder="Write a compelling description for your banner..."
                            />
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <LinkIcon className="h-4 w-4 text-zinc-400" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Call to Action</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Button Text</Label>
                                <Input
                                    name="link_text"
                                    value={formData.link_text}
                                    onChange={handleChange}
                                    className="rounded-xl border-zinc-200 bg-white h-11 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Destination URL</Label>
                                <Input
                                    name="link_url"
                                    value={formData.link_url}
                                    onChange={handleChange}
                                    className="rounded-xl border-zinc-200 bg-white h-11 text-sm font-medium"
                                    placeholder="/stories or https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Styling & Media */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Palette className="h-4 w-4 text-zinc-400" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Visual Styling</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase opacity-70">Background</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.settings.bg_color}
                                            onChange={(e) => handleSettingChange('bg_color', e.target.value)}
                                            className="w-12 h-10 p-1 cursor-pointer rounded-lg shrink-0"
                                        />
                                        <Input
                                            value={formData.settings.bg_color}
                                            onChange={(e) => handleSettingChange('bg_color', e.target.value)}
                                            className="h-10 text-[10px] rounded-lg border-zinc-200 font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase opacity-70">Text Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.settings.text_color}
                                            onChange={(e) => handleSettingChange('text_color', e.target.value)}
                                            className="w-12 h-10 p-1 cursor-pointer rounded-lg shrink-0 border"
                                        />
                                        <Input
                                            value={formData.settings.text_color}
                                            onChange={(e) => handleSettingChange('text_color', e.target.value)}
                                            className="h-10 text-[10px] rounded-lg border-zinc-200 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4 text-zinc-400" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Media Assets</h3>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase opacity-70">Background Pattern/Image</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="rounded-xl border-zinc-200 bg-white h-11 text-xs pt-2.5"
                                />
                                {banner?.image && !formData.image && (
                                    <p className="text-[9px] text-zinc-400 font-bold ml-1">Current: {banner.image.split('/').pop()}</p>
                                )}
                                {formData.image && (
                                    <p className="text-[9px] text-[#FF5722] font-bold ml-1">New Image Selected</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-200/60 mt-4">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Show on Homepage</Label>
                            <p className="text-[10px] text-zinc-400 font-medium">Instantly toggle visibility of this banner.</p>
                        </div>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(val) => setFormData(prev => ({ ...prev, is_active: val }))}
                            className="data-[state=checked]:bg-[#FF5722]"
                        />
                    </div>
                </div>

                <DialogFooter className="p-8 bg-white border-t border-zinc-100 flex items-center justify-between gap-4 shrink-0">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-zinc-500">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-[#FF5722] hover:bg-[#FF5722]/90 rounded-xl px-10 h-12 font-bold shadow-xl shadow-[#FF5722]/20 min-w-[140px]"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Banner"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
