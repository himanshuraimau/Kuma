import { Button } from '@/components/ui/button';

export const CTASection = () => {
    return (
        <section className="bg-gradient-coral-amber py-20 md:py-24 relative overflow-hidden">
            {/* Dot Pattern Overlay */}
            <div className="absolute inset-0 dot-pattern opacity-80" />

            <div className="max-w-[640px] mx-auto px-4 md:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-[40px] md:text-[48px] font-bold text-cream mb-6 leading-[120%]">
                    Ready to Work Smarter?
                </h2>

                <p className="text-[18px] text-cream/90 mb-10 leading-relaxed">
                    Join thousands of professionals using Kuma to enhance their
                    productivity
                </p>

                <Button
                    className="h-16 w-[260px] bg-cream text-charcoal font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 mb-6"
                    style={{
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    Start Your Free Trial
                </Button>

                <p className="text-[14px] text-cream/90 mb-4">
                    No credit card required • 14-day free trial
                </p>

                <a
                    href="#"
                    className="text-[14px] text-cream/90 hover:text-cream underline-offset-4 hover:underline transition-all"
                >
                    Already have an account? Log in
                </a>
            </div>
        </section>
    );
};
