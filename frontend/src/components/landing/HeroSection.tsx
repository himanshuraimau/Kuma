import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrowserMockup } from './BrowserMockup';

export const HeroSection = () => {
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);

    useEffect(() => {
        const handleScroll = () => setShowScrollIndicator(window.scrollY < 100);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section id="hero" className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 overflow-hidden bg-zinc-950">

            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                    src="/hero.png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950" />
            </div>

            <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 items-center">

                    {/* Left: Text */}
                    <div className="lg:col-span-7 space-y-8">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            Your Intelligent <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">AI Assistant</span>
                        </h1>

                        <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
                            Adapts to your workflow, remembers your preferences, and helps you accomplish more all in your browser.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button className="h-14 px-8 text-lg bg-orange-600 hover:bg-orange-500 text-white rounded-full shadow-lg shadow-orange-900/20 transition-all">
                                Start Free Trial
                            </Button>
                            <Button variant="outline" className="h-14 px-8 text-lg border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full bg-transparent">
                                See Demo
                            </Button>
                        </div>
                    </div>

                    {/* Right: Mockup */}
                    <div className="lg:col-span-5">
                        <BrowserMockup />
                    </div>
                </div>
            </div>

            {/* Scroll Hint */}
            {showScrollIndicator && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-zinc-600 text-xs uppercase tracking-widest">Scroll</span>
                    <ArrowDown className="w-4 h-4 text-zinc-600" />
                </div>
            )}
        </section>
    );
};