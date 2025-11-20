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
        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={cardRef}
            className={`bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 md:p-10 transition-all duration-700 hover:-translate-y-2 hover:border-orange-500/40 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
        >
            <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-colors duration-300">
                <div className="text-zinc-400 group-hover:text-orange-500 transition-colors duration-300">
                    {icon}
                </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
            <p className="text-base leading-relaxed text-zinc-400">
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
            description: 'Understands your conversations and maintains context across sessions',
        },
        {
            icon: <MessageSquare size={28} />,
            title: 'Natural Conversations',
            description: 'Chat naturally with an AI that speaks like a human, not a robot',
        },
        {
            icon: <Database size={28} />,
            title: 'Persistent Memory',
            description: 'Remembers your preferences, past conversations, and important details',
        },
        {
            icon: <Zap size={28} />,
            title: 'Task Automation',
            description: 'Automate repetitive tasks and integrate with your favorite tools',
        },
    ];

    return (
        <section id="features" className="bg-zinc-950 py-24 md:py-32 border-y border-zinc-900/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Powerful Features
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Everything you need in an AI assistant, accessible from any device.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            delay={index * 100}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};