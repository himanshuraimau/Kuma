import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';

export const DashboardLayout = () => {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full bg-navy">
                <DashboardSidebar />
                <SidebarInset>
                    <main className="flex-1">
                        <Outlet />
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};
