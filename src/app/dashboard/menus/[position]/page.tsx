"use client"

import { use, useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
    ChevronLeft,
    Edit2,
    Loader2,
    Plus,
    Trash2,
    Save,
    X,
    GripVertical,
    Link as LinkIcon,
    Layers,
    Zap,
    ChevronDown,
    Palette,
    Layout,
    Type,
    ChevronRight,
    Eye,
    Monitor,
    Image as ImageIcon,
    Globe,
    Rocket,
    Search,
    Menu,
    Star,
    BookOpen,
    Building2,
    MapPin,
    Tag,
    Home,
    Info,
    Mail,
    Briefcase,
    TrendingUp,
    Users,
    Lightbulb,
    Newspaper,
    BarChart2,
    Cpu,
    ShoppingBag,
    Heart,
    Coffee,
    Flame,
    Compass,
    Award,
    HelpCircle,
    Navigation,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Icon map for nav items
const ICON_MAP: Record<string, React.ReactNode> = {
    "star": <Star className="h-4 w-4" />,
    "book-open": <BookOpen className="h-4 w-4" />,
    "building2": <Building2 className="h-4 w-4" />,
    "map-pin": <MapPin className="h-4 w-4" />,
    "tag": <Tag className="h-4 w-4" />,
    "home": <Home className="h-4 w-4" />,
    "info": <Info className="h-4 w-4" />,
    "mail": <Mail className="h-4 w-4" />,
    "briefcase": <Briefcase className="h-4 w-4" />,
    "trending-up": <TrendingUp className="h-4 w-4" />,
    "users": <Users className="h-4 w-4" />,
    "lightbulb": <Lightbulb className="h-4 w-4" />,
    "newspaper": <Newspaper className="h-4 w-4" />,
    "bar-chart": <BarChart2 className="h-4 w-4" />,
    "cpu": <Cpu className="h-4 w-4" />,
    "shopping-bag": <ShoppingBag className="h-4 w-4" />,
    "heart": <Heart className="h-4 w-4" />,
    "coffee": <Coffee className="h-4 w-4" />,
    "flame": <Flame className="h-4 w-4" />,
    "compass": <Compass className="h-4 w-4" />,
    "award": <Award className="h-4 w-4" />,
    "rocket": <Rocket className="h-4 w-4" />,
    "globe": <Globe className="h-4 w-4" />,
    "search": <Search className="h-4 w-4" />,
    "zap": <Zap className="h-4 w-4" />,
}

const ICON_OPTIONS = Object.keys(ICON_MAP)

export default function UnifiedMenuPage({ params }: { params: Promise<{ position: string }> }) {
    const { position } = use(params)
    const [items, setItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [positionLabel, setPositionLabel] = useState("")
    const [activeTab, setActiveTab] = useState<"structure" | "preview">("structure")

    // Logo/site settings
    const [siteSettings, setSiteSettings] = useState<{ site_name?: string; site_logo?: string } | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [siteName, setSiteName] = useState("")
    const [isSavingLogo, setIsSavingLogo] = useState(false)
    const logoInputRef = useRef<HTMLInputElement>(null)

    // Form state for new item
    const [showAddForm, setShowAddForm] = useState(false)
    const [pages, setPages] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [linkType, setLinkType] = useState<"custom" | "page" | "category">("custom")
    const [newFormData, setNewFormData] = useState<any>({
        label: "",
        url: "",
        order: "",
        is_active: true,
        parent: null,
        settings: {
            color: "",
            is_bold: false,
            is_mega_menu: false,
            dropdown_type: "standard",
            icon_name: "",
            font_family: "",
            font_size: ""
        }
    })

    const formRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setPositionLabel(position)
        fetchData()
        loadResources()
        loadSiteSettings()
    }, [position])

    const loadSiteSettings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/layout-settings/`)
            if (res.ok) {
                const data = await res.json()
                setSiteSettings(data)
                setSiteName(data.site_name || "StartupSaga")
                if (data.site_logo) setLogoPreview(data.site_logo)
            }
        } catch (e) {
            console.error("Failed to load site settings", e)
        }
    }

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/?position=${position}`)
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }

            const posRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/positions/`)
            if (posRes.ok) {
                const posData = await posRes.json()
                const current = posData.find((p: any) => p.id === position)
                if (current) setPositionLabel(current.label)
            }
        } catch (error) {
            toast.error("Failed to load menu data")
        } finally {
            setIsLoading(false)
        }
    }

    const loadResources = async () => {
        try {
            const [pRes, cRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/`)
            ])
            if (pRes.ok) setPages(await pRes.json())
            if (cRes.ok) setCategories(await cRes.json())
        } catch (e) {
            console.error("Resources load failed", e)
        }
    }

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoFile(file)
        const reader = new FileReader()
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
    }

    const handleSaveSiteSettings = async () => {
        setIsSavingLogo(true)
        try {
            const formData = new FormData()
            formData.append("site_name", siteName)
            if (logoFile) formData.append("site_logo", logoFile)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/layout-settings/update/`, {
                method: "PATCH",
                body: formData,
            })
            if (res.ok) {
                toast.success("Site settings saved!")
                loadSiteSettings()
                setLogoFile(null)
            } else {
                throw new Error("Failed")
            }
        } catch (e) {
            toast.error("Failed to save site settings")
        } finally {
            setIsSavingLogo(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this menu item and its sub-items?")) return
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/${id}/`, {
                method: "DELETE"
            })
            if (res.ok) {
                setItems((prev) => prev.filter((i) => i.id !== id))
                toast.success("Item removed")
            }
        } catch (error) {
            toast.error("Error deleting item")
        }
    }

    const handleLinkTypeChange = (type: "custom" | "page" | "category") => {
        setLinkType(type)
        setNewFormData((prev: any) => ({ ...prev, url: "" }))
    }

    const handleResourceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        if (!val) return

        let newUrl = ""
        let newLabel = newFormData.label

        if (linkType === "page") {
            const p = pages.find((x) => x.slug === val)
            newUrl = `/${val}`
            if (p && !newLabel) newLabel = p.title
        } else if (linkType === "category") {
            const c = categories.find((x) => x.slug === val)
            newUrl = `/category/${val}`
            if (c && !newLabel) newLabel = c.name
        }

        setNewFormData((prev: any) => ({ ...prev, url: newUrl, label: newLabel }))
    }

    const handleAddNew = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation/create/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newFormData,
                    position,
                    order: newFormData.order ? parseInt(newFormData.order) : undefined
                })
            })

            if (res.ok) {
                toast.success("Item added to menu")
                setNewFormData({
                    label: "",
                    url: "",
                    order: "",
                    is_active: true,
                    parent: null,
                    settings: {
                        color: "",
                        is_bold: false,
                        is_mega_menu: false,
                        dropdown_type: "standard",
                        icon_name: "",
                        font_family: "",
                        font_size: ""
                    }
                })
                setShowAddForm(false)
                fetchData()
            } else {
                throw new Error("Failed to add")
            }
        } catch (error) {
            toast.error("Failed to add menu item")
        } finally {
            setIsSaving(false)
        }
    }

    // Top-level nav items for preview
    const topLevelItems = items
        .filter((i) => !i.parent && i.is_active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

    // Helper to render hierarchical list
    const renderItems = (parentId: number | null = null, depth = 0) => {
        const filtered = items.filter((item) => item.parent === parentId)
        if (filtered.length === 0) return null

        return (
            <div className={cn("divide-y divide-zinc-100", depth > 0 && "pl-8 bg-purple-50/20 border-l-2 border-purple-100")}>
                {filtered.map((item) => (
                    <div key={item.id}>
                        <div className="group flex items-center justify-between p-3 px-5 hover:bg-zinc-50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="cursor-move opacity-0 group-hover:opacity-30 hover:opacity-100 transition-opacity">
                                    <GripVertical className="h-4 w-4 text-zinc-400" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        {depth > 0 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
                                        {item.settings?.icon_name && ICON_MAP[item.settings.icon_name] && (
                                            <span className="text-zinc-400 [&>svg]:h-3.5 [&>svg]:w-3.5">
                                                {ICON_MAP[item.settings.icon_name]}
                                            </span>
                                        )}
                                        <span
                                            className="font-bold text-sm text-zinc-800"
                                            style={{ color: item.settings?.color || undefined, fontWeight: item.settings?.is_bold ? "900" : "700" }}
                                        >
                                            {item.label}
                                        </span>
                                        {!item.is_active && (
                                            <span className="text-[9px] font-black uppercase tracking-tighter bg-zinc-100 text-zinc-400 px-1.5 py-0.5 rounded-md">
                                                Inactive
                                            </span>
                                        )}
                                        {items.some((child) => child.parent === item.id) && (
                                            <span className="text-[9px] font-black uppercase tracking-tighter bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded-md border border-purple-100">
                                                Dropdown
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                                        <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/70">#{item.order}</span>
                                        <span className="truncate max-w-[200px]">{item.url || "(No link — Parent Only)"}</span>
                                        {item.settings?.icon_name && (
                                            <span className="bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded border border-purple-100 text-[9px]">
                                                icon: {item.settings.icon_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/dashboard/menus/${position}/${item.id}/edit`}
                                    className="h-8 w-8 rounded-xl border border-zinc-200 bg-white hover:border-purple-300 hover:text-purple-600 text-zinc-400 flex items-center justify-center shadow-sm transition-all"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="h-8 w-8 rounded-xl border border-zinc-200 bg-white hover:border-rose-200 hover:bg-rose-50 text-zinc-400 hover:text-rose-500 flex items-center justify-center shadow-sm transition-all"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        {renderItems(item.id, depth + 1)}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans pb-10">
            <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                            <Navigation className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Navigation</p>
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900 capitalize">{positionLabel} Menu</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Back button */}
                        <Link
                            href="/dashboard/menus"
                            className="h-9 w-9 rounded-xl border border-zinc-200 hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm transition-all flex items-center justify-center"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </Link>

                        {/* Tab switcher */}
                        <div className="flex items-center gap-0.5 bg-zinc-100 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab("structure")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    activeTab === "structure" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <Layers className="h-3.5 w-3.5" /> Structure
                            </button>
                            <button
                                onClick={() => setActiveTab("preview")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    activeTab === "preview" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <Eye className="h-3.5 w-3.5" /> Preview
                            </button>
                        </div>

                        {!showAddForm && activeTab === "structure" && (
                            <button
                                onClick={() => {
                                    setShowAddForm(true)
                                    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
                                }}
                                className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Item
                            </button>
                        )}
                    </div>
                </div>

                {/* ── PREVIEW TAB ── */}
                {activeTab === "preview" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* Live Header Preview */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Monitor className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Header Preview — Live</span>
                                <span className="ml-auto text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">LIVE</span>
                            </div>
                            <div className="bg-white border-b border-zinc-100 px-8 py-4">
                                <div className="flex items-center justify-between max-w-7xl mx-auto">
                                    <div className="flex items-center gap-10">
                                        <div className="flex items-center gap-3 select-none">
                                            {logoPreview ? (
                                                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    <img src={logoPreview} alt={siteName} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center flex-shrink-0">
                                                    <span className="font-serif text-xl font-black">{siteName.charAt(0)}</span>
                                                </div>
                                            )}
                                            <span className="font-serif text-xl font-bold text-[#0F172A] leading-none">{siteName}</span>
                                        </div>

                                        <nav className="flex items-center gap-1">
                                            {topLevelItems.map((link) => {
                                                const icon = link.settings?.icon_name ? ICON_MAP[link.settings.icon_name] : null
                                                const hasChildren = items.some((i) => i.parent === link.id)
                                                return (
                                                    <div
                                                        key={link.id}
                                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-50 transition-all cursor-pointer"
                                                        style={{ color: link.settings?.color || undefined, fontWeight: link.settings?.is_bold ? "700" : undefined, fontFamily: link.settings?.font_family || undefined, fontSize: link.settings?.font_size || undefined }}
                                                    >
                                                        {icon && <span className="opacity-60 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
                                                        {link.label}
                                                        {hasChildren && <ChevronDown className="h-3 w-3 opacity-40" />}
                                                    </div>
                                                )
                                            })}
                                        </nav>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                                            <Search className="h-4 w-4" />
                                        </div>
                                        <div className="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
                                            <Rocket className="h-3.5 w-3.5" /> Submit Journey
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-2.5 bg-zinc-50 text-center text-[10px] text-zinc-400 font-medium">
                                ↑ Live preview — changes reflect after saving
                            </div>
                        </div>

                        {/* Logo & Site Identity */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <ImageIcon className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Logo & Site Identity</span>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Logo upload */}
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Site Logo</Label>
                                        <div
                                            className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
                                            onClick={() => logoInputRef.current?.click()}
                                        >
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="h-16 w-auto object-contain" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-zinc-300" />
                                                </div>
                                            )}
                                            <p className="text-xs text-zinc-400 font-medium group-hover:text-purple-600 transition-colors">
                                                {logoPreview ? "Click to change logo" : "Click to upload logo"}
                                            </p>
                                            <p className="text-[10px] text-zinc-300">PNG, SVG, WebP recommended</p>
                                        </div>
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoFileChange}
                                        />
                                        {logoPreview && (
                                            <button
                                                onClick={() => { setLogoPreview(null); setLogoFile(null) }}
                                                className="w-full h-9 rounded-xl text-xs font-bold text-rose-500 border border-rose-200 hover:bg-rose-50 transition-all"
                                            >
                                                Remove Logo
                                            </button>
                                        )}
                                    </div>

                                    {/* Site name */}
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Site Name</Label>
                                            <Input
                                                value={siteName}
                                                onChange={(e) => setSiteName(e.target.value)}
                                                placeholder="e.g. StartupSaga"
                                                className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all"
                                            />
                                            <p className="text-[10px] text-zinc-400">Shown next to the logo in the header.</p>
                                        </div>

                                        {/* Mini preview */}
                                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <p className="text-[9px] uppercase font-bold text-zinc-400 mb-3">Preview</p>
                                            <div className="flex items-center gap-3">
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt={siteName} className="w-8 h-8 object-contain rounded-lg" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
                                                        <span className="font-serif text-base font-black">{siteName.charAt(0) || "S"}</span>
                                                    </div>
                                                )}
                                                <span className="font-serif text-lg font-bold text-[#0F172A]">{siteName || "StartupSaga"}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSaveSiteSettings}
                                            disabled={isSavingLogo}
                                            className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {isSavingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                            {isSavingLogo ? "Saving..." : "Save Site Identity"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nav Quick View */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <Menu className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nav Items ({topLevelItems.length})</span>
                                </div>
                                <button
                                    onClick={() => setActiveTab("structure")}
                                    className="h-7 px-3 rounded-lg text-xs font-bold text-zinc-500 border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center gap-1.5"
                                >
                                    <Edit2 className="h-3 w-3" /> Edit Structure
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="flex flex-wrap gap-2">
                                    {topLevelItems.map((item) => {
                                        const icon = item.settings?.icon_name ? ICON_MAP[item.settings.icon_name] : null
                                        const hasChildren = items.some((i) => i.parent === item.id)
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:border-purple-200"
                                                style={{ color: item.settings?.color || undefined }}
                                            >
                                                {icon && <span className="opacity-50 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>}
                                                <span>{item.label}</span>
                                                {hasChildren && <ChevronDown className="h-3 w-3 opacity-40" />}
                                                <Link href={`/dashboard/menus/${position}/${item.id}/edit`}>
                                                    <Edit2 className="h-3 w-3 text-zinc-300 hover:text-purple-500 transition-colors" />
                                                </Link>
                                            </div>
                                        )
                                    })}
                                    {topLevelItems.length === 0 && (
                                        <p className="text-xs text-zinc-400 italic">No nav items yet. Switch to Structure tab to add some.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STRUCTURE TAB ── */}
                {activeTab === "structure" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* Menu items list */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Layers className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Menu Structure & Hierarchy</span>
                                <span className="ml-auto text-[10px] font-bold text-zinc-400">{items.length} items</span>
                            </div>

                            {isLoading ? (
                                <div className="p-12 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="p-14 text-center flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                        <LinkIcon className="h-6 w-6 text-purple-300" />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-400">No links in this menu yet</p>
                                    <p className="text-xs text-zinc-300">Click "Add Item" to get started</p>
                                </div>
                            ) : (
                                renderItems(null)
                            )}
                        </div>

                        {/* Add Item Form */}
                        {showAddForm && (
                            <div ref={formRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-md shadow-purple-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-purple-100 bg-purple-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-6 w-6 rounded-lg bg-purple-600 flex items-center justify-center">
                                                <Plus className="h-3 w-3 text-white" />
                                            </div>
                                            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Add Menu Item</span>
                                        </div>
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="h-7 w-7 rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700 flex items-center justify-center shadow-sm transition-all"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddNew} className="p-5 space-y-5">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                            {/* Column 1: Core Link Data */}
                                            <div className="space-y-5">

                                                {/* Parent + Label */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Parent</Label>
                                                        <select
                                                            className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 focus:bg-white outline-none transition-all"
                                                            value={newFormData.parent || ""}
                                                            onChange={(e) =>
                                                                setNewFormData((prev: any) => ({ ...prev, parent: e.target.value ? parseInt(e.target.value) : null }))
                                                            }
                                                        >
                                                            <option value="">Root Level</option>
                                                            {items
                                                                .filter((i) => !i.parent)
                                                                .map((i) => (
                                                                    <option key={i.id} value={i.id}>Under: {i.label}</option>
                                                                ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Label</Label>
                                                        <Input
                                                            required
                                                            placeholder="e.g. Stories"
                                                            value={newFormData.label}
                                                            onChange={(e) => setNewFormData((prev: any) => ({ ...prev, label: e.target.value }))}
                                                            className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Link Source */}
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Link Source</Label>
                                                    <div className="flex gap-1.5">
                                                        {["custom", "page", "category"].map((type) => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                onClick={() => handleLinkTypeChange(type as any)}
                                                                className={cn(
                                                                    "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                                                                    linkType === type
                                                                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                                                        : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-purple-200 hover:text-purple-600"
                                                                )}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="p-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 space-y-3">
                                                        {linkType === "page" && (
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-black text-zinc-400 uppercase">Select Page</Label>
                                                                <select
                                                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold outline-none"
                                                                    onChange={handleResourceSelect}
                                                                    defaultValue=""
                                                                >
                                                                    <option value="">Choose a page...</option>
                                                                    {pages.map((p) => (
                                                                        <option key={p.slug} value={p.slug}>{p.title}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}

                                                        {linkType === "category" && (
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-black text-zinc-400 uppercase">Select Category</Label>
                                                                <select
                                                                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold outline-none"
                                                                    onChange={handleResourceSelect}
                                                                    defaultValue=""
                                                                >
                                                                    <option value="">Choose a category...</option>
                                                                    {categories.map((c) => (
                                                                        <option key={c.slug} value={c.slug}>{c.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}

                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] font-black text-zinc-400 uppercase">URL Target</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    placeholder={linkType === "custom" ? "e.g. /stories" : "Auto-generated"}
                                                                    value={newFormData.url}
                                                                    onChange={(e) => setNewFormData((prev: any) => ({ ...prev, url: e.target.value }))}
                                                                    readOnly={linkType !== "custom"}
                                                                    className={cn(
                                                                        "h-10 rounded-xl text-xs font-mono border-zinc-200 transition-all",
                                                                        linkType !== "custom" ? "bg-white" : "bg-white"
                                                                    )}
                                                                />
                                                                {linkType !== "custom" && (
                                                                    <Zap className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-purple-400 fill-current animate-pulse" />
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] text-zinc-400 italic">Leave empty to use as a dropdown trigger only.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Styling & Advanced */}
                                            <div className="space-y-5">

                                                {/* Icon Picker */}
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Star className="h-3 w-3" /> Nav Icon (optional)
                                                    </Label>
                                                    <div className="grid grid-cols-9 gap-1.5 p-3 bg-zinc-50 rounded-xl border border-zinc-200 max-h-36 overflow-y-auto">
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewFormData((prev: any) => ({ ...prev, settings: { ...prev.settings, icon_name: "" } }))}
                                                            className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                                                                !newFormData.settings.icon_name
                                                                    ? "bg-white shadow-sm border-purple-300 text-purple-500"
                                                                    : "border-transparent text-zinc-300 hover:bg-white hover:shadow-sm"
                                                            )}
                                                            title="No icon"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                        {ICON_OPTIONS.map((iconKey) => (
                                                            <button
                                                                key={iconKey}
                                                                type="button"
                                                                onClick={() => setNewFormData((prev: any) => ({ ...prev, settings: { ...prev.settings, icon_name: iconKey } }))}
                                                                className={cn(
                                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all border [&>svg]:h-3.5 [&>svg]:w-3.5",
                                                                    newFormData.settings.icon_name === iconKey
                                                                        ? "bg-white shadow-sm border-purple-300 text-purple-500"
                                                                        : "border-transparent text-zinc-400 hover:bg-white hover:shadow-sm"
                                                                )}
                                                                title={iconKey}
                                                            >
                                                                {ICON_MAP[iconKey]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {newFormData.settings.icon_name && (
                                                        <p className="text-[10px] text-purple-500 font-bold">Selected: {newFormData.settings.icon_name}</p>
                                                    )}
                                                </div>

                                                {/* Color + Dropdown style */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                                            <Palette className="h-3 w-3" /> Color
                                                        </Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="color"
                                                                value={newFormData.settings.color || "#0f172a"}
                                                                onChange={(e) =>
                                                                    setNewFormData((prev: any) => ({ ...prev, settings: { ...prev.settings, color: e.target.value } }))
                                                                }
                                                                className="h-10 w-12 p-1 rounded-xl border-zinc-200 cursor-pointer"
                                                            />
                                                            <Input
                                                                placeholder="#HEX"
                                                                value={newFormData.settings.color}
                                                                onChange={(e) =>
                                                                    setNewFormData((prev: any) => ({ ...prev, settings: { ...prev.settings, color: e.target.value } }))
                                                                }
                                                                className="h-10 flex-1 rounded-xl text-xs font-mono border-zinc-200 bg-zinc-50"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                                            <Layout className="h-3 w-3" /> Dropdown
                                                        </Label>
                                                        <select
                                                            className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 focus:bg-white outline-none transition-all"
                                                            value={newFormData.settings.dropdown_type}
                                                            onChange={(e) =>
                                                                setNewFormData((prev: any) => ({ ...prev, settings: { ...prev.settings, dropdown_type: e.target.value } }))
                                                            }
                                                        >
                                                            <option value="standard">Standard List</option>
                                                            <option value="mega">Mega Menu (Grid)</option>
                                                            <option value="icons">With Side Icons</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Typography */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                                            <Type className="h-3 w-3" /> Font
                                                        </Label>
                                                        <select
                                                            className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 focus:bg-white outline-none transition-all"
                                                            value={newFormData.settings.font_family || ""}
                                                            onChange={(e) =>
                                                                setNewFormData((prev: any) => ({ ...prev, settings: { ...prev.settings, font_family: e.target.value } }))
                                                            }
                                                        >
                                                            <option value="">Default</option>
                                                            <option value="'Inter', sans-serif">Inter</option>
                                                            <option value="'Roboto', sans-serif">Roboto</option>
                                                            <option value="'Outfit', sans-serif">Outfit</option>
                                                            <option value="'Georgia', serif">Georgia</option>
                                                            <option value="'Merriweather', serif">Merriweather</option>
                                                            <option value="'Playfair Display', serif">Playfair Display</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                                            <Type className="h-3 w-3" /> Size
                                                        </Label>
                                                        <select
                                                            className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 focus:bg-white outline-none transition-all"
                                                            value={newFormData.settings.font_size || ""}
                                                            onChange={(e) =>
                                                                setNewFormData((prev: any) => ({ ...prev, settings: { ...prev.settings, font_size: e.target.value } }))
                                                            }
                                                        >
                                                            <option value="">Default</option>
                                                            <option value="11px">11px — XS</option>
                                                            <option value="12px">12px — Small</option>
                                                            <option value="13px">13px — Medium</option>
                                                            <option value="14px">14px — Normal</option>
                                                            <option value="15px">15px — Comfortable</option>
                                                            <option value="16px">16px — Large</option>
                                                            <option value="18px">18px — XL</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Toggles */}
                                                <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                                                            <Type className="h-3.5 w-3.5 text-zinc-400" /> Bold
                                                        </div>
                                                        <Switch
                                                            checked={newFormData.settings.is_bold}
                                                            onCheckedChange={(val) =>
                                                                setNewFormData((prev: any) => ({ ...prev, settings: { ...prev.settings, is_bold: val } }))
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs font-bold text-zinc-700">Active</div>
                                                        <Switch
                                                            checked={newFormData.is_active}
                                                            onCheckedChange={(val) => setNewFormData((prev: any) => ({ ...prev, is_active: val }))}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Order */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Order</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Auto-appends if empty"
                                                        value={newFormData.order}
                                                        onChange={(e) => setNewFormData((prev: any) => ({ ...prev, order: e.target.value }))}
                                                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-all text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-purple-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                            {isSaving ? "Saving..." : "Create Menu Item"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}
