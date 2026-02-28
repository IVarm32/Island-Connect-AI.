import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function inlineCSS() {
    return {
        name: 'inline-css',
        enforce: 'post' as const,
        generateBundle(options: any, bundle: any) {
            const cssFiles = Object.keys(bundle).filter(key => key.endsWith('.css'));
            if (cssFiles.length === 0) return;

            let cssCode = '';
            for (const cssFile of cssFiles) {
                // Fix relative font paths since CSS is moving from dist/assets/ to dist/
                let code = bundle[cssFile].source;
                code = code.replace(/url\((["']?)\.\//g, 'url($1./assets/');
                cssCode += code;
                delete bundle[cssFile]; // Remove CSS from bundle
            }

            const htmlFiles = Object.keys(bundle).filter(key => key.endsWith('.html'));
            for (const htmlFile of htmlFiles) {
                let htmlStr = bundle[htmlFile].source;
                // Replace stylesheet link with inline style
                htmlStr = htmlStr.replace(/<link[^>]*rel="stylesheet"[^>]*>/g, `<style>${cssCode}</style>`);
                bundle[htmlFile].source = htmlStr;
            }
        }
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [react(), inlineCSS()],
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
