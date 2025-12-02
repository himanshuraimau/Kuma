import type { BaseApp } from '../types/apps.types';

/**
 * App registry to manage all available apps
 */
class AppRegistry {
    private apps: Map<string, BaseApp> = new Map();

    /**
     * Register an app
     */
    register(app: BaseApp): void {
        this.apps.set(app.name, app);
        console.log(`✅ Registered app: ${app.displayName} (${app.name})`);
    }

    /**
     * Get an app by name
     */
    get(name: string): BaseApp | undefined {
        return this.apps.get(name);
    }

    /**
     * Get all registered apps
     */
    getAll(): BaseApp[] {
        return Array.from(this.apps.values());
    }

    /**
     * Get apps by category
     */
    getByCategory(category: string): BaseApp[] {
        return Array.from(this.apps.values()).filter(
            (app) => app.category === category
        );
    }

    /**
     * Check if an app is registered
     */
    has(name: string): boolean {
        return this.apps.has(name);
    }
}

export const appRegistry = new AppRegistry();
export type { BaseApp };
