import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GEMINI_MODEL, SYSTEM_INSTRUCTION } from '../constants';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

type AudioCallback = (volume: number) => void;

export class LiveClient {
    private ai: GoogleGenAI;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private inputSource: MediaStreamAudioSourceNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private outputNode: GainNode | null = null;
    private nextStartTime: number = 0;
    private sources: Set<AudioBufferSourceNode> = new Set();
    private session: any = null; // Type as 'any' because session type isn't fully exported in all versions yet
    private onDisconnect: () => void;
    private onVolumeChange: AudioCallback;
    private cleanupPromise: Promise<void> | null = null;

    constructor(onVolumeChange: AudioCallback, onDisconnect: () => void) {
        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (process as any).env.API_KEY;
        if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
            console.warn('Gemini API Key is missing or using placeholder.');
        }
        this.ai = new GoogleGenAI({ apiKey });
        this.onVolumeChange = onVolumeChange;
        this.onDisconnect = onDisconnect;
    }

    async connect() {
        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // Resume contexts if they are suspended (common browser policy)
        if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
        if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

        this.outputNode = this.outputAudioContext.createGain();
        this.outputNode.connect(this.outputAudioContext.destination);

        // Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Connect to Gemini
        const sessionPromise = this.ai.live.connect({
            model: GEMINI_MODEL,
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: SYSTEM_INSTRUCTION,
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
            callbacks: {
                onopen: () => {
                    console.log('Gemini Live Connection Opened');
                    this.startAudioInput(stream, sessionPromise);
                },
                onmessage: (message: LiveServerMessage) => this.handleMessage(message),
                onclose: () => {
                    console.log('Gemini Live Connection Closed');
                    this.onDisconnect();
                },
                onerror: (err) => {
                    console.error('Gemini Live Error:', err);
                    this.onDisconnect();
                },
            },
        });

        this.session = await sessionPromise;
    }

    private startAudioInput(stream: MediaStream, sessionPromise: Promise<any>) {
        if (!this.inputAudioContext) return;

        this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
        this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);

            // Calculate volume for visualizer
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            this.onVolumeChange(rms); // Update visualizer

            const pcmBlob = createBlob(inputData);

            sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };

        this.inputSource.connect(this.processor);
        this.processor.connect(this.inputAudioContext.destination);
    }

    private async handleMessage(message: LiveServerMessage) {
        if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;

            if (this.outputAudioContext && this.outputNode) {
                // Fix for time synchronization
                this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);

                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    this.outputAudioContext,
                    24000,
                    1
                );

                const source = this.outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.outputNode);

                source.addEventListener('ended', () => {
                    this.sources.delete(source);
                });

                source.start(this.nextStartTime);
                this.nextStartTime += audioBuffer.duration;
                this.sources.add(source);
            }
        }

        if (message.serverContent?.interrupted) {
            this.stopAudioOutput();
        }
    }

    private stopAudioOutput() {
        this.sources.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        this.sources.clear();
        this.nextStartTime = 0;
    }

    async disconnect() {
        if (this.session) {
            // session.close() is not always available in all SDK versions, but good practice
        }

        this.stopAudioOutput();

        if (this.inputSource) {
            this.inputSource.disconnect();
            this.inputSource = null;
        }
        if (this.processor) {
            this.processor.disconnect();
            this.processor.onaudioprocess = null;
            this.processor = null;
        }
        if (this.inputAudioContext) {
            await this.inputAudioContext.close();
            this.inputAudioContext = null;
        }
        if (this.outputAudioContext) {
            await this.outputAudioContext.close();
            this.outputAudioContext = null;
        }
    }
}
