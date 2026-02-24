"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, Editor, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Youtube from '@tiptap/extension-youtube';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Highlight } from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import FontFamily from '@tiptap/extension-font-family';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
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
    Pilcrow,
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
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Table as TableIcon,
    Highlighter,
    Eraser,
    RotateCcw,
    RotateCw,
    Eye,
    Code2,
    Trash2,
    Plus,
    Palette,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    CheckSquare,
    ChevronDown,
    Baseline,
    Indent as IndentIcon,
    Outdent as OutdentIcon,
    Maximize,
    Minimize,
    Search,
    Printer,
    ExternalLink,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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

const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: (attributes: Record<string, any>) => {
                            if (!attributes.fontSize) {
                                return {}
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run()
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run()
            },
        } as any
    },
})

const LineHeight = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            defaultLineHeight: 'normal',
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: this.options.defaultLineHeight,
                        parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
                        renderHTML: attributes => {
                            if (!attributes.lineHeight || attributes.lineHeight === this.options.defaultLineHeight) {
                                return {}
                            }
                            return {
                                style: `line-height: ${attributes.lineHeight}`,
                            }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setLineHeight: (lineHeight: string) => ({ commands }: any) => {
                return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }))
            },
            unsetLineHeight: () => ({ commands }: any) => {
                return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight: this.options.defaultLineHeight }))
            },
        } as any
    },
})

const Indent = Extension.create({
    name: 'indent',
    addOptions() {
        return {
            types: ['paragraph', 'heading', 'blockquote'],
            indentSize: 24,
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: element => parseInt(element.style.paddingLeft, 10) || 0,
                        renderHTML: attributes => {
                            if (!attributes.indent) return {};
                            return { style: `padding-left: ${attributes.indent}px` };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            indent: () => ({ commands, editor }: any) => {
                return (this.options.types as any).forEach((type: string) => {
                    if (editor.isActive(type)) {
                        const currentIndent = editor.getAttributes(type).indent || 0;
                        commands.updateAttributes(type, { indent: currentIndent + this.options.indentSize });
                    }
                });
            },
            outdent: () => ({ commands, editor }: any) => {
                return (this.options.types as any).forEach((type: string) => {
                    if (editor.isActive(type)) {
                        const currentIndent = editor.getAttributes(type).indent || 0;
                        commands.updateAttributes(type, { indent: Math.max(0, currentIndent - this.options.indentSize) });
                    }
                });
            },
        } as any;
    },
});

const FONT_SIZES = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '22pt', '24pt', '30pt', '36pt', '48pt', '60pt', '72pt', '96pt'];
const LINE_HEIGHTS = ['1.0', '1.15', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0', '2.5', '3.0'];
const FONT_FAMILIES = [
    { label: 'System Sans', value: 'ui-sans-serif, system-ui, sans-serif' },
    { label: 'System Serif', value: 'ui-serif, Georgia, serif' },
    { label: 'Inter', value: '"Inter", sans-serif' },
    { label: 'Outfit', value: '"Outfit", sans-serif' },
    { label: 'Playfair', value: 'var(--font-playfair), serif' },
    { label: 'Fraunces', value: '"Fraunces", serif' },
    { label: 'Sora', value: '"Sora", sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: '"Open Sans", sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' },
    { label: 'Merriweather', value: 'Merriweather, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'JetBrains Mono', value: 'monospace' },
];

const COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
    '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
    '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
];

const HIGHLIGHT_COLORS = [
    '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FF9900', '#FF0000',
    '#FFF2CC', '#D9EAD3', '#D0E0E3', '#D9D2E9', '#EAD1DC', '#CFE2F3',
];

const lowlight = createLowlight(common);

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
                        <DialogTitle className="text-sm font-semibold text-zinc-800 leading-none">Insert Link</DialogTitle>
                        <DialogDescription className="text-[11px] text-zinc-400 mt-0.5">URL and SEO link type</DialogDescription>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="px-4 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">URL</Label>
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
                            <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">SEO</Label>
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
                        <DialogTitle className="text-sm font-semibold text-zinc-800 leading-none">Insert Image</DialogTitle>
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
                                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Or paste URL</Label>
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
                            <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Alt Text</Label>
                            <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">SEO</span>
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
                        <DialogTitle className="text-sm font-semibold text-zinc-800 leading-none">Embed Video</DialogTitle>
                        <DialogDescription className="text-[11px] text-zinc-400 mt-0.5">Paste a YouTube URL</DialogDescription>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="px-4 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">YouTube URL</Label>
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
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!editor) return;
        const handler = () => setTick(t => t + 1);
        editor.on('selectionUpdate', handler);
        editor.on('transaction', handler);
        return () => {
            editor.off('selectionUpdate', handler);
            editor.off('transaction', handler);
        };
    }, [editor]);

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


    const handleOpenInNewTab = () => {
        const content = editor.getHTML();
        localStorage.setItem("tiptap-fullscreen-content", content);
        window.open("/fullscreen-editor", "_blank");
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-white border-b border-border/40 sticky top-0 z-20 shadow-sm">
            {/* History */}
            <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1.5 mr-1">
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                    <RotateCcw className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                    <RotateCw className="h-3.5 w-3.5" />
                </ToolbarBtn>
            </div>

            {/* Typography Group */}
            <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1.5 mr-1">
                {/* Font Family */}
                <Select
                    value={editor.getAttributes('textStyle').fontFamily || 'ui-sans-serif, system-ui, sans-serif'}
                    onValueChange={(v) => (editor.chain() as any).focus().setFontFamily(v).run()}
                >
                    <SelectTrigger className="h-8 w-[130px] text-[10px] font-semibold border-zinc-200 bg-zinc-50/50 hover:bg-white transition-all">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <Type className="h-3 w-3 shrink-0" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {FONT_FAMILIES.map(ff => (
                            <SelectItem key={ff.value} value={ff.value} className="text-[10px]" style={{ fontFamily: ff.value }}>
                                {ff.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Font Size */}
                <Select
                    value={editor.getAttributes('textStyle').fontSize || '11pt'}
                    onValueChange={(v) => {
                        if (v === '11pt') {
                            (editor.chain() as any).focus().unsetFontSize().run();
                        } else {
                            (editor.chain() as any).focus().setFontSize(v).run();
                        }
                    }}
                >
                    <SelectTrigger className="h-8 w-[65px] text-[10px] font-bold border-zinc-200 bg-zinc-50/50 hover:bg-white transition-all ml-0.5">
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] font-black text-zinc-400">AA</span>
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {FONT_SIZES.map(size => (
                            <SelectItem key={size} value={size} className="text-[10px]">{size.replace('pt', '')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Line Height */}
                <Select
                    value={editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight || '1.15'}
                    onValueChange={(v) => (editor.chain() as any).focus().setLineHeight(v).run()}
                >
                    <SelectTrigger className="h-8 w-[60px] text-[10px] font-bold border-zinc-200 bg-zinc-50/50 hover:bg-white transition-all ml-0.5">
                        <div className="flex items-center gap-1">
                            <Baseline className="h-3 w-3 shrink-0 text-zinc-400" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {LINE_HEIGHTS.map(lh => (
                            <SelectItem key={lh} value={lh} className="text-[10px]">{lh}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="w-[1px] h-4 bg-zinc-100 mx-1" />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold text (Ctrl+B)">
                    <Bold className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italicize text (Ctrl+I)">
                    <Italic className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline text (Ctrl+U)">
                    <UnderlineIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough text">
                    <Strikethrough className="h-3.5 w-3.5" />
                </ToolbarBtn>
            </div>

            {/* Colors & Marks */}
            <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1.5 mr-1">
                {/* Text Color */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 relative">
                            <Palette className="h-3.5 w-3.5" />
                            <div className="absolute bottom-1.5 w-3 h-0.5 rounded-full" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 flex flex-wrap gap-1" align="start">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => editor.chain().focus().setColor(color).run()}
                                className="w-6 h-6 rounded border border-zinc-200"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        <button
                            onClick={() => editor.chain().focus().unsetColor().run()}
                            className="w-full mt-1 py-1 text-[10px] font-semibold text-zinc-500 hover:bg-zinc-50 rounded"
                        >
                            Reset Color
                        </button>
                    </PopoverContent>
                </Popover>

                {/* Highlight */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 relative">
                            <Highlighter className="h-3.5 w-3.5" />
                            <div className="absolute bottom-1.5 w-3 h-0.5 rounded-full" style={{ backgroundColor: editor.isActive('highlight') ? editor.getAttributes('highlight').color : 'transparent' }} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 flex flex-wrap gap-1" align="start">
                        {HIGHLIGHT_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                                className="w-6 h-6 rounded border border-zinc-200"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        <button
                            onClick={() => editor.chain().focus().unsetHighlight().run()}
                            className="w-full mt-1 py-1 text-[10px] font-semibold text-zinc-500 hover:bg-zinc-50 rounded"
                        >
                            Reset Highlight
                        </button>
                    </PopoverContent>
                </Popover>

                <div className="w-[1px] h-4 bg-zinc-100 mx-1" />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
                    <SubscriptIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
                    <SuperscriptIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting">
                    <Eraser className="h-3.5 w-3.5" />
                </ToolbarBtn>
            </div>

            {/* Block Styles */}
            <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1.5 mr-1">
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    active={editor.isActive('paragraph')}
                    title="Paragraph"
                >
                    <span className="text-[11px] font-semibold underline underline-offset-2">P</span>
                </ToolbarBtn>

                <Select
                    value={
                        editor.isActive('heading', { level: 1 }) ? 'h1' :
                            editor.isActive('heading', { level: 2 }) ? 'h2' :
                                editor.isActive('heading', { level: 3 }) ? 'h3' :
                                    editor.isActive('heading', { level: 4 }) ? 'h4' :
                                        editor.isActive('heading', { level: 5 }) ? 'h5' :
                                            editor.isActive('heading', { level: 6 }) ? 'h6' : ''
                    }
                    onValueChange={(v) => {
                        if (v) editor.chain().focus().toggleHeading({ level: parseInt(v.substring(1)) as any }).run();
                    }}
                >
                    <SelectTrigger className="h-8 w-[60px] text-[10px] font-semibold border-zinc-200 bg-zinc-50/50 hover:bg-white transition-all ml-1">
                        <SelectValue placeholder="H1" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="h1" className="text-xs font-semibold">Heading 1</SelectItem>
                        <SelectItem value="h2" className="text-xs font-semibold">Heading 2</SelectItem>
                        <SelectItem value="h3" className="text-xs font-semibold">Heading 3</SelectItem>
                        <SelectItem value="h4" className="text-xs font-semibold">Heading 4</SelectItem>
                        <SelectItem value="h5" className="text-xs font-semibold">Heading 5</SelectItem>
                        <SelectItem value="h6" className="text-xs font-semibold">Heading 6</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Layout & Lists */}
            <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1.5 mr-1">
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                    <List className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
                    <ListOrdered className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task List">
                    <CheckSquare className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                    <Quote className="h-3.5 w-3.5" />
                </ToolbarBtn>
            </div>

            {/* Links & Alignment */}
            <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1.5 mr-1">
                <ToolbarBtn onClick={() => setLinkDialogOpen(true)} active={editor.isActive('link')} title="Insert Link">
                    <LinkIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Unlink">
                    <Unlink className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <div className="w-[1px] h-4 bg-zinc-100 mx-0.5" />
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
                    <AlignLeft className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
                    <AlignCenter className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
                    <AlignRight className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Align Justify">
                    <AlignJustify className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <div className="w-[1px] h-4 bg-zinc-100 mx-0.5" />
                <ToolbarBtn onClick={() => (editor.chain() as any).focus().indent().run()} title="Indent">
                    <IndentIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => (editor.chain() as any).focus().outdent().run()} title="Outdent">
                    <OutdentIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
            </div>

            {/* Media & Objects */}
            <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1.5 mr-1">
                <ToolbarBtn onClick={() => setImageDialogOpen(true)} title="Insert Image">
                    <ImageIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => setVideoDialogOpen(true)} title="Insert YouTube Video">
                    <Video className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                    <Minus className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
                    <Code className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
                    <Code2 className="h-3.5 w-3.5" />
                </ToolbarBtn>
            </div>

            {/* Table Management */}
            <div className="flex items-center gap-0.5">
                <ToolbarBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">
                    <TableIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
                {editor.isActive('table') && (
                    <>
                        <ToolbarBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column">
                            <Plus className="h-3 w-3" />
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row">
                            <Plus className="h-3 w-3 rotate-90" />
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table" className="hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                        </ToolbarBtn>
                    </>
                )}
            </div>

            <ToolbarSep />

            {/* View & Utils */}
            <div className="flex items-center gap-0.5">
                <ToolbarBtn onClick={() => window.print()} title="Print">
                    <Printer className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={handleOpenInNewTab} title="Enter Focus Mode (Full Screen)">
                    <Maximize className="h-3.5 w-3.5" />
                </ToolbarBtn>
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
        </div>
    );
};

export function RichTextEditor({ content, onChange, placeholder = "Start writing your story..." }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Underline,
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
            TextAlign.configure({
                types: ['heading', 'paragraph', 'tableCell', 'tableHeader'],
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full border border-zinc-200 rounded-lg overflow-hidden my-6',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'bg-zinc-50 font-bold border-b border-zinc-200',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-zinc-200 p-3 text-sm',
                },
            }),
            Highlight.configure({ multicolor: true }),
            TextStyle,
            Color,
            Subscript,
            Superscript,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'rounded-lg bg-zinc-900 text-zinc-100 p-4 font-mono text-xs my-6',
                },
            }),
            Placeholder.configure({ placeholder }),
            CharacterCount,
            Typography,
            FontSize,
            LineHeight,
            FontFamily,
            Indent,
        ],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-zinc max-w-none focus:outline-none min-h-[500px]',
                    'px-12 py-16',
                    'font-sans leading-[1.8] text-foreground/90 selection:bg-indigo-100 selection:text-indigo-900',
                    'prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-zinc-900 prose-headings:font-semibold',
                    'prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-6 prose-h1:leading-tight',
                    'prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:leading-snug',
                    'prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3',
                    'prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2',
                    'prose-p:text-[15px] prose-p:mb-5 prose-p:text-zinc-600 leading-relaxed font-medium',
                    'prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 prose-blockquote:rounded-r-xl prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:not-italic prose-blockquote:my-8 prose-blockquote:text-indigo-900 prose-blockquote:font-serif prose-blockquote:text-lg',
                    'prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-[0.8em] prose-code:font-bold prose-code:before:content-none prose-code:after:content-none',
                    'prose-strong:text-zinc-900 prose-strong:font-black',
                    'prose-hr:border-border/60 prose-hr:my-10',
                    'prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border prose-img:border-border/40',
                    '[&_.task-list]:list-none [&_.task-list]:p-0',
                    '[&_.task-list_li]:flex [&_.task-list_li]:items-start [&_.task-list_li]:gap-3 [&_.task-list_li]:mb-2',
                    '[&_.task-list_input]:mt-1.5 [&_.task-list_input]:h-4 [&_.task-list_input]:w-4 [&_.task-list_input]:rounded [&_.task-list_input]:border-zinc-300',
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
        <div className="rounded-2xl overflow-hidden bg-background border border-border/40 shadow-sm relative hover:shadow-md transition-all duration-300">
            <MenuBar editor={editor} />

            <div className="bg-white/30 backdrop-blur-[1px] overflow-hidden transition-all">
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

                    <div className="h-4 w-[1px] bg-border/40 mx-1" />

                    {/* Active Selection Tags */}
                    <div className="flex items-center gap-1 overflow-hidden max-w-[300px]">
                        <span className="text-[8px] font-bold text-zinc-400 mr-1 uppercase">Selection:</span>
                        {editor && (() => {
                            const tags = [];
                            if (editor.isActive('heading', { level: 1 })) tags.push('H1');
                            else if (editor.isActive('heading', { level: 2 })) tags.push('H2');
                            else if (editor.isActive('heading', { level: 3 })) tags.push('H3');
                            else if (editor.isActive('paragraph')) tags.push('P');

                            if (editor.isActive('bold')) tags.push('Bold');
                            if (editor.isActive('italic')) tags.push('Italic');
                            if (editor.isActive('underline')) tags.push('U');
                            if (editor.isActive('strike')) tags.push('S');
                            if (editor.isActive('link')) tags.push('Link');
                            if (editor.isActive('code')) tags.push('Code');

                            const ff = editor.getAttributes('textStyle').fontFamily;
                            if (ff) {
                                const label = FONT_FAMILIES.find(f => f.value === ff)?.label || 'Custom Font';
                                tags.push(label);
                            }



                            const fs = editor.getAttributes('textStyle').fontSize;
                            if (fs) tags.push(fs);

                            return tags.map((tag, i) => (
                                <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded border border-zinc-200 whitespace-nowrap">
                                    {tag}
                                </span>
                            ));
                        })()}
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

export default RichTextEditor;

