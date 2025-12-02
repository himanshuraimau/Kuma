import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppsStore } from '@/stores/apps.store';
import { AppCard } from './AppCard';
import { ConnectedAppsList } from './ConnectedAppsList';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const AppsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { apps, connectedApps, isLoading, error, loadApps, loadConnectedApps, loadTools, connectApp, disconnectApp, clearError } = useAppsStore();

    // Check for OAuth callback success/error
    const success = searchParams.get('success');
    const callbackError = searchParams.get('error');
    const connectedAppName = searchParams.get('app');

    useEffect(() => {
        loadApps();
        loadConnectedApps();
        loadTools();
    }, [loadApps, loadConnectedApps, loadTools]);

    // Handle OAuth callback
    useEffect(() => {
        if (success === 'true' && connectedAppName) {
            // Reload apps after successful connection
            loadApps();
            loadConnectedApps();
            loadTools();

            // Clear URL parameters after a delay
            setTimeout(() => {
                setSearchParams({});
            }, 3000);
        }
    }, [success, connectedAppName, loadApps, loadConnectedApps, loadTools, setSearchParams]);

    const handleConnect = async (appName: string) => {
        await connectApp(appName);
    };

    const handleDisconnect = async (appName: string) => {
        try {
            await disconnectApp(appName);
            toast.success('App disconnected', {
                description: `Successfully disconnected from ${appName}`,
            });
        } catch (error) {
            toast.error('Failed to disconnect', {
                description: 'Please try again later',
            });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Apps</h1>
                    <p className="text-zinc-400 text-lg">
                        Connect apps to extend Kuma's capabilities
                    </p>
                </div>

                {/* Success Message */}
                {success === 'true' && connectedAppName && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <p className="text-green-400 font-medium">
                            Successfully connected {connectedAppName}! You can now use it in chat.
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {(error || callbackError) && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div className="flex-1">
                            <p className="text-red-400 font-medium">{error || callbackError}</p>
                        </div>
                        <button
                            onClick={() => {
                                clearError();
                                setSearchParams({});
                            }}
                            className="text-zinc-400 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Connected Apps */}
                <ConnectedAppsList apps={connectedApps} />

                {/* Available Apps */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Available Apps</h2>
                    {isLoading && apps.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {apps.map((app) => (
                                <AppCard
                                    key={app.id}
                                    app={app}
                                    onConnect={handleConnect}
                                    onDisconnect={handleDisconnect}
                                    isLoading={isLoading}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-zinc-100">How it works</h3>
                    <ol className="space-y-2 text-zinc-400">
                        <li className="flex gap-3">
                            <span className="text-orange-500 font-semibold">1.</span>
                            <span>Click "Connect" on any app above</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-orange-500 font-semibold">2.</span>
                            <span>Authorize Kuma to access your account</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-orange-500 font-semibold">3.</span>
                            <span>Use the app's features directly in chat (e.g., "send an email to john@example.com")</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
};
