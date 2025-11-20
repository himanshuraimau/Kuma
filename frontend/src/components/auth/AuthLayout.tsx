import { Link } from 'react-router-dom';
import type { AuthLayoutProps } from '@/types/auth.types';
import { Lock, Zap, Globe } from 'lucide-react';

export const AuthLayout = ({
    title,
    subtitle,
    leftContent,
    navLink,
    children,
}: AuthLayoutProps) => {
    return (
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 relative overflow-hidden selection:bg-orange-500/30">

            {/* --- Navigation --- */}
            <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
                <nav className="mx-auto max-w-7xl flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">

                        <img src="/logo.png" alt="Logo" className="w-6 h-6" />

                        <span className="text-xl font-bold tracking-tight text-white">Kuma</span>
                    </Link>

                    {/* Nav Link */}
                    {navLink && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-zinc-500 hidden sm:inline">{navLink.text}</span>
                            <Link
                                to={navLink.href}
                                className="text-zinc-300 hover:text-orange-400 font-medium transition-colors"
                            >
                                {navLink.linkText}
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            <main className="flex min-h-screen w-full">

                {/* --- Left Side: Visuals (Hidden on Mobile) --- */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 items-center justify-center overflow-hidden">

                    {/* Background Ambience */}
                    <div className="absolute inset-0 w-full h-full">
                        {/* Grid */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                        {/* Glowing Orbs */}
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[128px] animate-pulse-glow" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[128px]" />
                    </div>

                    <div className="relative z-10 w-full max-w-lg px-12">
                        {/* Headline */}
                        <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {leftContent.headline}
                        </h1>

                        <p className="text-lg text-zinc-400 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                            {leftContent.subheadline}
                        </p>

                        {/* Features List */}
                        <div className="space-y-5 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            {leftContent.features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-orange-500/50 transition-colors">
                                            <Icon className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <span className="text-zinc-300 font-medium">
                                            {feature.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mini UI Mockup */}
                        <div className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-700 delay-500">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl opacity-30 blur"></div>
                            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl">
                                <div className="space-y-3">
                                    {/* User Msg */}
                                    <div className="flex justify-end">
                                        <div className="bg-orange-600 text-white text-xs py-2 px-3 rounded-2xl rounded-tr-sm">
                                            Analyze AAPL stock for me
                                        </div>
                                    </div>
                                    {/* AI Msg */}
                                    <div className="flex justify-start">
                                        <div className="bg-zinc-800 text-zinc-300 text-xs py-2 px-3 rounded-2xl rounded-tl-sm">
                                            Apple Inc. is currently trading at $182.50...
                                        </div>
                                    </div>
                                    {/* Typing Indicator */}
                                    <div className="flex gap-1 ml-1">
                                        <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce delay-150"></span>
                                        <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce delay-300"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Side: Form --- */}
                <div className="w-full lg:w-1/2 bg-zinc-950 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
                    <div className="w-full max-w-md space-y-8">

                        {/* Form Card */}
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-white">
                                    {title}
                                </h2>
                                <p className="mt-2 text-sm text-zinc-400">
                                    {subtitle}
                                </p>
                            </div>

                            {children}
                        </div>

                        {/* Footer Badges */}
                        <div className="grid grid-cols-3 gap-4 text-center opacity-60 hover:opacity-100 transition-opacity duration-300">
                            <div className="flex flex-col items-center gap-2">
                                <Lock className="w-4 h-4 text-zinc-500" />
                                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Secure</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Zap className="w-4 h-4 text-zinc-500" />
                                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Fast</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Globe className="w-4 h-4 text-zinc-500" />
                                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Global</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};