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
        <div className="min-h-screen relative overflow-hidden" style={{
            background: 'linear-gradient(to right, rgb(26, 29, 46) 0%, rgb(26, 29, 46) 45%, rgb(42, 45, 58) 55%, rgb(42, 45, 58) 100%)'
        }}>
            {/* Header Navigation - Floating */}
            <header className="fixed inset-x-0 top-4 z-40 px-6 lg:px-8">
                <nav
                    className="mx-auto max-w-[1200px] h-16 flex items-center justify-between backdrop-blur-xl border border-white/10 rounded-xl px-6"
                    style={{
                        background: 'linear-gradient(to right, rgba(26, 29, 46, 0.9) 0%, rgba(26, 29, 46, 0.9) 45%, rgba(42, 45, 58, 0.9) 55%, rgba(42, 45, 58, 0.9) 100%)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                    }}
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/kuma Logo.png"
                            alt="Kuma Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-cream font-bold text-[20px]">Kuma</span>
                    </Link>

                    {/* Nav Link */}
                    <div className="flex items-center gap-2 text-[14px]">
                        <span className="text-warm-gray hidden sm:inline">{navLink.text}</span>
                        <Link
                            to={navLink.href}
                            className="text-warm-gray hover:text-cream transition-colors font-medium"
                        >
                            {navLink.linkText}
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex min-h-screen pt-24">
                {/* Left Side - Hero Content (hidden on mobile) */}
                <div className="hidden lg:flex lg:w-[45%] relative bg-navy">
                    {/* Background Effects */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Animated Gradient Orbs */}
                        <div
                            className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full blur-[80px] animate-pulse"
                            style={{
                                background: 'rgba(255, 107, 74, 0.12)',
                                animationDuration: '8s',
                            }}
                        />
                        <div
                            className="absolute bottom-20 right-20 w-[350px] h-[350px] rounded-full blur-[80px] animate-pulse"
                            style={{
                                background: 'rgba(255, 179, 71, 0.08)',
                                animationDuration: '10s',
                                animationDelay: '2s',
                            }}
                        />

                        {/* Grid Pattern */}
                        <div
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }}
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center w-full max-w-xl mx-auto px-8 xl:px-12">
                        <h1 className="text-[40px] xl:text-[44px] font-bold leading-[1.1] text-cream animate-in fade-in slide-in-from-left-8 duration-700">
                            {leftContent.headline}
                        </h1>

                        <p className="text-[15px] xl:text-[16px] text-warm-gray leading-relaxed mt-4 mb-8 animate-in fade-in duration-700 delay-200">
                            {leftContent.subheadline}
                        </p>

                        {/* Features List */}
                        <div className="space-y-3 mb-10 animate-in fade-in duration-700 delay-300">
                            {leftContent.features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-coral/10 border border-coral/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Icon size={16} className="text-coral" />
                                        </div>
                                        <span className="text-[14px] text-warm-gray/90">
                                            {feature.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mini Browser Mockup Preview */}
                        <div className="animate-in fade-in duration-700 delay-500">
                            <div
                                className="w-full max-w-[320px] h-[180px] bg-navy/40 border border-white/10 rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                                style={{
                                    boxShadow: '0 10px 40px rgba(255,107,74,0.15)',
                                }}
                            >
                                {/* Mini chat bubbles */}
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-end">
                                        <div className="bg-coral/20 border border-coral/30 rounded-lg rounded-tr-sm px-3 py-1.5 max-w-[70%]">
                                            <p className="text-cream text-xs">Help me get started</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="bg-charcoal/60 border border-white/10 rounded-lg rounded-tl-sm px-3 py-1.5 max-w-[80%]">
                                            <p className="text-cream/90 text-xs">
                                                I'll guide you through...
                                            </p>
                                        </div>
                                    </div>
                                    {/* Typing indicator */}
                                    <div className="flex justify-start">
                                        <div className="bg-charcoal/60 border border-white/10 rounded-lg rounded-tl-sm px-3 py-2 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-coral/60 rounded-full animate-typing-bounce" />
                                            <div
                                                className="w-1.5 h-1.5 bg-coral/60 rounded-full animate-typing-bounce"
                                                style={{ animationDelay: '200ms' }}
                                            />
                                            <div
                                                className="w-1.5 h-1.5 bg-coral/60 rounded-full animate-typing-bounce"
                                                style={{ animationDelay: '400ms' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Container */}
                <div className="w-full lg:w-[55%] bg-charcoal flex items-center justify-center px-6 py-8 lg:px-8 xl:px-12">
                    <div className="w-full max-w-[560px]">
                        {/* Form Card */}
                        <div
                            className="rounded-2xl border border-white/15 bg-charcoal/80 backdrop-blur-2xl p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500 delay-200"
                            style={{
                                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                            }}
                        >
                            {/* Card Header */}
                            <div className="mb-7 pb-5 border-b border-white/10">
                                <h2 className="text-[28px] font-semibold text-cream leading-tight">
                                    {title}
                                </h2>
                                <p className="text-[14px] text-warm-gray/80 leading-relaxed mt-2">
                                    {subtitle}
                                </p>
                            </div>

                            {/* Form Content */}
                            {children}
                        </div>

                        {/* Mobile Footer - Trust Badges */}
                        <div className="lg:hidden mt-6 pt-6 border-t border-white/10">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <Lock size={18} className="text-teal mx-auto mb-2" />
                                    <p className="text-[11px] text-warm-gray/60">Secure</p>
                                </div>
                                <div className="text-center">
                                    <Zap size={18} className="text-teal mx-auto mb-2" />
                                    <p className="text-[11px] text-warm-gray/60">Fast</p>
                                </div>
                                <div className="text-center">
                                    <Globe size={18} className="text-teal mx-auto mb-2" />
                                    <p className="text-[11px] text-warm-gray/60">Private</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
