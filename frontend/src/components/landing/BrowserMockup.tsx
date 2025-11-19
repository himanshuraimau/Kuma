export const BrowserMockup = () => {
    return (
        <div
            className="relative w-full max-w-[600px] aspect-[16/10] animate-float-slow"
            style={{
                filter: 'drop-shadow(0 20px 60px rgba(255, 107, 74, 0.2))',
            }}
        >
            {/* Browser Window */}
            <div className="w-full h-full bg-[#0F1221] border border-white/10 rounded-xl overflow-hidden flex flex-col">
                {/* Browser Header */}
                <div className="h-10 bg-charcoal/80 border-b border-white/10 flex items-center px-4 gap-3">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>

                    {/* URL Bar */}
                    <div className="flex-1 max-w-md bg-navy/50 rounded-md px-3 py-1.5 text-xs text-warm-gray/60 flex items-center">
                        <svg
                            className="w-3 h-3 mr-2 text-warm-gray/40"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        kuma.ai/app
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
                    {/* User Message */}
                    <div className="flex justify-end animate-fade-in-up">
                        <div className="bg-coral/20 border border-coral/30 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                            <p className="text-cream text-sm">
                                Help me plan my day and prioritize tasks
                            </p>
                        </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start animate-fade-in-up delay-300">
                        <div className="bg-charcoal/60 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                            <p className="text-cream/90 text-sm leading-relaxed">
                                I'll help you organize your day! Based on your calendar, I see
                                you have 3 meetings. Let me suggest a prioritized task list...
                            </p>
                        </div>
                    </div>

                    {/* Typing Indicator */}
                    <div className="flex justify-start animate-fade-in-up delay-600">
                        <div className="bg-charcoal/60 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                            <div
                                className="w-2 h-2 bg-coral/60 rounded-full animate-typing-bounce"
                                style={{ animationDelay: '0ms' }}
                            />
                            <div
                                className="w-2 h-2 bg-coral/60 rounded-full animate-typing-bounce"
                                style={{ animationDelay: '200ms' }}
                            />
                            <div
                                className="w-2 h-2 bg-coral/60 rounded-full animate-typing-bounce"
                                style={{ animationDelay: '400ms' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
