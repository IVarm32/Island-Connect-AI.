import React from 'react';

const Header: React.FC = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Island Connect AI" className="h-10 w-auto" />
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    <a href="#" className="hover:text-white transition-colors">Services</a>
                    <a href="#" className="hover:text-white transition-colors">Agents</a>
                    <a href="#" className="hover:text-white transition-colors">About</a>
                    <a
                        href="https://islandconnectai.com/"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-4 py-2 bg-white text-zinc-950 rounded-full hover:bg-cyan-50 transition-colors font-semibold"
                    >
                        Book Consultation
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Header;
