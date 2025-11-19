import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface UseCaseProps {
    title: string;
    description: string;
    benefits: string[];
    mockupPosition: 'left' | 'right';
    mockupGradient: string;
}

const UseCase = ({
    title,
    description,
    benefits,
    mockupPosition,
    mockupGradient,
}: UseCaseProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const caseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (caseRef.current) {
            observer.observe(caseRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const content = (
        <div
            className={`space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
        >
            <h3 className="text-[32px] font-semibold text-cream">{title}</h3>
            <p className="text-[18px] leading-[1.6] text-warm-gray/80">
                {description}
            </p>
            <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-coral mt-1 flex-shrink-0" />
                        <span className="text-[16px] text-warm-gray/90">{benefit}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    const mockup = (
        <div
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
        >
            <div
                className="aspect-[16/10] max-w-[560px] rounded-xl border border-white/10 overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                style={{
                    boxShadow: '0 20px 60px rgba(255, 107, 74, 0.15)',
                    background: mockupGradient,
                }}
            >
                {/* Mockup placeholder - in a real app, this would be an actual interface screenshot */}
                <div className="w-full h-full flex items-center justify-center text-warm-gray/40">
                    <div className="text-center">
                        <div className="w-16 h-16 border-2 border-warm-gray/20 rounded-lg mx-auto mb-4" />
                        <p className="text-sm">Interface Preview</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={caseRef} className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {mockupPosition === 'left' ? (
                <>
                    {mockup}
                    {content}
                </>
            ) : (
                <>
                    {content}
                    {mockup}
                </>
            )}
        </div>
    );
};

export const ExperienceSection = () => {
    const useCases = [
        {
            title: 'Start Your Day with Clarity',
            description:
                'Get personalized morning briefings, optimize your schedule, and set clear priorities for the day ahead.',
            benefits: [
                'Get personalized morning briefings',
                'Review and organize your calendar',
                'Set priorities for the day ahead',
            ],
            mockupPosition: 'right' as const,
            mockupGradient:
                'linear-gradient(135deg, rgba(255, 107, 74, 0.1) 0%, rgba(255, 179, 71, 0.05) 100%)',
        },
        {
            title: 'Boost Your Workflow',
            description:
                'Get real-time assistance, conduct quick research, and generate drafts faster than ever before.',
            benefits: [
                'Get instant answers to complex questions',
                'Draft emails and documents faster',
                'Research and summarize information',
            ],
            mockupPosition: 'left' as const,
            mockupGradient:
                'linear-gradient(135deg, rgba(88, 243, 212, 0.1) 0%, rgba(255, 107, 74, 0.05) 100%)',
        },
        {
            title: 'Reflect and Recharge',
            description:
                'Review your day, journal with AI-guided prompts, and prepare for tomorrow\'s challenges.',
            benefits: [
                'Review accomplishments and learnings',
                'Journal with AI-guided prompts',
                'Prepare for tomorrow\'s challenges',
            ],
            mockupPosition: 'right' as const,
            mockupGradient:
                'linear-gradient(135deg, rgba(255, 179, 71, 0.1) 0%, rgba(88, 243, 212, 0.05) 100%)',
        },
    ];

    return (
        <section id="experience" className="bg-navy py-24 md:py-28 relative overflow-hidden">
            {/* Radial gradient background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    background:
                        'radial-gradient(circle at 30% 50%, rgba(88, 243, 212, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255, 107, 74, 0.15) 0%, transparent 50%)',
                }}
            />

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-[40px] font-bold text-cream">
                        Built for Your Day-to-Day
                    </h2>
                    <p className="text-[18px] text-warm-gray/80 max-w-2xl mx-auto">
                        From morning planning to evening reflection, Kuma adapts to your rhythm
                    </p>
                </div>

                {/* Use Cases */}
                <div className="space-y-28 md:space-y-32">
                    {useCases.map((useCase, index) => (
                        <UseCase key={index} {...useCase} />
                    ))}
                </div>
            </div>
        </section>
    );
};
