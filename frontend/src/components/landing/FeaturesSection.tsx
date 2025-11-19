import { useEffect, useRef, useState } from 'react';
import { Brain, MessageSquare, Database, Zap } from 'lucide-react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={cardRef}
            className={`glass border border-white/15 rounded-2xl p-8 md:p-10 transition-all duration-700 hover:-translate-y-2 hover:border-coral/40 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            style={{
                transitionDelay: isVisible ? `${delay}ms` : '0ms',
                boxShadow: '0 8px 30px rgba(255, 107, 74, 0.08)',
            }}
        >
            {/* Icon */}
            <div className="w-14 h-14 bg-coral/10 border border-coral/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-coral/20 transition-colors">
                <div className="text-coral">{icon}</div>
            </div>

            {/* Content */}
            <h3 className="text-[24px] font-semibold text-cream mb-3">{title}</h3>
            <p className="text-[16px] leading-relaxed text-warm-gray/80">
                {description}
            </p>
        </div>
    );
};

export const FeaturesSection = () => {
    const features = [
        {
            icon: <Brain size={28} />,
            title: 'Smart Context Awareness',
            description:
                'Understands your conversations and maintains context across sessions',
        },
        {
            icon: <MessageSquare size={28} />,
            title: 'Natural Conversations',
            description: 'Chat naturally with an AI that speaks like a human, not a robot',
        },
        {
            icon: <Database size={28} />,
            title: 'Persistent Memory',
            description:
                'Remembers your preferences, past conversations, and important details',
        },
        {
            icon: <Zap size={28} />,
            title: 'Task Automation',
            description:
                'Automate repetitive tasks and integrate with your favorite tools',
        },
    ];

    return (
        <section id="features" className="bg-charcoal py-24 md:py-28">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-[40px] font-bold text-cream">
                        Powerful Features, Seamless Experience
                    </h2>
                    <p className="text-[18px] text-warm-gray/80 max-w-2xl mx-auto">
                        Everything you need in an AI assistant, accessible from any device
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            delay={index * 150}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
