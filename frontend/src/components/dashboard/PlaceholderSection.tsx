import type { LucideIcon } from 'lucide-react';

interface PlaceholderSectionProps {
    icon: LucideIcon;
    title: string;
    description?: string;
}

export const PlaceholderSection = ({ icon: Icon, title, description }: PlaceholderSectionProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-navy px-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-charcoal flex items-center justify-center">
                    <Icon className="w-10 h-10 text-coral" />
                </div>
                <h1 className="text-3xl font-semibold text-cream mb-3">{title}</h1>
                <p className="text-warm-gray text-lg">
                    {description || 'This section is coming soon. Stay tuned!'}
                </p>
            </div>
        </div>
    );
};
