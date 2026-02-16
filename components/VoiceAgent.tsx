import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, X } from 'lucide-react';
import { LiveClient } from '../services/liveClient';
import { ConnectionState } from '../types';
import Visualizer from './Visualizer';

const VoiceAgent: React.FC = () => {
    const [state, setState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
    const [volume, setVolume] = useState(0);
    const clientRef = useRef<LiveClient | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleConnection = async () => {
        if (state === ConnectionState.CONNECTED) {
            handleDisconnect();
        } else {
            handleConnect();
        }
    };

    const handleConnect = async () => {
        try {
            setState(ConnectionState.CONNECTING);
            setError(null);

            const client = new LiveClient(
                (vol) => setVolume(vol),
                () => handleDisconnect()
            );

            clientRef.current = client;
            await client.connect();
            setState(ConnectionState.CONNECTED);
        } catch (e: any) {
            console.error(e);
            const msg = e.message || "Failed to connect. Check microphone and API key.";
            setError(msg);
            setState(ConnectionState.ERROR);
            clientRef.current = null;
        }
    };

    const handleDisconnect = async () => {
        if (clientRef.current) {
            await clientRef.current.disconnect();
            clientRef.current = null;
        }
        setState(ConnectionState.DISCONNECTED);
        setVolume(0);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            handleDisconnect();
        };
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl blur opacity-25 animate-pulse-slow"></div>

            {/* Card Content */}
            <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">

                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${state === ConnectionState.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            {state === ConnectionState.CONNECTED ? 'Kai Active' : 'Kai Standby'}
                        </span>
                    </div>
                    {state === ConnectionState.CONNECTED && (
                        <button
                            onClick={handleDisconnect}
                            className="text-zinc-500 hover:text-white transition-colors"
                            title="Close Connection"
                            aria-label="Close Connection"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Visualizer Area */}
                <div className="h-32 flex items-center justify-center mb-6 relative">
                    {state === ConnectionState.DISCONNECTED && (
                        <div className="text-center">
                            <Sparkles className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-80" />
                            <p className="text-zinc-400 text-sm">Tap microphone to start<br />talking with Kai</p>
                        </div>
                    )}

                    {state === ConnectionState.CONNECTING && (
                        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                    )}

                    {state === ConnectionState.CONNECTED && (
                        <Visualizer volume={volume} active={true} />
                    )}

                    {state === ConnectionState.ERROR && (
                        <p className="text-red-400 text-sm text-center px-4">{error}</p>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-center">
                    <button
                        onClick={toggleConnection}
                        disabled={state === ConnectionState.CONNECTING}
                        title={state === ConnectionState.CONNECTED ? "Stop Conversation" : "Start Conversation"}
                        aria-label={state === ConnectionState.CONNECTED ? "Stop Conversation" : "Start Conversation"}
                        className={`
              relative group p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95
              ${state === ConnectionState.CONNECTED
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50'
                                : 'bg-white text-zinc-900 hover:bg-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.4)]'}
            `}
                    >
                        {state === ConnectionState.CONNECTED ? (
                            <MicOff className="w-6 h-6" />
                        ) : (
                            <Mic className="w-6 h-6" />
                        )}

                        {/* Ripple effect when disconnected (inviting click) */}
                        {state === ConnectionState.DISCONNECTED && (
                            <span className="absolute -inset-2 rounded-full border border-cyan-400/30 animate-ping opacity-75"></span>
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Powered by Gemini 2.0 Live</p>
                </div>
            </div>
        </div>
    );
};

export default VoiceAgent;
