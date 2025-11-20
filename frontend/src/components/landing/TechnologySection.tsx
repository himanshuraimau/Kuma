import { useEffect, useRef, useState } from 'react';
import { Cpu, Zap, TrendingUp, ShieldCheck, Lock, Globe, Code } from 'lucide-react';

interface TechCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const TechCard = ({ icon, title, description }: TechCardProps) => (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-900 hover:border-orange-500/30 transition-all duration-300 group">
        <div className="text-zinc-500 group-hover:text-orange-500 transition-colors mb-4">{icon}</div>
        <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
);

export const TechnologySection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const techStack = [
        { icon: <Cpu />, title: 'Advanced LLMs', description: 'State-of-the-art language models for natural interaction.' },
        { icon: <Zap />, title: 'Real-Time', description: 'Lightning-fast streaming responses.' },
        { icon: <TrendingUp />, title: 'Adaptive', description: 'Continuously learns from your preferences.' },
        { icon: <ShieldCheck />, title: 'Secure', description: 'Bank-level encryption and privacy protection.' },
    ];

    return (
        <section id="technology" ref={sectionRef} className="bg-zinc-950 py-24 md:py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Cutting-Edge Technology</h2>
                    <p className="text-lg text-zinc-400">Enterprise-grade security meets next-gen AI.</p>
                </div>

                <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {techStack.map((tech, i) => <TechCard key={i} {...tech} />)}
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center">
                    <h3 className="text-2xl font-semibold text-white mb-8">Seamless Integrations</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {['Google', 'Slack', 'Notion', 'Trello', 'Github', 'Figma', 'Zoom', 'Jira'].map((tool) => (
                            <div key={tool} className="h-12 flex items-center justify-center bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-500 text-sm hover:text-orange-500 hover:border-orange-500/30 transition-colors cursor-default">
                                {tool}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};