import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface UseCaseProps {
    title: string;
    description: string;
    benefits: string[];
    mockupPosition: 'left' | 'right';
    imageSrc: string;
}

const UseCase = ({
    title,
    description,
    benefits,
    mockupPosition,
    imageSrc,
}: UseCaseProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const caseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.2 }
        );
        if (caseRef.current) observer.observe(caseRef.current);
        return () => observer.disconnect();
    }, []);

    const content = (
        <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <h3 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{title}</h3>
            <p className="text-lg leading-relaxed text-zinc-400">
                {description}
            </p>
            <ul className="space-y-4 mt-4">
                {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span className="text-base text-zinc-300">{benefit}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    const mockup = (
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="aspect-[16/10] w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-orange-500/30 transition-colors duration-500 shadow-2xl relative group">
                <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-zinc-950/10 group-hover:bg-transparent transition-colors duration-500" />
            </div>
        </div>
    );

    return (
        <div ref={caseRef} className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            {mockupPosition === 'left' ? <>{mockup}{content}</> : <>{content}{mockup}</>}
        </div>
    );
};

export const ExperienceSection = () => {
    const useCases = [
        {
            title: 'Start Your Day with Clarity',
            description: 'Get personalized morning briefings, optimize your schedule, and set clear priorities for the day ahead.',
            benefits: ['Morning briefings', 'Smart calendar organization', 'Priority setting'],
            mockupPosition: 'right' as const,
            imageSrc: '/landing1.png',
        },
        {
            title: 'Boost Your Workflow',
            description: 'Get real-time assistance, conduct quick research, and generate drafts faster than ever before.',
            benefits: ['Instant answers', 'Fast drafting', 'Research summaries'],
            mockupPosition: 'left' as const,
            imageSrc: '/landing2.png',
        },
        {
            title: 'Reflect and Recharge',
            description: 'Review your day, journal with AI-guided prompts, and prepare for tomorrow\'s challenges.',
            benefits: ['Daily reviews', 'AI journaling', 'Tomorrow\'s prep'],
            mockupPosition: 'right' as const,
            imageSrc: '/landing3.png',
        },
    ];

    return (
        <section id="experience" className="bg-zinc-950 py-24 md:py-32 relative">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Built for Your Day-to-Day</h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">From morning planning to evening reflection, kuma-ai adapts to your rhythm.</p>
                </div>
                <div className="space-y-32">
                    {useCases.map((useCase, index) => (
                        <UseCase key={index} {...useCase} />
                    ))}
                </div>
            </div>
        </section>
    );
};