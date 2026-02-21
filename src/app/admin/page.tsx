"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await loginAction(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    };

    if (!isMounted) {
        return <div className="min-h-screen bg-white" />;
    }

    return (
        <div className="min-h-screen w-full flex font-sans bg-white overflow-hidden">
            {/* Left Column - Illustration Area */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center bg-[#F8FAFC] p-12 overflow-hidden">
                {/* Vibrant Background Blurs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#FF5722]/20 to-[#FF8A65]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#6366F1]/20 to-[#A855F7]/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                {/* CSS Composition - Modern Abstract Art */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 w-[420px] h-[420px] flex items-center justify-center"
                >
                    {/* Main Glass Shape */}
                    <div className="relative w-72 h-72 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-white/60 flex flex-col items-center justify-center z-20">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#FF5722] to-[#FF8A65] rounded-3xl flex items-center justify-center shadow-lg shadow-[#FF5722]/30 mb-6 transform rotate-3">
                            <ShieldCheck className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Portal</h2>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Secure System Access</p>
                    </div>

                    {/* Static Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-[1.5rem] shadow-lg shadow-indigo-500/20 flex items-center justify-center z-10 opacity-80">
                        <div className="w-8 h-8 rounded-full bg-white/20" />
                    </div>

                    <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white rounded-full shadow-xl shadow-orange-500/10 flex items-center justify-center border border-white/50 z-10">
                        <div className="w-14 h-1 bg-slate-100 rounded-full" />
                    </div>

                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                </motion.div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative bg-white">
                <div className="w-full max-w-[380px] space-y-8">

                    {/* Header */}
                    <div className="text-center lg:text-left space-y-2">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                            <div className="h-9 w-9 bg-gradient-to-br from-[#FF5722] to-[#FF7043] rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">Admin</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Login</h1>
                        <p className="text-slate-500 text-sm font-medium">Please enter your credentials to continue.</p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(e);
                        }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Enter username"
                                required
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#FF5722]/20 focus:border-[#FF5722] transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#FF5722]/20 focus:border-[#FF5722] transition-all pr-10 placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="rounded-xl bg-red-50 border border-red-100 p-3 flex items-center gap-3"
                                >
                                    <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                                    <p className="text-red-600 text-xs font-bold">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#F4511E] hover:to-[#FF5722] text-white rounded-xl font-bold tracking-wide text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
