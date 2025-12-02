import { Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { App } from '@/types/apps.types';

interface AppCardProps {
    app: App;
    onConnect: (appName: string) => void;
    onDisconnect: (appName: string) => void;
    isLoading: boolean;
}

export const AppCard = ({ app, onConnect, onDisconnect, isLoading }: AppCardProps) => {
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'communication':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'productivity':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'development':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'storage':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 group">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{app.icon}</div>
                        <div>
                            <CardTitle className="text-zinc-100 flex items-center gap-2">
                                {app.displayName}
                                {app.isConnected && (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                                        <Check className="w-3 h-3 mr-1" />
                                        Connected
                                    </Badge>
                                )}
                            </CardTitle>
                            <Badge variant="outline" className={`mt-2 ${getCategoryColor(app.category)}`}>
                                {app.category}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-zinc-400 leading-relaxed">
                    {app.description}
                </CardDescription>
                {app.isConnected && app.metadata?.email && (
                    <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                        <p className="text-xs text-zinc-500">Connected as</p>
                        <p className="text-sm text-zinc-300 font-medium">{app.metadata.email}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {app.isConnected ? (
                    <Button
                        onClick={() => onDisconnect(app.name)}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-zinc-300 border-zinc-700"
                    >
                        Disconnect
                    </Button>
                ) : (
                    <Button
                        onClick={() => onConnect(app.name)}
                        disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
