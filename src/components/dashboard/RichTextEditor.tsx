"use client";
import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Typography } from '@tiptap/extension-typography';
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { FontSize, LineHeight, BlockStyles, FontTag } from './TipTapExtensions';

import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Undo,
    Redo,
    Code,
    Image as ImageIcon,
    Link as LinkIcon,
    Unlink,
    Underline as UnderlineIcon,
    Video,
    Upload,
    Check,
    FileText,
    ShieldCheck,
    ShieldOff,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Maximize,
    Palette,
    Table as TableIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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
                <div className="px-4 pt-4 pb-3 border-b border-zinc-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <LinkIcon className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-bold text-zinc-800 leading-none">Insert Link</DialogTitle>
                        <DialogDescription className="text-[11px] text-zinc-400 mt-0.5">URL and SEO link type</DialogDescription>
                    </div>
                </div>

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
        onInsert(url, alt || 'Image');
        onClose(); setUrl(''); setAlt('');
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[380px] rounded-2xl border-zinc-200 shadow-2xl p-0 overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-zinc-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                        <DialogTitle className="text-sm font-bold text-zinc-800 leading-none">Insert Image</DialogTitle>
                        <DialogDescription className="text-[11px] text-zinc-400 mt-0.5">Upload or paste a URL</DialogDescription>
                    </div>
                </div>

                <div className="px-4 py-4 space-y-3">
                    <div className="flex gap-3">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "h-[88px] w-[88px] shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden group",
                                url ? "border-amber-300 bg-amber-50/40" : "border-zinc-200 bg-zinc-50 hover:border-amber-400 hover:bg-amber-50/30"
                            )}
                        >
                            {url ? (
                                <img src={url} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 text-zinc-400 group-hover:text-amber-500 transition-colors">
                                    <Upload className="h-5 w-5" />
                                    <span className="text-[9px] font-bold text-center leading-tight">Click to<br />upload</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

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
                        </div>
                    </div>

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
                <div className="px-4 py-3 bg-zinc-50/80 border-t border-zinc-100 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs rounded-lg">Cancel</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={!url.trim()} className="h-8 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white">
                        <Check className="h-3 w-3 mr-1" /> Insert
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
                "h-7 w-7 inline-flex items-center justify-center rounded transition-all",
                "text-[#0ea5e9] hover:bg-[#ebf7f9]",
                active && "bg-[#ebf7f9] shadow-sm border border-[#bae6fd]",
                disabled && "opacity-40 pointer-events-none",
                cls,
            )}
        >
            {children}
        </button>
    );
}

function ToolbarSep() {
    return <div className="w-px h-5 bg-zinc-200 mx-1 shrink-0" />;
}

/* ─────────────────────────────────────────────
   Premium Minimal Toolbar
   ───────────────────────────────────────────── */
const MenuBar = ({ editor }: { editor: Editor | null }) => {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if (!editor) return;
        const handler = () => forceUpdate(n => n + 1);
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

    const fontFamilies = [
        { value: 'Inter', label: 'Inter' },
        { value: 'Arial', label: 'Arial' },
        { value: 'Georgia, serif', label: 'Georgia, Serif' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'Courier New', label: 'Courier New' },
        { value: 'Verdana', label: 'Verdana' },
        { value: 'Trebuchet MS', label: 'Trebuchet MS' },
        { value: 'Tahoma', label: 'Tahoma' },
        { value: 'Palatino Linotype', label: 'Palatino' },
        { value: 'Lucida Sans', label: 'Lucida Sans' },
        { value: 'Comic Sans MS', label: 'Comic Sans' },
        { value: 'Impact', label: 'Impact' },
    ];
    const currentFontFamily = editor.getAttributes('textStyle').fontFamily || 'Inter';

    const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];
    let currentFontSize = editor.getAttributes('textStyle').fontSize?.replace(/[^0-9.]/g, '') || '11';
    if (!fontSizes.includes(currentFontSize)) {
        currentFontSize = '11';
    }

    const currentHeadingLevel = editor.isActive('heading') ? `h${editor.getAttributes('heading').level}` : '';
    const headingLabel = currentHeadingLevel ? currentHeadingLevel.toUpperCase() : 'Heading';

    return (
        <div className="flex items-center gap-0.5 p-1 bg-white border-b border-zinc-200 sticky top-0 z-10 flex-wrap">
            {/* Font Family */}
            <div className="flex items-center hover:bg-[#ebf7f9] rounded transition-colors">
                <Select value={currentFontFamily} onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}>
                    <SelectTrigger className="h-7 w-24 px-1 text-[#0ea5e9] bg-transparent border-none shadow-none focus:ring-0 text-[11px]">
                        <span className="truncate">{fontFamilies.find(f => f.value === currentFontFamily)?.label || currentFontFamily}</span>
                    </SelectTrigger>
                    <SelectContent>
                        {fontFamilies.map(font => (
                            <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Font Size */}
            <div className="flex items-center hover:bg-[#ebf7f9] rounded transition-colors">
                <Select value={currentFontSize} onValueChange={(value) => editor.chain().focus().setFontSize(`${value}px`).run()}>
                    <SelectTrigger className="h-7 w-12 px-1 text-[#0ea5e9] bg-transparent border-none shadow-none focus:ring-0 text-[11px]">
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[4rem]">
                        {fontSizes.map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ToolbarSep />

            {/* Paragraph Button (standalone) */}
            <ToolbarBtn
                onClick={() => editor.chain().focus().setParagraph().run()}
                active={!editor.isActive('heading')}
                title="Paragraph"
            >
                <span className="text-xs font-bold">P</span>
            </ToolbarBtn>

            {/* Heading Dropdown (H1-H6 only) */}
            <div className="flex items-center hover:bg-[#ebf7f9] rounded transition-colors">
                <Select value={currentHeadingLevel || 'none'} onValueChange={(value) => {
                    if (value === 'none') return;
                    editor.chain().focus().toggleHeading({ level: parseInt(value.replace('h', '')) as any }).run();
                }}>
                    <SelectTrigger className="h-7 w-[4.5rem] px-1 text-[#0ea5e9] bg-transparent border-none shadow-none focus:ring-0 text-[11px]">
                        <span className="truncate">{currentHeadingLevel ? headingLabel : 'Heading'}</span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="h1">H1</SelectItem>
                        <SelectItem value="h2">H2</SelectItem>
                        <SelectItem value="h3">H3</SelectItem>
                        <SelectItem value="h4">H4</SelectItem>
                        <SelectItem value="h5">H5</SelectItem>
                        <SelectItem value="h6">H6</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <ToolbarSep />

            <div className="flex items-center">
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <Bold className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <Italic className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                    <Strikethrough className="h-4 w-4" />
                </ToolbarBtn>
                <div className="relative flex items-center justify-center h-7 w-7 text-[#0ea5e9] hover:bg-[#ebf7f9] rounded cursor-pointer transition-colors" title="Text Color">
                    <Palette className="h-4 w-4" />
                    <input
                        type="color"
                        onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                        value={editor.getAttributes('textStyle').color || '#000000'}
                        className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                </div>
            </div>

            <ToolbarSep />

            <div className="flex items-center">
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                    <List className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
                    <ListOrdered className="h-4 w-4" />
                </ToolbarBtn>
            </div>

            <ToolbarSep />

            <div className="flex items-center">
                <ToolbarBtn onClick={() => setLinkDialogOpen(true)} active={editor.isActive('link')} title="Link">
                    <LinkIcon className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => setImageDialogOpen(true)} title="Image">
                    <ImageIcon className="h-4 w-4" />
                </ToolbarBtn>
            </div>

            <ToolbarSep />

            <div className="flex items-center">
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
                    <AlignLeft className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
                    <AlignCenter className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
                    <AlignRight className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
                    <AlignJustify className="h-4 w-4" />
                </ToolbarBtn>
            </div>

            <ToolbarSep />

            <div className="flex items-center">
                <ToolbarBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={editor.isActive('table')} title="Insert Table">
                    <TableIcon className="h-4 w-4" />
                </ToolbarBtn>
            </div>

            <ToolbarSep />

            <div className="flex items-center">
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
                    <Undo className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
                    <Redo className="h-4 w-4" />
                </ToolbarBtn>
            </div>

            <ToolbarSep />

            <div className="flex items-center">
                <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Unlink" disabled={!editor.isActive('link')}>
                    <Unlink className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => {
                    const elem = document.getElementById('rich-text-editor-container');
                    if (elem) {
                        if (!document.fullscreenElement) {
                            elem.requestFullscreen().catch(err => console.log(err));
                        } else {
                            document.exitFullscreen();
                        }
                    }
                }} title="Fullscreen">
                    <Maximize className="h-4 w-4" />
                </ToolbarBtn>
            </div>

            <div className="flex-1" />

            <div className="flex items-center border border-zinc-200 rounded overflow-hidden">
                <button type="button" className="h-7 w-7 inline-flex items-center justify-center text-[#0ea5e9] hover:bg-[#ebf7f9] border-r border-zinc-200 transition-colors" title="Document Wrapper">
                    <FileText className="h-4 w-4" />
                </button>
                <button type="button" className="h-7 w-7 inline-flex items-center justify-center text-[#0ea5e9] hover:bg-[#ebf7f9] transition-colors" title="Code View" onClick={() => {
                    alert("Code View functionality to be implemented if needed. You are currently viewing WYSIWYG mode.");
                }}>
                    <Code className="h-4 w-4" />
                </button>
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
        </div>
    );
};

export function RichTextEditor({ content, onChange, placeholder = "Start writing your story..." }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] }
            }),
            Subscript,
            Superscript,
            TextStyle,
            FontFamily,
            Color,
            Highlight,
            FontSize,
            LineHeight,
            BlockStyles,
            FontTag,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#0ea5e9] underline underline-offset-4',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full block',
                },
            }),
            Youtube.configure({
                width: 640,
                height: 360,
            }),
            Placeholder.configure({ placeholder }),
            CharacterCount,
            Typography,
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full border border-zinc-200 text-sm my-4',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: { class: 'border border-zinc-200 bg-zinc-50 p-2 font-bold' }
            }),
            TableCell.configure({
                HTMLAttributes: { class: 'border border-zinc-200 p-2' }
            })
        ],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm max-w-none focus:outline-none min-h-[200px]',
                    'p-2 font-sans',
                    'prose-headings:text-[var(--tw-prose-headings)] prose-headings:font-bold',
                    'prose-h1:text-[32px] prose-h1:font-playfair',
                    'prose-h2:text-[24px] prose-h2:font-playfair',
                    'prose-h3:text-[18.72px] prose-h3:font-playfair',
                    'prose-p:text-[var(--tw-prose-body)] prose-p:my-2 prose-p:leading-[1.625]',
                    '[&_span]:inherit [&_p]:inherit'
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

    return (
        <div id="rich-text-editor-container" className="rounded border border-zinc-200 overflow-hidden bg-white shadow-sm flex flex-col w-full h-full transition-all">
            <MenuBar editor={editor} />
            <div className="flex-1 overflow-y-auto" style={{
                fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif'
            }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
