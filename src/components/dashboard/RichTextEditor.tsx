"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
// import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Youtube from '@tiptap/extension-youtube';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Link as LinkIcon,
    Unlink,
    Underline as UnderlineIcon,
    Video,
    Upload,
    Check,
    Sparkles,
    FileText,
    ShieldCheck,
    ShieldOff,
    Minus,
    Type,
    Strikethrough,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getSafeImageSrc } from "@/lib/images";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

/* ─────────────────────────────────────────────
   Link Dialog — DoFollow / NoFollow selector
   ───────────────────────────────────────────── */
function LinkDialog({
    open, onClose, onInsert, initialUrl = '', initialRel = 'dofollow',
}: {
    open: boolean; onClose: () => void;
    onInsert: (url: string, rel: string, target: string) => void;
    initialUrl?: string; initialRel?: string;
}) {
    const [url, setUrl] = useState(initialUrl);
    const [rel, setRel] = useState(initialRel);

    useEffect(() => { setUrl(initialUrl); setRel(initialRel); }, [initialUrl, initialRel, open]);

    const handleSubmit = () => {
        if (!url.trim()) return;
        onInsert(url, rel === 'nofollow' ? 'nofollow noopener noreferrer' : '', '_blank');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[320px] rounded-2xl border-zinc-200 shadow-2xl p-0 overflow-hidden">
                {/* ── Header ── */}
                <div className="px-4 pt-4 pb-3 border-b border-zinc-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <LinkIcon className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-bold text-zinc-800 leading-none">Insert Link</DialogTitle>
                        <DialogDescription className="text-[11px] text-zinc-400 mt-0.5">URL and SEO link type</DialogDescription>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="px-4 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">URL</Label>
                        <Input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="h-9 rounded-lg border-zinc-200 bg-zinc-50/50 focus:bg-white text-xs font-medium placeholder:text-zinc-300"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SEO</Label>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">Indexed</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setRel('dofollow')}
                                className={cn(
                                    "flex items-center gap-1.5 flex-1 py-1.5 px-2.5 rounded-lg border text-[10px] font-bold transition-all",
                                    rel === 'dofollow'
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"
                                        : "border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200"
                                )}
                            >
                                <ShieldCheck className="h-3 w-3 shrink-0" />
                                DoFollow
                            </button>
                            <button
                                type="button"
                                onClick={() => setRel('nofollow')}
                                className={cn(
                                    "flex items-center gap-1.5 flex-1 py-1.5 px-2.5 rounded-lg border text-[10px] font-bold transition-all",
                                    rel === 'nofollow'
                                        ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100"
                                        : "border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200"
                                )}
                            >
                                <ShieldOff className="h-3 w-3 shrink-0" />
                                NoFollow
                            </button>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-3 bg-zinc-50/80 border-t border-zinc-100 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs rounded-lg">Cancel</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={!url.trim()} className="h-8 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700">
                        <Check className="h-3 w-3 mr-1" /> Insert
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ─────────────────────────────────────────────
   Image Dialog — Upload or URL
   ───────────────────────────────────────────── */
function ImageDialog({
    open, onClose, onInsert,
}: {
    open: boolean; onClose: () => void;
    onInsert: (src: string, alt: string) => void;
}) {
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!url.trim()) return;
        onInsert(url, alt || 'Story image');
        onClose(); setUrl(''); setAlt('');
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[380px] rounded-2xl border-zinc-200 shadow-2xl p-0 overflow-hidden">
                {/* ── Header ── */}
                <div className="px-4 pt-4 pb-3 border-b border-zinc-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-bold text-zinc-800 leading-none">Insert Image</DialogTitle>
                        <DialogDescription className="text-[11px] text-zinc-400 mt-0.5">Upload or paste a URL</DialogDescription>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="px-4 py-4 space-y-3">
                    {/* Upload zone + URL side-by-side */}
                    <div className="flex gap-3">
                        {/* Drop zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "h-[88px] w-[88px] shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden group",
                                url ? "border-amber-300 bg-amber-50/40" : "border-zinc-200 bg-zinc-50 hover:border-amber-400 hover:bg-amber-50/30"
                            )}
                        >
                            {url ? (
                                <img src={getSafeImageSrc(url)} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 text-zinc-400 group-hover:text-amber-500 transition-colors">
                                    <Upload className="h-5 w-5" />
                                    <span className="text-[9px] font-bold text-center leading-tight">Click to<br />upload</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

                        {/* URL + format hint */}
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Or paste URL</Label>
                                <Input
                                    placeholder="https://example.com/image.jpg"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="h-9 rounded-lg border-zinc-200 bg-zinc-50/50 focus:bg-white text-xs font-medium placeholder:text-zinc-300"
                                />
                            </div>
                            <p className="text-[9px] text-zinc-300 font-medium leading-tight">WebP, PNG, JPEG, GIF — max 10MB</p>
                        </div>
                    </div>

                    {/* Alt Text */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Alt Text</Label>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">SEO</span>
                        </div>
                        <Input
                            placeholder="Describe the image..."
                            value={alt}
                            onChange={(e) => setAlt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="h-9 rounded-lg border-zinc-200 bg-zinc-50/50 focus:bg-white text-xs font-medium placeholder:text-zinc-300"
                        />
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-4 py-3 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs rounded-lg px-3">Cancel</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={!url.trim()} className="h-8 text-xs rounded-lg px-4 bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200">
                        <Check className="h-3 w-3 mr-1" /> Insert
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ─────────────────────────────────────────────
   Video Dialog — YouTube embed
   ───────────────────────────────────────────── */
function VideoDialog({
    open, onClose, onInsert,
}: {
    open: boolean; onClose: () => void;
    onInsert: (url: string) => void;
}) {
    const [url, setUrl] = useState('');

    const handleSubmit = () => {
        if (!url.trim()) return;
        onInsert(url); onClose(); setUrl('');
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[340px] rounded-2xl border-zinc-200 shadow-2xl p-0 overflow-hidden">
                {/* ── Header ── */}
                <div className="px-4 pt-4 pb-3 border-b border-zinc-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                        <Video className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-bold text-zinc-800 leading-none">Embed Video</DialogTitle>
                        <DialogDescription className="text-[11px] text-zinc-400 mt-0.5">Paste a YouTube URL</DialogDescription>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="px-4 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">YouTube URL</Label>
                        <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="h-9 rounded-lg border-zinc-200 bg-zinc-50/50 focus:bg-white text-xs font-medium placeholder:text-zinc-300"
                            autoFocus
                        />
                        <p className="text-[9px] text-zinc-300 font-medium leading-tight">Supports youtube.com and youtu.be links</p>
                    </div>

                    {/* Optional: Simple ID Preview if URL matches */}
                    {url.includes('youtube') || url.includes('youtu.be') ? (
                        <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100/50 flex items-center gap-3">
                            <div className="h-10 w-16 bg-zinc-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                <Video className="h-4 w-4 text-zinc-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-rose-600 truncate">Video detected</p>
                                <p className="text-[9px] text-zinc-400 truncate">Ready to embed</p>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* ── Footer ── */}
                <div className="px-4 py-3 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs rounded-lg px-3">Cancel</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={!url.trim()} className="h-8 text-xs rounded-lg px-4 bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200">
                        <Check className="h-3 w-3 mr-1" /> Embed
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ─────────────────────────────────────────────
   Toolbar Button
   ───────────────────────────────────────────── */
function ToolbarBtn({
    onClick, active = false, children, title, className: cls, disabled,
}: {
    onClick: () => void; active?: boolean; children: React.ReactNode;
    title?: string; className?: string; disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            disabled={disabled}
            className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg transition-all duration-150",
                "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
                active && "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100",
                disabled && "opacity-30 pointer-events-none",
                cls,
            )}
        >
            {children}
        </button>
    );
}

function ToolbarSep() {
    return <div className="w-px h-6 bg-zinc-200/70 mx-1 shrink-0" />;
}

/* ─────────────────────────────────────────────
   Premium Toolbar
   ───────────────────────────────────────────── */
const MenuBar = ({ editor }: { editor: Editor | null }) => {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);

    if (!editor) return null;

    const handleInsertLink = (url: string, rel: string, target: string) => {
        if (!url) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange('link').setLink({
            href: url,
            target,
            rel: rel || undefined
        }).run();
    };

    const currentLinkUrl = editor.getAttributes('link').href || '';
    const currentLinkRel = editor.getAttributes('link').rel || '';

    return (
        <>
            <div className="flex items-center gap-1 px-3 py-2 bg-white/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-10 flex-wrap">
                <div className="flex items-center gap-0.5 bg-secondary/20 p-0.5 rounded-lg">
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                        <Bold className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                        <Italic className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                        <UnderlineIcon className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                        <Strikethrough className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
                        <Code className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                </div>

                <div className="flex items-center gap-0.5 bg-secondary/20 p-0.5 rounded-lg">
                    <ToolbarBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Text">
                        <Type className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">
                        <span className="text-[10px] font-bold">H1</span>
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">
                        <span className="text-[10px] font-bold">H2</span>
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3">
                        <span className="text-[10px] font-bold">H3</span>
                    </ToolbarBtn>
                </div>

                <div className="flex items-center gap-0.5 bg-secondary/20 p-0.5 rounded-lg">
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                        <List className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
                        <ListOrdered className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
                        <Quote className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                </div>

                <div className="flex items-center gap-0.5 bg-secondary/20 p-0.5 rounded-lg">
                    <ToolbarBtn
                        onClick={() => setLinkDialogOpen(true)}
                        active={editor.isActive('link')}
                        title="Link"
                    >
                        <LinkIcon className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => setImageDialogOpen(true)} title="Image">
                        <ImageIcon className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => setVideoDialogOpen(true)} title="Video">
                        <Video className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                        <Minus className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-0.5 bg-secondary/20 p-0.5 rounded-lg">
                    <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
                        <Undo className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
                        <Redo className="h-3.5 w-3.5" />
                    </ToolbarBtn>
                </div>
            </div>

            <LinkDialog
                open={linkDialogOpen}
                onClose={() => setLinkDialogOpen(false)}
                onInsert={handleInsertLink}
                initialUrl={currentLinkUrl}
                initialRel={currentLinkRel.includes('nofollow') ? 'nofollow' : 'dofollow'}
            />
            <ImageDialog
                open={imageDialogOpen}
                onClose={() => setImageDialogOpen(false)}
                onInsert={(src, alt) => editor.chain().focus().setImage({ src, alt }).run()}
            />
            <VideoDialog
                open={videoDialogOpen}
                onClose={() => setVideoDialogOpen(false)}
                onInsert={(url) => editor.chain().focus().setYoutubeVideo({ src: url, width: 640, height: 360 }).run()}
            />
        </>
    );
};

export function RichTextEditor({ content, onChange, placeholder = "Start writing your story..." }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure(),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary font-bold underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl border border-border/40 shadow-xl max-w-full my-6 mx-auto block transition-transform hover:scale-[1.01]',
                },
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: 'rounded-xl overflow-hidden my-6 mx-auto max-w-full shadow-xl border border-border/40',
                },
                width: 640,
                height: 360,
            }),
            Placeholder.configure({ placeholder }),
            CharacterCount,
            Typography,
        ],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm max-w-none focus:outline-none min-h-[400px]',
                    'px-8 py-10',
                    'font-serif leading-[1.7] text-foreground/80',
                    'prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground',
                    'prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 font-sans',
                    'prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/40 font-sans',
                    'prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 font-sans',
                    'prose-p:text-foreground/70 prose-p:mb-4 text-base',
                    'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/[0.03] prose-blockquote:rounded-lg prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:my-6',
                    'prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-xs prose-code:font-bold',
                    'prose-strong:text-foreground prose-strong:font-black',
                    'prose-hr:border-border/40 prose-hr:my-8',
                ),
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && content && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const wordCount = editor?.storage.characterCount?.words() || 0;
    const charCount = editor?.getText().length || 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="rounded-2xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
            <MenuBar editor={editor} />

            <div className="bg-white/30 backdrop-blur-[1px]">
                <EditorContent editor={editor} />
            </div>

            <div className="px-5 py-3 border-t border-border/40 bg-secondary/10 backdrop-blur-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-foreground uppercase tracking-wider">
                            <FileText className="h-3 w-3 text-primary" />
                            {wordCount} <span className="text-muted-foreground/60 font-medium">words</span>
                        </span>
                        <div className="h-0.5 w-0.5 rounded-full bg-border" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-wider">
                            {charCount} <span className="text-muted-foreground/60 font-medium text-[9px]">chars</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 rounded-full border border-border/40">
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{readTime} min read</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-background/50 backdrop-blur px-3 py-1.5 rounded-lg border border-border/40 transition-all hover:bg-background/80">
                    <div className={cn(
                        "h-6 w-6 rounded-md flex items-center justify-center transition-all duration-500 shadow-sm",
                        wordCount > 300 ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    )}>
                        {wordCount > 300 ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3 w-3 animate-pulse" />}
                    </div>
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        wordCount > 300 ? "text-emerald-600" : "text-amber-600"
                    )}>
                        {wordCount > 300 ? "SEO Optimized" : "In Progress..."}
                    </span>
                </div>
            </div>
        </div>
    );
}
