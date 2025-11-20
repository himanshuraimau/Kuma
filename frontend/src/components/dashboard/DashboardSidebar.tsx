import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    Plus,
    Search,
    History,
    Settings,
    LogOut,
    ChevronsUpDown,
    PanelLeft
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { ChatHistoryItem } from '@/components/chat/ChatHistoryItem';
import { SearchDialog } from './SearchDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const DashboardSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { state, toggleSidebar } = useSidebar();
    const [searchOpen, setSearchOpen] = useState(false);

    const { chats, currentChatId, loadChats, createNewChat, setCurrentChat, deleteChat } = useChatStore();

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
        if (location.pathname !== '/chat') {
            navigate('/chat');
        }
    };

    return (
        <Sidebar className="border-r border-zinc-800 bg-zinc-950" collapsible="icon">

            {/* --- Header --- */}
            <SidebarHeader className="p-4 pb-2">
                {state === 'expanded' ? (
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <img src="/logo.png" alt="Kuma" className="w-8 h-8 shrink-0" />
                            <span className="text-zinc-100 font-semibold text-lg tracking-tight animate-in fade-in duration-300">Kuma</span>
                        </div>
                        <SidebarTrigger className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" />
                    </div>
                ) : (
                    <div className="flex items-center justify-center mb-4">
                        <Button
                            onClick={toggleSidebar}
                            variant="ghost"
                            className="w-8 h-8 p-0 relative group/trigger hover:bg-transparent"
                        >
                            <img
                                src="/logo.png"
                                alt="Kuma"
                                className="w-8 h-8 absolute inset-0 transition-opacity duration-200 group-hover/trigger:opacity-0"
                            />
                            <PanelLeft className="w-5 h-5 text-zinc-400 absolute inset-0 m-auto opacity-0 transition-opacity duration-200 group-hover/trigger:opacity-100" />
                        </Button>
                    </div>
                )}

                <Button
                    onClick={handleNewChat}
                    className="w-full justify-start gap-2 bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:aspect-square"
                >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden font-medium">New Chat</span>
                </Button>
            </SidebarHeader>

            {/* --- Content --- */}
            <SidebarContent className="px-2">
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.path}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.path}
                                        className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 data-[active=true]:bg-zinc-900 data-[active=true]:text-orange-500 transition-all duration-200"
                                    >
                                        <Link to={item.path} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4" />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Chat History Section */}
                <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-4">
                    <SidebarGroupLabel className="flex items-center justify-between px-2 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <span>Recent Chats</span>
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-900"
                            title="Search history"
                        >
                            <Search className="w-3 h-3" />
                        </button>
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        {chats.length > 0 ? (
                            <div className="space-y-0.5">
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
                            <div className="px-2 py-8 text-center">
                                <History className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                                <p className="text-xs text-zinc-600">No history yet</p>
                            </div>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* --- Footer --- */}
            <SidebarFooter className="p-4 border-t border-zinc-800 bg-zinc-950">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-zinc-900 transition-colors group-data-[collapsible=icon]:justify-center outline-none">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-medium text-xs shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>

                            <div className="flex-1 text-left min-w-0 group-data-[collapsible=icon]:hidden">
                                <div className="text-sm font-medium text-zinc-200 truncate">{user?.name || 'User'}</div>
                                <div className="text-[10px] text-zinc-500 truncate">Free Plan</div>
                            </div>

                            <ChevronsUpDown className="w-4 h-4 text-zinc-500 group-data-[collapsible=icon]:hidden" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-200">
                        <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-red-900/20 focus:text-red-400 text-red-500 cursor-pointer" onClick={logout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>

            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </Sidebar >
    );
};