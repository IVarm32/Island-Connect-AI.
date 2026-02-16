import React, { useState } from 'react';
import VoiceAgent from './components/VoiceAgent';
import { MessageSquare, X } from 'lucide-react';

const App: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-[380px] md:w-[400px] pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
                    <div className="relative group">
                        {/* Close button for the widget */}
                        <button
                            onClick={() => setIsOpen(false)}
                            title="Close chat"
                            className="absolute -top-12 right-0 p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors pointer-events-auto shadow-xl"
                        >
                            <X size={20} />
                        </button>
                        <VoiceAgent />
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    title="Open Kai AI Voice Assistant"
                    className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/20 hover:scale-110 active:scale-95 transition-all pointer-events-auto group relative"
                >
                    <div className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-20"></div>
                    <MessageSquare className="text-white w-7 h-7 group-hover:rotate-12 transition-transform" />
                </button>
            )}
        </div>
    );
};

export default App;
