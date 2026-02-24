import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        target: 'esnext',
        minify: 'esbuild',
        cssMinify: true,
        rollupOptions: {
            input: {
                main: './index.html',
                privatePolicy: './private-policy.html'
            }
        }
    }
});
