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
        } catch {
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
                        Connect apps to extend kuma-ai's capabilities
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
                            <span>Authorize kuma-ai to access your account</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-orange-500 font-semibold">3.</span>
                            <span>Use the app's features directly in chat</span>
                        </li>
                    </ol>
                    
                    <div className="mt-6 pt-6 border-t border-zinc-800">
                        <h4 className="text-sm font-semibold mb-3 text-zinc-300">Example commands</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                                <span className="text-blue-400 font-medium">📧 Gmail:</span>
                                <p className="text-zinc-400 mt-1">"Send an email to john@example.com"</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                                <span className="text-purple-400 font-medium">📅 Calendar:</span>
                                <p className="text-zinc-400 mt-1">"Schedule a meeting tomorrow at 2pm"</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                                <span className="text-purple-400 font-medium">📄 Docs:</span>
                                <p className="text-zinc-400 mt-1">"Create a document with meeting notes"</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                                <span className="text-orange-400 font-medium">💾 Drive:</span>
                                <p className="text-zinc-400 mt-1">"List my Drive files" or "Upload this to Drive"</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                                <span className="text-green-400 font-medium">📊 Sheets:</span>
                                <p className="text-zinc-400 mt-1">"Create a spreadsheet" or "Read data from sheet"</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                                <span className="text-pink-400 font-medium">📽️ Slides:</span>
                                <p className="text-zinc-400 mt-1">"Create a presentation about AI"</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                                <span className="text-cyan-400 font-medium">🐙 GitHub:</span>
                                <p className="text-zinc-400 mt-1">"List my repositories" or "Create an issue"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
