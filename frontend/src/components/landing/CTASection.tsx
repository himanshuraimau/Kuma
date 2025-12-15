import { Button } from '@/components/ui/button';

export const CTASection = () => {
    return (
        <section className="relative py-24 md:py-32 overflow-hidden bg-zinc-950 border-t border-zinc-900">
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Dot Pattern */}
            <div className="absolute inset-0 opacity-[0.15]" 
                style={{ backgroundImage: 'radial-gradient(#a1a1aa 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
            />

            <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Ready to Work <span className="text-orange-500">Smarter?</span>
                </h2>

                <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-xl mx-auto">
                    Join thousands of professionals using kuma-ai to enhance their productivity.
                </p>

                <div className="flex flex-col items-center gap-6">
                    <Button
                        className="h-14 px-8 text-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-600/20 hover:-translate-y-1 transition-all duration-300"
                    >
                        Start Your Free Trial
                    </Button>

                    <div className="space-y-2">
                        <p className="text-sm text-zinc-500">
                            No credit card required • 14-day free trial
                        </p>
                        <a href="#" className="block text-sm text-zinc-400 hover:text-white underline-offset-4 hover:underline transition-colors">
                            Already have an account? Log in
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};