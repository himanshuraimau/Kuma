export const BrowserMockup = () => {
    return (
        <div className="relative w-full max-w-[600px] aspect-[16/10] animate-float-slow group">
            {/* Glow Effect behind browser */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            
            {/* Browser Window */}
            <div className="relative w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
                {/* Browser Header */}
                <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-3">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>

                    {/* URL Bar */}
                    <div className="flex-1 max-w-md bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-500 flex items-center justify-center font-mono">
                        <svg
                            className="w-3 h-3 mr-2 text-zinc-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        kuma.ai/app
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4 bg-zinc-950/50">
                    {/* User Message */}
                    <div className="flex justify-end animate-fade-in-up">
                        <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] shadow-lg shadow-orange-900/20">
                            <p className="text-sm font-medium">
                                Help me plan my day and prioritize tasks
                            </p>
                        </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start animate-fade-in-up delay-300">
                        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                I'll help you organize your day! Based on your calendar, I see
                                you have 3 meetings. Let me suggest a prioritized task list...
                            </p>
                        </div>
                    </div>

                    {/* Typing Indicator */}
                    <div className="flex justify-start animate-fade-in-up delay-600">
                        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};