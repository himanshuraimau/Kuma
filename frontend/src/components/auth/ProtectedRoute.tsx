import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, checkAuth, token } = useAuthStore();
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // If user is already authenticated (e.g., just signed up), skip auth check
        if (isAuthenticated && token) {
            setHasChecked(true);
            return;
        }

        // Only check auth once on mount if not already authenticated
        if (!hasChecked && token) {
            checkAuth().finally(() => setHasChecked(true));
        } else if (!token) {
            // No token, mark as checked so we can redirect
            setHasChecked(true);
        }
    }, [checkAuth, hasChecked, isAuthenticated, token]);

    // Show loading only during initial auth check
    if (!hasChecked || (isLoading && token)) {
        return (
            <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    {/* Glowing background effect behind spinner */}
                    <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin relative z-10" />
                </div>
                <p className="text-zinc-500 text-sm font-medium animate-pulse">
                    Authenticating...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};