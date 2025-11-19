import { useEffect, useRef, useState } from 'react';
import { Cpu, Zap, TrendingUp, ShieldCheck, Lock, Globe, Code } from 'lucide-react';

interface TechCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const TechCard = ({ icon, title, description }: TechCardProps) => {
    return (
        <div className="glass border border-white/15 rounded-xl p-8 hover:bg-white/[0.08] hover:border-coral/30 transition-all duration-300">
            <div className="text-coral mb-4">{icon}</div>
            <h4 className="text-[18px] font-semibold text-cream mb-2">{title}</h4>
            <p className="text-[14px] leading-relaxed text-warm-gray/80">
                {description}
            </p>
        </div>
    );
};

export const TechnologySection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const techStack = [
        {
            icon: <Cpu size={24} />,
            title: 'Advanced Language Models',
            description: 'Powered by state-of-the-art LLMs for natural interactions',
        },
        {
            icon: <Zap size={24} />,
            title: 'Real-Time Processing',
            description: 'Lightning-fast responses with streaming technology',
        },
        {
            icon: <TrendingUp size={24} />,
            title: 'Adaptive Learning',
            description: 'Continuously improves based on your interactions',
        },
        {
            icon: <ShieldCheck size={24} />,
            title: 'Enterprise Security',
            description: 'Bank-level encryption and privacy protection',
        },
    ];

    const integrations = [
        'Google Workspace',
        'Slack',
        'Notion',
        'Trello',
        'Calendar',
        'GitHub',
        'Figma',
        'Zoom',
    ];

    const trustBadges = [
        { icon: <Lock size={16} />, text: 'End-to-End Encrypted' },
        { icon: <ShieldCheck size={16} />, text: 'SOC 2 Compliant' },
        { icon: <Globe size={16} />, text: 'GDPR Ready' },
        { icon: <Code size={16} />, text: 'Open API Access' },
    ];

    return (
        <section
            id="technology"
            ref={sectionRef}
            className="bg-charcoal py-24 md:py-28 relative overflow-hidden"
        >
            {/* Radial gradient background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    background:
                        'radial-gradient(circle at 20% 30%, rgba(88, 243, 212, 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255, 107, 74, 0.2) 0%, transparent 40%)',
                }}
            />

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-[40px] font-bold text-cream">
                        Built on Cutting-Edge Technology
                    </h2>
                    <p className="text-[18px] text-warm-gray/80 max-w-2xl mx-auto">
                        Advanced AI models with enterprise-grade security
                    </p>
                </div>

                {/* Tech Stack Highlights */}
                <div
                    className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    {techStack.map((tech, index) => (
                        <TechCard key={index} {...tech} />
                    ))}
                </div>

                {/* Integration Showcase */}
                <div
                    className={`bg-navy/40 border border-white/10 rounded-2xl p-10 md:p-12 mb-12 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    <h3 className="text-[28px] font-semibold text-cream mb-3 text-center">
                        Connect Your Workflow
                    </h3>
                    <p className="text-[16px] text-warm-gray/80 text-center mb-8">
                        Seamlessly integrates with tools you already use
                    </p>

                    {/* Integration Logos Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                        {integrations.map((integration, index) => (
                            <div
                                key={index}
                                className="aspect-square bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 hover:border-coral/30 transition-all duration-300 group"
                            >
                                <span className="text-xs text-warm-gray/60 group-hover:text-coral transition-colors text-center px-2">
                                    {integration}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust Badges */}
                <div
                    className={`flex flex-wrap justify-center gap-8 transition-all duration-700 delay-450 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    {trustBadges.map((badge, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="text-teal">{badge.icon}</div>
                            <span className="text-[14px] text-warm-gray">{badge.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
