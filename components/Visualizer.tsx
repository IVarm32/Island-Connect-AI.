import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
    volume: number; // 0 to 1
    active: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, active }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let bars = 30;
        const barWidth = canvas.width / bars;

        // Smooth volume transition
        let currentVolume = 0;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Interpolate volume for smoothness
            const targetVolume = active ? Math.max(0.1, volume * 4) : 0.05;
            currentVolume += (targetVolume - currentVolume) * 0.2;

            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#06b6d4'); // Cyan
            gradient.addColorStop(0.5, '#3b82f6'); // Blue
            gradient.addColorStop(1, '#8b5cf6'); // Violet

            ctx.fillStyle = gradient;

            for (let i = 0; i < bars; i++) {
                // Create a wave effect based on time and position
                const time = Date.now() / 200;
                const wave = Math.sin(time + i * 0.5) * 0.5 + 0.5; // 0 to 1

                // Height depends on volume and the wave
                const height = (currentVolume * canvas.height * 0.8) * wave + (currentVolume * 10);
                const x = i * barWidth;
                const y = (canvas.height - height) / 2;

                // Rounded bars
                ctx.beginPath();
                // @ts-ignore
                if (ctx.roundRect) {
                    ctx.roundRect(x + 2, y, barWidth - 4, height, 5);
                } else {
                    ctx.rect(x + 2, y, barWidth - 4, height);
                }
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [volume, active]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={80}
            className="w-full h-20 opacity-90"
        />
    );
};

export default Visualizer;
