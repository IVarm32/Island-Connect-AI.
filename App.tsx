import React from 'react';
import Header from './components/Header';
import VoiceAgent from './components/VoiceAgent';
import Features from './components/Features';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30 selection:text-cyan-200">
            <Header />

            <main className="pt-32 pb-12 px-4 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] opacity-20 pointer-events-none">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full blur-[128px] animate-blob"></div>
                    <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-600 rounded-full blur-[128px] animate-blob" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                    {/* Hero Text */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span className="text-xs font-medium text-cyan-400 tracking-wide">AI-FIRST DEVELOPMENT</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                            The Future is <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                Conversational.
                            </span>
                        </h1>

                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Island Connect AI builds smart websites and voice agents that transform how you interact with customers. Experience our tech live right here.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <a
                                href="https://islandconnectai.com"
                                target="_blank"
                                rel="noreferrer"
                                className="px-8 py-4 bg-white text-zinc-950 rounded-full font-bold hover:bg-cyan-50 transition-colors shadow-lg shadow-white/10"
                            >
                                Book Consultation
                            </a>
                            <button className="px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-full font-medium hover:bg-zinc-800 transition-colors">
                                View Portfolio
                            </button>
                        </div>
                    </div>

                    {/* Voice Agent Demo */}
                    <div className="w-full">
                        <VoiceAgent />
                    </div>
                </div>
            </main>

            <Features />

            <footer className="border-t border-zinc-900 bg-zinc-950 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500 text-sm">
                    <p>&copy; 2024 Island Connect AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;
