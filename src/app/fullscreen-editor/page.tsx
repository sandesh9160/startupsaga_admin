"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Check } from "lucide-react";
import Link from "next/link";

export default function FullscreenEditorPage() {
    const [content, setContent] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("tiptap-fullscreen-content");
        if (stored) {
            setContent(stored);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem("tiptap-fullscreen-content", content);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            {/* Header */}
            <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.close()} className="text-zinc-500">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back / Close
                    </Button>
                    <div className="h-4 w-px bg-zinc-200" />
                    <h1 className="text-sm font-bold text-zinc-900 tracking-tight">Focus Editor</h1>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded">Draft Saved Locally</span>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        className="h-8 bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4"
                    >
                        {saved ? <Check className="h-3 w-3 mr-2" /> : <Save className="h-3 w-3 mr-2" />}
                        {saved ? "Saved" : "Save Changes"}
                    </Button>
                </div>
            </header>

            {/* Editor Area */}
            <main className="flex-1 overflow-hidden p-8 flex justify-center">
                <div className="w-full max-w-5xl h-full flex flex-col">
                    <RichTextEditor
                        content={content}
                        onChange={(v) => {
                            setContent(v);
                            localStorage.setItem("tiptap-fullscreen-content", v);
                        }}
                    />
                </div>
            </main>

            {/* Footer Status */}
            <footer className="h-8 border-t bg-white flex items-center px-6 text-[10px] text-zinc-400 font-bold uppercase tracking-widest gap-4">
                <span>Standalone Focus Mode</span>
                <div className="h-1 w-1 rounded-full bg-zinc-200" />
                <span>Syncs with localStorage</span>
            </footer>
        </div>
    );
}
