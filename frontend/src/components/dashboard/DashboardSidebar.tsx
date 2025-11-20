import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
    LayoutGrid,
    ListChecks,
    FolderOpen,
    Brain,
    PenSquare,
    Search,
    Eye,
    ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { ChatHistoryItem } from '@/components/chat/ChatHistoryItem';
import { SearchDialog } from './SearchDialog';

export const DashboardSidebar = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const { state } = useSidebar();
    const [searchOpen, setSearchOpen] = useState(false);

    const { chats, currentChatId, loadChats, createNewChat, setCurrentChat, deleteChat } = useChatStore();

    // Load chats on mount
    useEffect(() => {
        loadChats();
    }, [loadChats]);

    const menuItems = [
        { icon: LayoutGrid, label: 'Apps', path: '/apps' },
        { icon: ListChecks, label: 'Prompts', path: '/prompts' },
        { icon: FolderOpen, label: 'Drive', path: '/drive' },
        { icon: Brain, label: 'Memories', path: '/memories' },
    ];

    const handleNewChat = () => {
        createNewChat();
    };

    return (
        <Sidebar className="border-r border-white/5" collapsible="icon">
            <SidebarHeader className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {state === 'expanded' ? (
                            <>
                                <img src="/kuma Logo.png" alt="Kuma" className="w-8 h-8 rounded-lg" />
                                <span className="text-cream font-semibold text-lg">Kuma</span>
                            </>
                        ) : (
                            <img src="/kuma Logo.png" alt="Kuma" className="w-8 h-8 rounded-lg" />
                        )}
                    </div>
                    <SidebarTrigger className="text-warm-gray hover:text-cream" />
                </div>

                <Button
                    onClick={handleNewChat}
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-charcoal/50 text-cream group-data-[collapsible=icon]:justify-center"
                >
                    <PenSquare className="w-4 h-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
                </Button>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.path}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.path}
                                        className="text-warm-gray hover:text-cream hover:bg-charcoal/50 data-[active=true]:bg-coral/20 data-[active=true]:text-coral"
                                    >
                                        <Link to={item.path}>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroupLabel className="flex items-center justify-between px-3 text-warm-gray">
                        <span>Chats</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="hover:text-cream transition-colors"
                                aria-label="Search chats"
                            >
                                <Search className="w-3 h-3" />
                            </button>
                            <Eye className="w-3 h-3" />
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {chats.length > 0 ? (
                            <div className="space-y-1 px-2">
                                {chats.map((chat) => (
                                    <ChatHistoryItem
                                        key={chat.id}
                                        id={chat.id}
                                        title={chat.title}
                                        updatedAt={chat.updatedAt}
                                        isActive={chat.id === currentChatId}
                                        onClick={() => setCurrentChat(chat.id)}
                                        onDelete={() => deleteChat(chat.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-warm-gray/60">
                                No chats yet. Start a new conversation!
                            </div>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3">
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-charcoal/50 transition-colors group-data-[collapsible=icon]:justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-coral-amber flex items-center justify-center text-cream font-semibold text-sm shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 text-left group-data-[collapsible=icon]:hidden">
                        <div className="text-sm font-medium text-cream">{user?.name || 'User'}</div>
                        <div className="text-xs text-warm-gray">Basic Plan</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-warm-gray group-data-[collapsible=icon]:hidden" />
                </button>
            </SidebarFooter>

            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </Sidebar>
    );
};
