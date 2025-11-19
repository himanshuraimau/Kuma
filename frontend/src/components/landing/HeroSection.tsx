import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrowserMockup } from './BrowserMockup';

export const HeroSection = () => {
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollIndicator(window.scrollY < 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section
            id="hero"
            className="relative min-h-[80vh] pt-[120px] pb-20 overflow-hidden"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                {/* Radial Gradient */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30"
                    style={{
                        background:
                            'radial-gradient(circle at 50% 0%, rgba(255, 107, 74, 0.15) 0%, transparent 50%)',
                    }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 grid-pattern opacity-60" />

                {/* Animated Gradient Orbs */}
                <div
                    className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full blur-3xl animate-float"
                    style={{
                        background: 'rgba(255, 107, 74, 0.15)',
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-float-slow"
                    style={{
                        background: 'rgba(255, 179, 71, 0.10)',
                        animationDelay: '2s',
                    }}
                />
                <div
                    className="absolute bottom-20 left-[10%] w-[400px] h-[400px] rounded-full blur-3xl animate-float"
                    style={{
                        background: 'rgba(88, 243, 212, 0.08)',
                        animationDelay: '4s',
                    }}
                />
            </div>

            {/* Content */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Left Column - Text Content */}
                    <div className="lg:col-span-7 space-y-8">
                        <h1
                            className="text-[40px] md:text-[56px] font-bold leading-[110%] text-cream max-w-[600px]"
                            style={{
                                background:
                                    'linear-gradient(135deg, #FFF5EE 0%, #FFB347 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Your Intelligent AI Assistant That Understands, Learns, and
                            Remembers
                        </h1>

                        <p className="text-[16px] md:text-[18px] leading-[1.6] text-warm-gray/90 max-w-[540px]">
                            Experience a web-based AI companion that adapts to your workflow,
                            remembers your preferences, and helps you accomplish more—right in
                            your browser.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="h-14 w-full sm:w-[180px] bg-coral hover:bg-coral/90 text-cream font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg"
                                style={{
                                    boxShadow: '0 8px 24px rgba(255, 107, 74, 0.3)',
                                }}
                            >
                                Start Free Trial
                            </Button>
                            <Button
                                variant="outline"
                                className="h-14 w-full sm:w-[180px] border-2 border-white/20 text-cream hover:bg-white/5 hover:border-coral/40 font-semibold rounded-xl transition-all"
                            >
                                See It in Action
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Browser Mockup */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <BrowserMockup />
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            {showScrollIndicator && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up">
                    <span className="text-warm-gray/60 text-xs uppercase tracking-wider">
                        Scroll to explore
                    </span>
                    <div className="w-6 h-10 border-2 border-warm-gray/30 rounded-full flex items-start justify-center p-2">
                        <ArrowDown
                            size={12}
                            className="text-warm-gray/60 animate-scroll-bounce"
                        />
                    </div>
                </div>
            )}
        </section>
    );
};
