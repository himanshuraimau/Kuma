import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConnectedApp } from '@/types/apps.types';

interface ConnectedAppsListProps {
    apps: ConnectedApp[];
}

export const ConnectedAppsList = ({ apps }: ConnectedAppsListProps) => {
    if (apps.length === 0) {
        return null;
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
            <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Connected Apps ({apps.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {apps.map((app) => (
                        <div
                            key={app.id}
                            className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                        >
                            <div className="text-3xl">{app.icon}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-200">{app.displayName}</p>
                                {app.metadata?.email && (
                                    <p className="text-xs text-zinc-500 truncate">{app.metadata.email}</p>
                                )}
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
